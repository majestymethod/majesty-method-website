import 'server-only';
import crypto from 'node:crypto';
import { after } from 'next/server';
import { db, now } from '../db';
import { getForm, getItem, getSettings } from '../content/store';
import { validateValues } from './validate';
import type { FormKey } from './definitions';
import { checkFormRenderToken, clientIp, ipHash, rateLimit, sameOrigin, signToken } from '../security';
import { syncSubmission } from '../integrations/sheets';
import { emailConfigured, fillTemplate, sendEmail } from '../integrations/email';
import { getFile } from '../media';

const FORM_KEYS: FormKey[] = ['bootcamp', 'webinar', 'acceleration', 'tenderiq', 'contact', 'resource'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SubmitResult {
  ok: boolean;
  status: number;
  message?: string;
  errors?: Record<string, string>;
  successTitle?: string;
  successMessage?: string;
  extra?: { joining?: string; downloadUrl?: string; webinarTitle?: string };
  duplicate?: boolean;
}

const json = (r: SubmitResult) => Response.json(r, { status: r.status });

interface Body {
  values?: Record<string, unknown>;
  idempotencyKey?: string;
  renderToken?: string;
  privacyAck?: boolean;
  marketingConsent?: boolean;
  sourcePage?: string;
  context?: { webinarId?: string; resourceId?: string };
  hp?: string; // honeypot
}

export async function handleSubmission(req: Request, formKeyParam: string): Promise<Response> {
  if (!FORM_KEYS.includes(formKeyParam as FormKey)) return json({ ok: false, status: 404, message: 'Form not found.' });
  const formKey = formKeyParam as FormKey;
  if (!sameOrigin(req)) return json({ ok: false, status: 403, message: 'This request was blocked. Reload the page and try again.' });
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json({ ok: false, status: 415, message: 'Unsupported request.' });

  const ip = clientIp(req.headers);
  if (!rateLimit(`form:${formKey}:${ip}`, 8, 10 * 60_000)) {
    return json({ ok: false, status: 429, message: 'Too many submissions from this connection. Wait a few minutes, then try again.' });
  }

  let body: Body;
  try {
    const text = await req.text();
    if (text.length > 64_000) return json({ ok: false, status: 413, message: 'Your submission is too long. Shorten your answers and try again.' });
    body = JSON.parse(text);
  } catch {
    return json({ ok: false, status: 400, message: 'The form could not be read. Reload the page and try again.' });
  }

  const def = getForm(formKey);

  // Spam checks. Bots get a neutral response and nothing is stored.
  const tokenCheck = checkFormRenderToken(body.renderToken, formKey);
  if (body.hp || tokenCheck === 'too_fast') {
    return json({ ok: true, status: 200, successTitle: def.successTitle, successMessage: def.successMessage });
  }
  if (tokenCheck === 'invalid') return json({ ok: false, status: 400, message: 'This form has expired. Reload the page and submit again — your answers will need re-entering.' });

  if (!body.idempotencyKey || !UUID.test(body.idempotencyKey)) return json({ ok: false, status: 400, message: 'The form could not be read. Reload the page and try again.' });

  // Duplicate (double-click, retry after a slow network): return the original outcome.
  const existing = db().prepare('SELECT id, context FROM submissions WHERE idempotency_key = ?').get(body.idempotencyKey) as { id: string; context: string | null } | undefined;
  if (existing) {
    const ctx = existing.context ? JSON.parse(existing.context) : {};
    return json({ ok: true, status: 200, duplicate: true, successTitle: def.successTitle, successMessage: def.successMessage, extra: await buildExtra(formKey, ctx, null) });
  }

  const { values, errors } = validateValues(def, body.values ?? {});
  if (body.privacyAck !== true) errors.__privacy = 'Please confirm you have read the privacy notice.';

  // Context validation
  const context: Record<string, string> = {};
  if (formKey === 'webinar' && body.context?.webinarId) {
    const w = getItem<{ title: string; startsAt: string; registrationMode: string }>(body.context.webinarId);
    if (!w || w.collection !== 'webinars' || w.status !== 'published' || w.data.registrationMode !== 'internal') {
      return json({ ok: false, status: 400, message: 'Registration for this webinar is not available. Reload the page to see current sessions.' });
    }
    context.webinarId = w.id; context.webinarTitle = w.data.title; context.startsAt = w.data.startsAt;
  } else if (formKey === 'webinar') {
    context.webinarTitle = 'Updates about upcoming webinars';
  }
  if (formKey === 'resource') {
    const r = body.context?.resourceId ? getItem<{ title: string; file: { id: string } | null }>(body.context.resourceId) : null;
    if (!r || r.collection !== 'resources' || r.status !== 'published') return json({ ok: false, status: 400, message: 'This resource is no longer available.' });
    context.resourceId = r.id; context.resourceTitle = r.data.title;
  }

  if (Object.keys(errors).length) return json({ ok: false, status: 422, errors, message: 'Check the highlighted fields.' });

  const email = typeof values.email === 'string' ? values.email.toLowerCase() : null;
  const settings = getSettings();
  const id = crypto.randomUUID();
  const ts = now();
  const marketing = def.marketingConsent && body.marketingConsent === true;
  const wording = def.brand === 'tenderiq' ? settings.tenderiqConsentWording : settings.marketingConsentWording;
  const sheetsStatus = def.sheets.enabled ? 'pending' : 'not_applicable';
  const sourcePage = typeof body.sourcePage === 'string' ? body.sourcePage.slice(0, 200) : null;

  try {
    db().transaction(() => {
      db().prepare(
        `INSERT INTO submissions (id, form_key, idempotency_key, data, email, context, source_page, ip_hash, privacy_ack_at, marketing_consent, created_at, sheets_status, email_status, notify_status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ).run(id, formKey, body.idempotencyKey, JSON.stringify(values), email, JSON.stringify(context), sourcePage, ipHash(ip), ts, marketing ? 1 : 0, ts,
        sheetsStatus, def.sendAcknowledgement ? 'pending' : 'not_applicable', 'pending');
      if (marketing && email) {
        db().prepare('INSERT INTO marketing_consents (email, submission_id, form_key, wording, wording_version, granted_at) VALUES (?,?,?,?,?,?)')
          .run(email, id, formKey, wording, settings.consentWordingVersion, ts);
      }
    })();
  } catch (e) {
    // Unique-constraint race on the idempotency key = concurrent duplicate; treat as success.
    if (e instanceof Error && /UNIQUE/.test(e.message)) {
      return json({ ok: true, status: 200, duplicate: true, successTitle: def.successTitle, successMessage: def.successMessage });
    }
    console.error(`[forms] could not store ${formKey} submission: ${e instanceof Error ? e.message : 'unknown'}`);
    return json({ ok: false, status: 500, message: 'Your submission could not be saved. Your answers are still in the form — try again in a moment, or contact us directly.' });
  }

  // After the visitor has their confirmation: copy to Sheets, send emails. Failures are recorded for the admin to retry.
  after(async () => {
    if (def.sheets.enabled) await syncSubmission(id).catch(() => undefined);
    await sendNotifications(id).catch(() => undefined);
  });

  return json({
    ok: true, status: 200,
    successTitle: def.successTitle, successMessage: def.successMessage,
    extra: await buildExtra(formKey, context, id),
  });
}

async function buildExtra(formKey: FormKey, context: Record<string, string>, _id: string | null) {
  if (formKey === 'webinar' && context.webinarId) {
    const w = getItem<{ title: string; meetingInstructions: string }>(context.webinarId);
    return { webinarTitle: w?.data.title, joining: w?.data.meetingInstructions || '' };
  }
  if (formKey === 'resource' && context.resourceId) {
    return { downloadUrl: `/api/resources/${context.resourceId}/download?t=${encodeURIComponent(signToken(`res:${context.resourceId}`, 86400))}` };
  }
  return undefined;
}

// ---------------------------------------------------------------------------

export async function sendNotifications(id: string) {
  const row = db().prepare('SELECT * FROM submissions WHERE id = ?').get(id) as {
    id: string; form_key: FormKey; data: string; email: string | null; context: string | null; created_at: string; marketing_consent: number;
  } | undefined;
  if (!row) return;
  const def = getForm(row.form_key);
  const data = JSON.parse(row.data) as Record<string, string>;
  const ctx = row.context ? JSON.parse(row.context) : {};
  const setStatus = (col: 'email_status' | 'notify_status', v: string) => db().prepare(`UPDATE submissions SET ${col} = ? WHERE id = ?`).run(v, id);

  if (!emailConfigured()) {
    if (def.sendAcknowledgement) setStatus('email_status', 'not_configured');
    setStatus('notify_status', 'not_configured');
    return;
  }

  // Acknowledgement to the person (service message, not marketing)
  if (def.sendAcknowledgement && row.email) {
    let joining = '';
    if (ctx.webinarId) {
      const w = getItem<{ meetingInstructions: string }>(ctx.webinarId);
      joining = w?.data.meetingInstructions || 'Joining details will be shared before the session.';
    }
    const vars = { name: (data.name || '').split(' ')[0] || 'there', webinar: ctx.webinarTitle || 'the webinar', joining };
    try {
      await sendEmail(row.email, fillTemplate(def.acknowledgementSubject, vars), fillTemplate(def.acknowledgementBody, vars));
      setStatus('email_status', 'sent');
    } catch (e) {
      setStatus('email_status', 'failed');
      console.error(`[email] acknowledgement failed for submission ${id}: ${e instanceof Error ? e.message : ''}`);
    }
  }

  // Team notification
  let recipients = def.notifyTo;
  if (row.form_key === 'contact' && def.routing && data.enquiryType) {
    for (const line of def.routing.split('\n')) {
      const [k, v] = line.split('=').map((s) => s?.trim());
      if (k && v && k.toLowerCase() === data.enquiryType.toLowerCase()) recipients = v;
    }
  }
  const list = (recipients || getSettings().email || '').split(',').map((s) => s.trim()).filter((s) => s.includes('@'));
  if (!list.length) { setStatus('notify_status', 'no_recipients'); return; }
  const lines = def.fields.filter((f) => f.enabled).map((f) => `${f.label}:\n${Array.isArray(data[f.key]) ? (data[f.key] as unknown as string[]).join(', ') : data[f.key] || '—'}\n`);
  const site = process.env.SITE_URL || '';
  const text = [
    `New ${def.title} submission`,
    ctx.webinarTitle ? `Webinar: ${ctx.webinarTitle}` : '', ctx.resourceTitle ? `Resource: ${ctx.resourceTitle}` : '',
    `Received: ${row.created_at}`, `Marketing consent: ${row.marketing_consent ? 'yes' : 'no'}`, '',
    ...lines, '', site ? `View in admin: ${site}/admin/submissions/${row.id}` : '',
  ].filter((l) => l !== undefined).join('\n');
  try {
    await sendEmail(list, `New ${def.title}${data.name ? ` — ${data.name}` : ''}`, text, row.email ?? undefined);
    setStatus('notify_status', 'sent');
  } catch (e) {
    setStatus('notify_status', 'failed');
    console.error(`[email] team notification failed for submission ${id}: ${e instanceof Error ? e.message : ''}`);
  }
}

export const RESOURCE_TOKEN_PREFIX = 'res:';
export { getFile };
