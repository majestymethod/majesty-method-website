import { db } from '@/lib/db';
import { createUser, validatePasswordStrength, findUserByEmail } from '@/lib/auth';
import { audit } from '@/lib/db';
import { requireUser, ok, fail, readJson } from '@/lib/api';

export async function GET(req: Request) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  return ok({ items: db().prepare('SELECT id, email, name, role, created_at, last_login_at, disabled FROM users ORDER BY created_at').all(), me: u.id });
}

export async function POST(req: Request) {
  const u = await requireUser(req, 'owner'); if (u instanceof Response) return u;
  const b = await readJson<{ email: string; name: string; role: string; password: string }>(req, 4000);
  const email = (b?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, 'Enter a valid email address.');
  if (!b?.name?.trim()) return fail(400, 'Enter a name.');
  const weak = validatePasswordStrength(b.password || '');
  if (weak) return fail(400, weak);
  if (findUserByEmail(email)) return fail(409, 'A user with this email already exists.');
  const id = createUser(email, b.name, b.role === 'owner' ? 'owner' : 'editor', b.password);
  audit(u.id, 'user.create', id);
  return ok({ id });
}
