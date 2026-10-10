import { db } from '@/lib/db';
import { findPublishedPlaceholders, getForm, getSettings } from '@/lib/content/store';
import { sheetsConfigured } from '@/lib/integrations/sheets';
import { emailConfigured } from '@/lib/integrations/email';
import { DEFAULT_FORMS, type FormKey } from '@/lib/forms/definitions';
import { requireUser, ok } from '@/lib/api';

export async function GET(req: Request) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const s = getSettings();
  const counts = db().prepare("SELECT form_key, COUNT(*) total, SUM(review_status = 'new') unread FROM submissions GROUP BY form_key").all();
  const sheetsIssues = (db().prepare("SELECT COUNT(*) n FROM submissions WHERE sheets_status IN ('failed','not_configured','pending')").get() as { n: number }).n;
  const inferred = (Object.keys(DEFAULT_FORMS) as FormKey[]).flatMap((k) => getForm(k).fields.filter((f) => f.enabled && f.inferred).map((f) => ({ form: k, label: f.label })));
  const unpublished = db().prepare('SELECT key FROM content WHERE published IS NOT draft').all() as { key: string }[];
  return ok({
    user: u,
    integrations: {
      siteUrl: process.env.SITE_URL || null,
      appSecret: !!process.env.APP_SECRET && process.env.APP_SECRET !== 'change-me' && process.env.APP_SECRET.length >= 32,
      sheets: sheetsConfigured(),
      email: emailConfigured(),
      analytics: s.analytics.provider === 'ga4' && !!s.analytics.ga4Id,
      booking: !!s.bookingUrl,
    },
    counts, sheetsIssues, inferred,
    placeholders: u.role === 'owner' ? findPublishedPlaceholders() : [],
    unpublished: unpublished.map((x) => x.key),
  });
}
