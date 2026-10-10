import { db, audit } from '@/lib/db';
import { hashPassword, validatePasswordStrength, verifyPassword } from '@/lib/auth';
import { requireUser, ok, fail, readJson } from '@/lib/api';

export async function PUT(req: Request) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const b = await readJson<{ current: string; next: string }>(req, 4000);
  const row = db().prepare('SELECT password_hash FROM users WHERE id = ?').get(u.id) as { password_hash: string };
  if (!b || !verifyPassword(b.current || '', row.password_hash)) return fail(400, 'Your current password is incorrect.');
  const weak = validatePasswordStrength(b.next || '');
  if (weak) return fail(400, weak);
  db().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(b.next), u.id);
  audit(u.id, 'user.password');
  return ok();
}
