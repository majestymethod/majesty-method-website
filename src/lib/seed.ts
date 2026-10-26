import type Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DOCS } from './content/schema';
import { DEFAULT_FORMS } from './forms/definitions';
import PREVIOUS_DEFAULTS from './content/previous-defaults.json';

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object), kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

/**
 * Copy refresh for existing sites: pages whose stored text is still exactly the previous release's default copy
 * are moved to the new default copy. Pages the owner has edited are left untouched (use "Reset to default" in the
 * editor to adopt the new copy on those).
 */
/** TenderIQ launch offer (R2,000 crossed out, R1,500 until January 2027) and a "Demo" menu item.
 *  Only changes the price if it is still the original R2,000, and only adds the menu item next to "How it works". */
function tenderiqOfferAndDemo(db: Database.Database) {
  const sel = db.prepare('SELECT draft, published FROM content WHERE key = ?');
  const upd = db.prepare('UPDATE content SET draft = ?, published = ? WHERE key = ?');
  const patch = (key: string, fix: (doc: Record<string, any>) => boolean, msg: string) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const row = sel.get(key) as { draft: string; published: string | null } | undefined;
    if (!row) return;
    const run = (raw: string | null) => { if (!raw) return raw; const doc = JSON.parse(raw); return fix(doc) ? JSON.stringify(doc) : raw; };
    const d2 = run(row.draft), p2 = run(row.published);
    if (d2 !== row.draft || p2 !== row.published) { upd.run(d2, p2, key); console.log(`[seed] ${key}: ${msg}`); }
  };
  patch('tenderiq', (doc) => {
    const pr = doc?.pricing;
    if (!pr || 'wasPrice' in pr) return false;
    if (pr.price === 'R2,000') { pr.price = 'R1,500'; pr.wasPrice = 'R2,000'; pr.offer = 'until January 2027'; }
    else { pr.wasPrice = ''; pr.offer = ''; } // a price the owner set herself: no crossed-out offer
    return true;
  }, 'pricing offer applied');
  patch('navigation', (doc) => {
    const items = doc?.tenderiq;
    if (!Array.isArray(items) || items.some((i: { href?: string }) => i?.href === '/tenderiq/demo')) return false;
    const at = items.findIndex((i: { href?: string }) => i?.href === '/tenderiq#how-it-works');
    if (at < 0) return false;
    items.splice(at + 1, 0, { label: 'Demo', href: '/tenderiq/demo' });
    return true;
  }, 'added Demo to the TenderIQ menu');
}

/** Points "register / join a session" links straight at the registration form on the Friday sessions page.
 *  Only changes links that still go to the top of that page, so links the owner changed elsewhere are left alone. */
function linkRegisterButtonsToForm(db: Database.Database) {
  const targets: [string, string[][]][] = [
    ['settings', [['announcement', 'href']]],
    ['mm_home', [['hero', 'secondary', 'href'], ['finalCta', 'secondary', 'href']]],
  ];
  const sel = db.prepare('SELECT draft, published FROM content WHERE key = ?');
  for (const [key, paths] of targets) {
    const row = sel.get(key) as { draft: string; published: string | null } | undefined;
    if (!row) continue;
    const fix = (raw: string | null) => {
      if (!raw) return raw;
      const doc = JSON.parse(raw);
      let changed = false;
      for (const at of paths) {
        let node = doc;
        for (const k of at.slice(0, -1)) node = node?.[k];
        const last = at[at.length - 1];
        if (node && node[last] === '/majesty-method/webinars') { node[last] = '/majesty-method/webinars#register-form'; changed = true; }
      }
      return changed ? JSON.stringify(doc) : raw;
    };
    const d2 = fix(row.draft), p2 = fix(row.published);
    if (d2 !== row.draft || p2 !== row.published) {
      db.prepare('UPDATE content SET draft = ?, published = ? WHERE key = ?').run(d2, p2, key);
      console.log(`[seed] ${key}: register links now go straight to the form`);
    }
  }
}

/** Names Typeform in the privacy notice's list of service providers (registration forms now run on Typeform).
 *  Only adds the line where the notice still has the original Google line and doesn't mention Typeform yet. */
function addTypeformToPrivacy(db: Database.Database) {
  const google = '- **Google (Google Sheets and Google Workspace)** — Bootcamp registrations are copied to a Google Sheet used by our team. Google may store data outside South Africa.';
  const line = '- **Typeform** — our Founder Marketing Bootcamp, Friday session and TenderIQ registration forms are provided by Typeform, which receives the answers you enter in those forms. Typeform may store data outside South Africa.';
  const oldLine = '- **Typeform** — our Founder Marketing Bootcamp and Friday session registration forms are provided by Typeform, which receives the answers you enter in those forms. Typeform may store data outside South Africa.';
  for (const r of db.prepare("SELECT key, draft, published FROM content WHERE key LIKE 'legal_%'").all() as { key: string; draft: string; published: string | null }[]) {
    const fix = (raw: string | null) => {
      if (!raw) return raw;
      if (raw.includes(JSON.stringify(oldLine).slice(1, -1))) return raw.replace(JSON.stringify(oldLine).slice(1, -1), JSON.stringify(line).slice(1, -1));
      if (raw.includes('Typeform') || !raw.includes(JSON.stringify(google).slice(1, -1))) return raw;
      return raw.replace(JSON.stringify(google).slice(1, -1), JSON.stringify(google + '\n' + line).slice(1, -1))
        .replace('Some providers, including Google, may store', 'Some providers, including Google and Typeform, may store');
    };
    const d2 = fix(r.draft), p2 = fix(r.published);
    if (d2 !== r.draft || p2 !== r.published) {
      db.prepare('UPDATE content SET draft = ?, published = ? WHERE key = ?').run(d2, p2, r.key);
      console.log(`[seed] ${r.key}: added Typeform to the service providers`);
    }
  }
}

/** Swaps the original people photos for their cut-out versions, only where the page still uses the original photo. */
function useCutouts(db: Database.Database) {
  const swaps: [string, string[], string, string][] = [
    ['mm_home', ['who', 'image'], 'seed-who', 'seed-who-cutout'],
    ['bootcamp', ['image'], 'seed-bootcamp', 'seed-bootcamp-cutout'],
    ['webinars_page', ['image'], 'seed-webinars', 'seed-webinars-cutout'],
    ['resources_page', ['image'], 'seed-resources', 'seed-resources-cutout'],
  ];
  const sel = db.prepare('SELECT draft, published FROM content WHERE key = ?');
  const upd = db.prepare('UPDATE content SET draft = ?, published = ? WHERE key = ?');
  for (const [key, at, from, to] of swaps) {
    const row = sel.get(key) as { draft: string; published: string | null } | undefined;
    if (!row) continue;
    const swap = (raw: string | null) => {
      if (!raw) return raw;
      const doc = JSON.parse(raw);
      let node = doc;
      for (const k of at.slice(0, -1)) node = node?.[k];
      const img = node?.[at[at.length - 1]];
      if (!img || img.id !== from) return raw;
      img.id = to;
      return JSON.stringify(doc);
    };
    const d2 = swap(row.draft), p2 = swap(row.published);
    if (d2 !== row.draft || p2 !== row.published) { upd.run(d2, p2, key); console.log(`[seed] ${key}: switched to the cut-out photo`); }
  }
}

function refreshUnchangedDocs(db: Database.Database, ts: string) {
  const get = db.prepare('SELECT draft, published FROM content WHERE key = ?');
  const upd = db.prepare('UPDATE content SET draft = ?, published = ?, updated_at = ?, published_at = ?, updated_by = ? WHERE key = ?');
  for (const [key, previous] of Object.entries(PREVIOUS_DEFAULTS as Record<string, unknown>)) {
    const def = DOCS.find((d) => d.key === key);
    const row = get.get(key) as { draft: string; published: string | null } | undefined;
    if (!def || !row) continue;
    const isPrevious = (raw: string | null) => { try { return !!raw && deepEqual(JSON.parse(raw), previous); } catch { return false; } };
    const fresh = JSON.stringify(def.defaults);
    const draft = isPrevious(row.draft) ? fresh : row.draft;
    const published = isPrevious(row.published) ? fresh : row.published;
    if (draft !== row.draft || published !== row.published) {
      upd.run(draft, published, ts, ts, 'update', key);
      console.log(`[content] Updated "${key}" to the new default copy`);
    } else if (row.published && !deepEqual(JSON.parse(row.published), def.defaults)) {
      console.log(`[content] "${key}" has been edited, so its copy was left as is`);
    }
  }
}

/** Renames that apply to stored forms and legal pages (plain text replacement, safe for the owner's edits). */
function applyRenames(db: Database.Database) {
  const renames: [string, string][] = [['Business Acceleration Programme', 'Team Acceleration programme'], ['Business Acceleration', 'Team Acceleration']];
  const swap = (t: string) => renames.reduce((acc, [a, b]) => acc.split(a).join(b), t);
  for (const r of db.prepare('SELECT key, definition FROM forms').all() as { key: string; definition: string }[]) {
    const n = swap(r.definition);
    if (n !== r.definition) db.prepare('UPDATE forms SET definition = ? WHERE key = ?').run(n, r.key);
  }
  for (const r of db.prepare("SELECT key, draft, published FROM content WHERE key LIKE 'legal_%'").all() as { key: string; draft: string; published: string | null }[]) {
    const d = swap(r.draft), p = r.published == null ? null : swap(r.published);
    if (d !== r.draft || p !== r.published) db.prepare('UPDATE content SET draft = ?, published = ? WHERE key = ?').run(d, p, r.key);
  }
}

const SEED_MEDIA = path.resolve(process.cwd(), 'seed/media');

export function ensureSeeded(db: Database.Database) {
  const ts = new Date().toISOString();
  const mediaDir = path.join(path.resolve(process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || './data'), 'media');

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

  refreshUnchangedDocs(db, ts);
  applyRenames(db);
  useCutouts(db);
  addTypeformToPrivacy(db);
  linkRegisterButtonsToForm(db);
  tenderiqOfferAndDemo(db);

  // Content patches for sites that already exist: fill in photos that were still empty placeholders.
  // Only touches values that are still exactly the old default, so the owner's own edits are never overwritten.
  const tiq = db.prepare("SELECT draft, published FROM content WHERE key = 'tenderiq'").get() as { draft: string; published: string | null } | undefined;
  if (tiq) {
    const photos: Record<string, { id: string; alt: string }> = {};
    for (const it of (DOCS.find((d) => d.key === 'tenderiq')?.defaults as { industries?: { items?: { label: string; image: { id: string; alt: string } | null }[] } })?.industries?.items ?? []) {
      if (it.image) photos[it.label] = it.image;
    }
    const fill = (raw: string | null) => {
      if (!raw) return raw;
      const doc = JSON.parse(raw);
      let changed = false;
      for (const it of doc?.industries?.items ?? []) {
        if (it && it.image == null && photos[it.label]) { it.image = photos[it.label]; changed = true; }
      }
      return changed ? JSON.stringify(doc) : raw;
    };
    const d2 = fill(tiq.draft), p2 = fill(tiq.published);
    if (d2 !== tiq.draft || p2 !== tiq.published) db.prepare("UPDATE content SET draft = ?, published = ? WHERE key = 'tenderiq'").run(d2, p2);
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
