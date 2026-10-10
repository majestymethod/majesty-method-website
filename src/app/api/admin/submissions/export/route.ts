import { db, audit } from '@/lib/db';
import { getForm } from '@/lib/content/store';
import { DEFAULT_FORMS, type FormKey } from '@/lib/forms/definitions';
import { requireUser, fail } from '@/lib/api';

const cell = (v: unknown) => {
  let s = Array.isArray(v) ? v.join('; ') : String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // prevent spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const form = new URL(req.url).searchParams.get('form') as FormKey | null;
  if (!form || !(form in DEFAULT_FORMS)) return fail(400, 'Choose a form to export.');
  const def = getForm(form);
  const rows = db().prepare('SELECT * FROM submissions WHERE form_key = ? ORDER BY created_at ASC').all(form) as { data: string; context: string | null; created_at: string; id: string; marketing_consent: number; review_status: string; source_page: string | null }[];
  const keys = new Set(def.fields.map((f) => f.key));
  for (const r of rows) for (const k of Object.keys(JSON.parse(r.data))) keys.add(k);
  const labels = [...keys].map((k) => def.fields.find((f) => f.key === k)?.label ?? k);
  const header = ['Submitted (UTC)', ...labels, 'Context', 'Marketing consent', 'Status', 'Source page', 'Submission ID'];
  const lines = [header.map(cell).join(',')];
  for (const r of rows) {
    const d = JSON.parse(r.data); const c = r.context ? JSON.parse(r.context) : {};
    lines.push([r.created_at, ...[...keys].map((k) => d[k]), c.webinarTitle || c.resourceTitle || '', r.marketing_consent ? 'yes' : 'no', r.review_status, r.source_page ?? '', r.id].map(cell).join(','));
  }
  audit(u.id, 'submission.export', form);
  return new Response('﻿' + lines.join('\r\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${form}-submissions-${new Date().toISOString().slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' },
  });
}
