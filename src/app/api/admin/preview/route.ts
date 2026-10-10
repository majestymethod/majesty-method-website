import { cookies } from 'next/headers';
import { currentUser, PREVIEW_COOKIE, cookieOptions } from '@/lib/auth';

// GET is used so preview links work from the editor. It only toggles a display preference,
// and draft content is only ever shown to signed-in users.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get('to') || '/';
  const dest = new URL(to.startsWith('/') && !to.startsWith('//') ? to : '/', req.url);
  const c = await cookies();
  if (url.searchParams.get('off')) {
    c.delete(PREVIEW_COOKIE);
    return Response.redirect(dest, 303);
  }
  if (!(await currentUser())) return Response.redirect(new URL('/admin/login', req.url), 303);
  c.set(PREVIEW_COOKIE, '1', { ...cookieOptions(), sameSite: 'lax' });
  return Response.redirect(dest, 303);
}
