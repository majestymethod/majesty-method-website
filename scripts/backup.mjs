// Consistent online backup of the database plus uploaded media and private files.
// Usage: npm run db:backup   (schedule daily with cron; copy data/backups off the server)
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve(process.env.DATA_DIR || './data');
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dest = path.join(dataDir, 'backups', stamp);
fs.mkdirSync(dest, { recursive: true });
const db = new Database(path.join(dataDir, 'site.db'), { readonly: true });
await db.backup(path.join(dest, 'site.db'));
for (const d of ['media', 'private']) {
  const src = path.join(dataDir, d);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(dest, d), { recursive: true });
}
// Keep the 14 most recent backups
const all = fs.readdirSync(path.join(dataDir, 'backups')).sort();
for (const old of all.slice(0, Math.max(0, all.length - 14))) fs.rmSync(path.join(dataDir, 'backups', old), { recursive: true, force: true });
console.log(`Backup written to ${dest}`);
