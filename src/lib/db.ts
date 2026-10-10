import 'server-only';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { ensureSeeded } from './seed';

export const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
export const MEDIA_DIR = path.join(DATA_DIR, 'media');
export const PRIVATE_DIR = path.join(DATA_DIR, 'private');
export const BACKUP_DIR = path.join(DATA_DIR, 'backups');

const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS content (
    key TEXT PRIMARY KEY,
    draft TEXT NOT NULL,
    published TEXT,
    updated_at TEXT NOT NULL,
    published_at TEXT,
    updated_by TEXT
  );
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    collection TEXT NOT NULL,
    data TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS items_collection ON items(collection, status, sort);
  CREATE TABLE IF NOT EXISTS forms (
    key TEXT PRIMARY KEY,
    definition TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    form_key TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    data TEXT NOT NULL,
    email TEXT,
    context TEXT,
    source_page TEXT,
    ip_hash TEXT,
    privacy_ack_at TEXT,
    marketing_consent INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    review_status TEXT NOT NULL DEFAULT 'new',
    sheets_status TEXT NOT NULL DEFAULT 'not_applicable',
    sheets_attempts INTEGER NOT NULL DEFAULT 0,
    sheets_error TEXT,
    email_status TEXT NOT NULL DEFAULT 'not_applicable',
    notify_status TEXT NOT NULL DEFAULT 'not_applicable'
  );
  CREATE INDEX IF NOT EXISTS submissions_form ON submissions(form_key, created_at);
  CREATE INDEX IF NOT EXISTS submissions_email ON submissions(email);
  CREATE TABLE IF NOT EXISTS marketing_consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    submission_id TEXT,
    form_key TEXT,
    wording TEXT NOT NULL,
    wording_version TEXT NOT NULL,
    granted_at TEXT NOT NULL,
    withdrawn_at TEXT
  );
  CREATE INDEX IF NOT EXISTS consents_email ON marketing_consents(email);
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner','editor')),
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_login_at TEXT,
    disabled INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    variants TEXT NOT NULL,
    alt TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    target TEXT,
    created_at TEXT NOT NULL
  );
  `,
];

declare global {
  // eslint-disable-next-line no-var
  var __mmdb: Database.Database | undefined;
}

function open(): Database.Database {
  for (const d of [DATA_DIR, MEDIA_DIR, PRIVATE_DIR, BACKUP_DIR]) fs.mkdirSync(d, { recursive: true });
  const db = new Database(path.join(DATA_DIR, 'site.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  const version = db.pragma('user_version', { simple: true }) as number;
  for (let i = version; i < MIGRATIONS.length; i++) {
    db.exec('BEGIN');
    db.exec(MIGRATIONS[i]);
    db.pragma(`user_version = ${i + 1}`);
    db.exec('COMMIT');
  }
  return db;
}

export function db(): Database.Database {
  if (!global.__mmdb) {
    global.__mmdb = open();
    // Seed on first open (idempotent; also adds docs introduced in later releases).
    ensureSeeded(global.__mmdb);
  }
  return global.__mmdb;
}

export const now = () => new Date().toISOString();

export function audit(userId: string | null, action: string, target?: string) {
  db().prepare('INSERT INTO audit_log (user_id, action, target, created_at) VALUES (?,?,?,?)').run(userId, action, target ?? null, now());
}
