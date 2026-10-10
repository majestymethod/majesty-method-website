// Create (or reset the password of) an admin user.
// Usage: npm run admin:create -- --email you@example.com --name "Your Name" [--role owner|editor]
// The password is typed at a hidden prompt, or read from ADMIN_PASSWORD for automated setups.
import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const email = (args.email || '').trim().toLowerCase();
const name = (args.name || '').trim();
const role = args.role === 'editor' ? 'editor' : 'owner';
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) {
  console.error('Usage: npm run admin:create -- --email you@example.com --name "Your Name" [--role owner|editor]');
  process.exit(1);
}

function askHidden(q) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(q)) rl.output.write(s); };
    rl.question(q, (a) => { rl.close(); process.stdout.write('\n'); resolve(a); });
  });
}

const password = process.env.ADMIN_PASSWORD || (await askHidden('Password (12+ characters): '));
if (password.length < 12) { console.error('Password must be at least 12 characters.'); process.exit(1); }
if (!process.env.ADMIN_PASSWORD) {
  const again = await askHidden('Confirm password: ');
  if (again !== password) { console.error('Passwords do not match.'); process.exit(1); }
}

const dataDir = path.resolve(process.env.DATA_DIR || './data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'site.db'));
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('owner','editor')),
  password_hash TEXT NOT NULL, created_at TEXT NOT NULL, last_login_at TEXT, disabled INTEGER NOT NULL DEFAULT 0)`);

const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
const stored = `scrypt$16384$8$1$${salt.toString('base64')}$${hash.toString('base64')}`;
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
if (existing) {
  db.prepare('UPDATE users SET password_hash = ?, name = ?, role = ?, disabled = 0 WHERE id = ?').run(stored, name, role, existing.id);
  try { db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existing.id); } catch {}
  console.log(`Updated ${email} (${role}). Existing sessions signed out.`);
} else {
  db.prepare('INSERT INTO users (id, email, name, role, password_hash, created_at) VALUES (?,?,?,?,?,?)').run(crypto.randomUUID(), email, name, role, stored, new Date().toISOString());
  console.log(`Created ${role} ${email}. Sign in at /admin`);
}
