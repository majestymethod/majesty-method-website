import { db, now, audit } from '@/lib/db';
import { unsubscribeToken } from '@/lib/security';
import { siteUrl } from '@/lib/seo';
import { requireUser, ok, readJson, fail } from '@/lib/api';

export async function GET(req: Request) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const csv = new URL(req.url).searchParams.get('format') === 'csv';
  const rows = db().prepare(`SELECT email, form_key, wording, wording_version, granted_at, withdrawn_at FROM marketing_consents ORDER BY granted_at DESC`).all() as
    { email: string; form_key: string; wording: string; wording_version: string; granted_at: string; withdrawn_at: string | null }[];
  const withLinks = rows.map((r) => ({ ...r, unsubscribeUrl: `${siteUrl()}/unsubscribe?e=${encodeURIComponent(r.email)}&t=${unsubscribeToken(r.email)}` }));
  if (!csv) return ok({ items: withLinks });
  // Export of active subscribers only, with a personal unsubscribe link for each email you send.
  const latest = new Map<string, (typeof withLinks)[number]>();
  for (const r of withLinks) if (!latest.has(r.email)) latest.set(r.email, r);
  const active = [...latest.values()].filter((r) => !r.withdrawn_at); // most recent record per email decides
  const q = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const body = ['Email,Source form,Consent given (UTC),Wording version,Unsubscribe link', ...active.map((r) => [r.email, r.form_key, r.granted_at, r.wording_version, r.unsubscribeUrl].map(q).join(','))].join('\r\n');
  audit(u.id, 'consents.export');
  return new Response('﻿' + body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="marketing-subscribers.csv"' } });
}

export async function POST(req: Request) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const body = await readJson<{ email: string }>(req, 1000);
  const email = (body?.email || '').trim().toLowerCase();
  if (!email) return fail(400, 'Enter an email address.');
  const r = db().prepare('UPDATE marketing_consents SET withdrawn_at = ? WHERE email = ? AND withdrawn_at IS NULL').run(now(), email);
  db().prepare('UPDATE submissions SET marketing_consent = 0 WHERE email = ?').run(email);
  audit(u.id, 'consents.withdraw');
  return ok({ updated: r.changes });
}
