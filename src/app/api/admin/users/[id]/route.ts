import { db, audit } from '@/lib/db';
import { hashPassword, validatePasswordStrength } from '@/lib/auth';
import { requireUser, ok, fail, readJson } from '@/lib/api';

type Ctx = { params: Promise<{ id: string }> };
const owners = () => (db().prepare("SELECT COUNT(*) n FROM users WHERE role = 'owner' AND disabled = 0").get() as { n: number }).n;

export async function PATCH(req: Request, { params }: Ctx) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const { id } = await params;
  const target = db().prepare('SELECT * FROM users WHERE id = ?').get(id) as { role: string; disabled: number } | undefined;
  if (!target) return fail(404, 'Not found');
  const b = await readJson<{ role?: string; disabled?: boolean; password?: string }>(req, 4000);
  if (b?.role && (b.role === 'owner' || b.role === 'editor')) {
    if (target.role === 'owner' && b.role === 'editor' && owners() <= 1) return fail(400, 'There must be at least one owner.');
    db().prepare('UPDATE users SET role = ? WHERE id = ?').run(b.role, id);
  }
  if (typeof b?.disabled === 'boolean') {
    if (id === u.id) return fail(400, 'You can’t disable your own account.');
    if (b.disabled && target.role === 'owner' && owners() <= 1) return fail(400, 'There must be at least one active owner.');
    db().prepare('UPDATE users SET disabled = ? WHERE id = ?').run(b.disabled ? 1 : 0, id);
    if (b.disabled) db().prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  }
  if (b?.password) {
    const weak = validatePasswordStrength(b.password);
    if (weak) return fail(400, weak);
    db().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(b.password), id);
    db().prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  }
  audit(u.id, 'user.update', id);
  return ok();
}
