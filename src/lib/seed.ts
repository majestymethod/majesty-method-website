import type Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DOCS } from './content/schema';
import { DEFAULT_FORMS } from './forms/definitions';

const SEED_MEDIA = path.resolve(process.cwd(), 'seed/media');

export function ensureSeeded(db: Database.Database) {
  const ts = new Date().toISOString();
  const mediaDir = path.join(path.resolve(process.env.DATA_DIR || './data'), 'media');

  // Content documents: insert any that don't exist yet (new docs added in later releases seed automatically).
  const insDoc = db.prepare('INSERT OR IGNORE INTO content (key, draft, published, updated_at, published_at, updated_by) VALUES (?,?,?,?,?,?)');
  for (const d of DOCS) {
    const json = JSON.stringify(d.defaults);
    insDoc.run(d.key, json, json, ts, ts, 'seed');
  }

  // Forms
  const insForm = db.prepare('INSERT OR IGNORE INTO forms (key, definition, updated_at) VALUES (?,?,?)');
  for (const f of Object.values(DEFAULT_FORMS)) insForm.run(f.key, JSON.stringify(f), ts);

  // Seed media (logo + entry hero)
  const manifestPath = path.join(SEED_MEDIA, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Array<{ id: string; original_name: string; mime: string; width: number; height: number; variants: { w: number; h: number; file: string }[]; alt: string }>;
    const exists = db.prepare('SELECT 1 FROM media WHERE id = ?');
    const ins = db.prepare('INSERT INTO media (id, original_name, mime, width, height, variants, alt, created_at) VALUES (?,?,?,?,?,?,?,?)');
    for (const m of manifest) {
      if (exists.get(m.id)) continue;
      for (const v of m.variants) fs.copyFileSync(path.join(SEED_MEDIA, v.file), path.join(mediaDir, v.file));
      ins.run(m.id, m.original_name, m.mime, m.width, m.height, JSON.stringify(m.variants), m.alt, ts);
    }
  }

  // One example item per collection, saved as DRAFT so it never appears publicly.
  const count = db.prepare('SELECT COUNT(*) as n FROM items').get() as { n: number };
  if (count.n === 0) {
    const ins = db.prepare('INSERT INTO items (id, collection, data, status, sort, created_at, updated_at) VALUES (?,?,?,?,?,?,?)');
    ins.run(crypto.randomUUID(), 'webinars', JSON.stringify({
      title: '[EXAMPLE — replace before publishing] Webinar title', topic: 'Marketing',
      description: 'A short description of what participants will learn.', startsAt: '', durationMinutes: 60,
      delivery: 'Online', registrationMode: 'internal', registrationUrl: '', meetingInstructions: '', recordingUrl: '',
    }), 'draft', 0, ts, ts);
    ins.run(crypto.randomUUID(), 'courses', JSON.stringify({
      title: '[EXAMPLE — replace before publishing] Course title', summary: 'What the course helps people do, in one or two sentences.',
      audience: '', outcomes: '', topics: '', format: '', duration: '', price: '', image: null, ctaLabel: 'Register interest', ctaUrl: '',
    }), 'draft', 0, ts, ts);
    ins.run(crypto.randomUUID(), 'resources', JSON.stringify({
      title: '[EXAMPLE — replace before publishing] Resource title', type: 'Guide', description: 'What this resource helps people do.',
      thumbnail: null, file: null, externalUrl: '', requiresRegistration: true,
    }), 'draft', 0, ts, ts);
  }
}
