import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db, now, audit } from './db';

export const SESSION_COOKIE = 'mm_session';
export const PREVIEW_COOKIE = 'mm_preview';
const SESSION_DAYS = 7;

export type Role = 'owner' | 'editor';
export interface User { id: string; email: string; name: string; role: Role }

// scrypt with per-password salt. Format: scrypt$N$r$p$salt$hash
export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16);
  const N = 16384, r = 8, p = 1;
  const hash = crypto.scryptSync(pw, salt, 64, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${hash.toString('base64')}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [alg, N, r, p, salt, hash] = stored.split('$');
  if (alg !== 'scrypt') return false;
  const expected = Buffer.from(hash, 'base64');
  const got = crypto.scryptSync(pw, Buffer.from(salt, 'base64'), expected.length, { N: Number(N), r: Number(r), p: Number(p) });
  return crypto.timingSafeEqual(expected, got);
}

export function validatePasswordStrength(pw: string): string | null {
  if (pw.length < 12) return 'Use at least 12 characters.';
  if (/^(.)\1+$/.test(pw)) return 'Password is too simple.';
  return null;
}

const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export function createSession(userId: string): { token: string; expires: Date } {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  db().prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?,?,?,?)').run(sha(token), userId, now(), expires.toISOString());
  db().prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now(), userId);
  db().prepare('DELETE FROM sessions WHERE expires_at < ?').run(now());
  audit(userId, 'auth.login');
  return { token, expires };
}

export function destroySession(token: string) {
  db().prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token));
}

export function userFromToken(token: string | undefined): User | null {
  if (!token) return null;
  const row = db().prepare(
    `SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ? AND u.disabled = 0`,
  ).get(sha(token), now()) as User | undefined;
  return row ?? null;
}

export async function currentUser(): Promise<User | null> {
  const c = await cookies();
  return userFromToken(c.get(SESSION_COOKIE)?.value);
}

/** True when an authenticated editor has switched on draft preview. */
export async function isPreview(): Promise<boolean> {
  const c = await cookies();
  if (c.get(PREVIEW_COOKIE)?.value !== '1') return false;
  return !!userFromToken(c.get(SESSION_COOKIE)?.value);
}

export function findUserByEmail(email: string) {
  return db().prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email.trim()) as
    | (User & { password_hash: string; disabled: number }) | undefined;
}

export function createUser(email: string, name: string, role: Role, password: string): string {
  const id = crypto.randomUUID();
  db().prepare('INSERT INTO users (id, email, name, role, password_hash, created_at) VALUES (?,?,?,?,?,?)').run(id, email.trim().toLowerCase(), name.trim(), role, hashPassword(password), now());
  return id;
}

export function cookieOptions(expires?: Date) {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', ...(expires ? { expires } : {}) };
}
