import { cookies } from 'next/headers';
import { destroySession, SESSION_COOKIE, PREVIEW_COOKIE } from '@/lib/auth';
import { sameOrigin } from '@/lib/security';
import { fail, ok } from '@/lib/api';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, 'Request blocked.');
  const c = await cookies();
  const t = c.get(SESSION_COOKIE)?.value;
  if (t) destroySession(t);
  c.delete(SESSION_COOKIE);
  c.delete(PREVIEW_COOKIE);
  return ok();
}
