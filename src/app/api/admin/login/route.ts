import { cookies } from 'next/headers';
import { createSession, findUserByEmail, verifyPassword, cookieOptions, SESSION_COOKIE } from '@/lib/auth';
import { clientIp, rateLimit, sameOrigin } from '@/lib/security';
import { fail, ok, readJson } from '@/lib/api';

const DUMMY_HASH = 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' + 'A'.repeat(86) + '==';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, 'Request blocked.');
  const body = await readJson<{ email?: string; password?: string }>(req, 4000);
  const email = (body?.email || '').trim().toLowerCase();
  const ip = clientIp(req.headers);
  if (!rateLimit(`login:${ip}`, 20, 15 * 60_000) || !rateLimit(`login:${email}`, 8, 15 * 60_000)) {
    return fail(429, 'Too many sign-in attempts. Wait 15 minutes and try again.');
  }
  const user = email ? findUserByEmail(email) : undefined;
  if (!user || user.disabled) {
    // Run a comparison anyway so response time doesn't reveal whether the account exists.
    verifyPassword('x', DUMMY_HASH);
    return fail(401, 'Email or password is incorrect.');
  }
  if (!verifyPassword(body?.password || '', user.password_hash)) return fail(401, 'Email or password is incorrect.');
  const { token, expires } = createSession(user.id);
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expires));
  return ok();
}
