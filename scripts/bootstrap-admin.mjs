// First-run helper for hosts without an easy terminal (e.g. Railway).
// If ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD are set AND the site has no users yet, creates the owner account.
// It never changes an existing account, so leaving the variables in place cannot reset a password later.
// Remove ADMIN_PASSWORD from the host's variables once you have signed in.
import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const name = (process.env.ADMIN_NAME || '').trim();
const password = process.env.ADMIN_PASSWORD || '';
if (!email && !password) process.exit(0);
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || password.length < 12) {
  console.warn('[bootstrap-admin] Skipped: set ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD (12+ characters).');
  process.exit(0);
}

const dataDir = path.resolve(process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || './data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, 'site.db'));
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('owner','editor')),
  password_hash TEXT NOT NULL, created_at TEXT NOT NULL, last_login_at TEXT, disabled INTEGER NOT NULL DEFAULT 0)`);

const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
if (count > 0) {
  console.log('[bootstrap-admin] Users already exist; nothing to do. You can remove ADMIN_PASSWORD from your host settings.');
} else {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  const stored = `scrypt$16384$8$1$${salt.toString('base64')}$${hash.toString('base64')}`;
  db.prepare('INSERT INTO users (id, email, name, role, password_hash, created_at) VALUES (?,?,?,?,?,?)')
    .run(crypto.randomUUID(), email, name, 'owner', stored, new Date().toISOString());
  console.log(`[bootstrap-admin] Created owner ${email}. Sign in at /admin, then remove ADMIN_PASSWORD from your host settings.`);
}
db.close();
