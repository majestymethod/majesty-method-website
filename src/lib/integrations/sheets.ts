import 'server-only';
import { db } from '../db';
import { getForm } from '../content/store';
import type { FormKey } from '../forms/definitions';

export function sheetsConfigured(): boolean {
  return !!(process.env.SHEETS_WEBHOOK_URL && process.env.SHEETS_WEBHOOK_SECRET);
}

interface SubRow { id: string; form_key: string; data: string; email: string | null; created_at: string; sheets_status: string; sheets_attempts: number }

/** Build the header → value map that the Apps Script writes into the matching columns. */
export function buildSheetRow(formKey: FormKey, data: Record<string, unknown>, createdAt: string, email: string | null) {
  const def = getForm(formKey);
  const values: Record<string, string> = {};
  const textColumns: string[] = [];
  for (const f of def.fields) {
    if (!f.enabled) continue;
    const v = data[f.key];
    const str = Array.isArray(v) ? v.join(', ') : String(v ?? '');
    if (f.sheetColumn) { values[f.sheetColumn] = str; textColumns.push(f.sheetColumn); }
  }
  // Fields without a mapped column (e.g. an added question) are appended in a single notes column
  const extras = def.fields.filter((f) => f.enabled && !f.sheetColumn && data[f.key]).map((f) => `${f.label}: ${data[f.key]}`);
  if (extras.length) { values['Website: additional answers'] = extras.join('\n'); textColumns.push('Website: additional answers'); }
  if (def.sheets.respondentEmailColumn && email) { values[def.sheets.respondentEmailColumn] = email; textColumns.push(def.sheets.respondentEmailColumn); }
  return { sheetName: def.sheets.sheetName, timestampColumn: def.sheets.timestampColumn, timestamp: createdAt, values, textColumns };
}

/**
 * Sends one submission to Google Sheets via the Apps Script web app.
 * The website database remains the source of truth; this is a copy for the team's workflow.
 */
export async function syncSubmission(id: string): Promise<'synced' | 'failed' | 'not_configured' | 'not_applicable'> {
  const row = db().prepare('SELECT id, form_key, data, email, created_at, sheets_status, sheets_attempts FROM submissions WHERE id = ?').get(id) as SubRow | undefined;
  if (!row) return 'not_applicable';
  const def = getForm(row.form_key as FormKey);
  if (!def.sheets.enabled) return 'not_applicable';
  if (row.sheets_status === 'synced') return 'synced';
  if (!sheetsConfigured()) {
    db().prepare("UPDATE submissions SET sheets_status = 'not_configured' WHERE id = ?").run(id);
    return 'not_configured';
  }
  const payload = { secret: process.env.SHEETS_WEBHOOK_SECRET, submissionId: row.id, ...buildSheetRow(row.form_key as FormKey, JSON.parse(row.data), row.created_at, row.email) };
  let status: 'synced' | 'failed' = 'failed';
  let error: string | null = null;
  try {
    const res = await fetch(process.env.SHEETS_WEBHOOK_URL!, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      redirect: 'follow', signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let json: { ok?: boolean; error?: string; unknownHeaders?: string[] } = {};
    try { json = JSON.parse(text); } catch { error = `Unexpected response (HTTP ${res.status}). Check the Apps Script deployment URL and access setting.`; }
    if (json.ok) {
      status = 'synced';
      if (json.unknownHeaders?.length) error = `Synced. Columns not found in sheet: ${json.unknownHeaders.join(', ')}`;
    } else if (!error) error = (json.error || `HTTP ${res.status}`).slice(0, 300);
  } catch (e) {
    error = e instanceof Error ? e.message.slice(0, 300) : 'Network error';
  }
  db().prepare('UPDATE submissions SET sheets_status = ?, sheets_attempts = sheets_attempts + 1, sheets_error = ? WHERE id = ?').run(status, error, id);
  // Log without personal information
  if (status === 'failed') console.error(`[sheets] sync failed for submission ${id}: ${error}`);
  return status;
}

export async function retryPendingSheets(limit = 50) {
  const rows = db().prepare("SELECT id FROM submissions WHERE sheets_status IN ('pending','failed','not_configured') ORDER BY created_at ASC LIMIT ?").all(limit) as { id: string }[];
  const results: Record<string, number> = {};
  for (const r of rows) {
    const s = await syncSubmission(r.id);
    results[s] = (results[s] ?? 0) + 1;
  }
  return results;
}
