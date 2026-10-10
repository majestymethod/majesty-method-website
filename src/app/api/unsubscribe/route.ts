import { db, now } from '@/lib/db';
import { unsubscribeToken, safeEqual, sameOrigin } from '@/lib/security';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response('Forbidden', { status: 403 });
  const form = await req.formData();
  const email = String(form.get('e') || '').toLowerCase();
  const t = String(form.get('t') || '');
  if (!email || !safeEqual(unsubscribeToken(email), t)) return new Response('Invalid link', { status: 400 });
  db().prepare('UPDATE marketing_consents SET withdrawn_at = ? WHERE email = ? AND withdrawn_at IS NULL').run(now(), email);
  db().prepare('UPDATE submissions SET marketing_consent = 0 WHERE email = ?').run(email);
  return Response.redirect(new URL('/unsubscribe?done=1', req.url), 303);
}
