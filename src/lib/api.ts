import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, userFromToken, type Role, type User } from './auth';
import { sameOrigin } from './security';

export const fail = (status: number, message: string, extra?: object) => Response.json({ ok: false, message, ...extra }, { status });
export const ok = (data: object = {}) => Response.json({ ok: true, ...data });

/**
 * Authorise an admin API request. Returns the user, or a Response to return immediately.
 * - All requests need a valid session.
 * - Non-GET requests must come from this site (CSRF protection, alongside SameSite=Strict cookies).
 * - `role: 'owner'` restricts to owners (submissions, forms, settings, users).
 */
export async function requireUser(req: Request, role?: Role): Promise<User | Response> {
  if (req.method !== 'GET' && !sameOrigin(req)) return fail(403, 'Request blocked: cross-site request.');
  const c = await cookies();
  const user = userFromToken(c.get(SESSION_COOKIE)?.value);
  if (!user) return fail(401, 'Your session has expired. Sign in again.');
  if (role === 'owner' && user.role !== 'owner') return fail(403, 'Only owners can do this.');
  return user;
}

export async function readJson<T>(req: Request, max = 512_000): Promise<T | null> {
  const t = await req.text();
  if (t.length > max) return null;
  try { return JSON.parse(t) as T; } catch { return null; }
}
