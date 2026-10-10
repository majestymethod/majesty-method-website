import 'server-only';
import crypto from 'node:crypto';
import { db, now, audit } from '../db';
import { DOC_MAP, COLLECTION_MAP } from './schema';
import { DEFAULT_FORMS, type FormDef, type FormKey } from '../forms/definitions';

type Json = Record<string, unknown>;

/** Fill in keys missing from stored content with schema defaults (so new fields work on old data). */
function withDefaults(def: unknown, val: unknown): unknown {
  if (val === undefined) return def;
  if (def && typeof def === 'object' && !Array.isArray(def) && val && typeof val === 'object' && !Array.isArray(val)) {
    const out: Json = { ...(val as Json) };
    for (const [k, v] of Object.entries(def as Json)) out[k] = withDefaults(v, (val as Json)[k]);
    return out;
  }
  return val;
}

export function getDoc<T = Json>(key: string, preview = false): T {
  const def = DOC_MAP[key];
  if (!def) throw new Error(`Unknown content doc ${key}`);
  const row = db().prepare('SELECT draft, published FROM content WHERE key = ?').get(key) as { draft: string; published: string | null } | undefined;
  const raw = row ? (preview ? row.draft : row.published ?? row.draft) : null;
  return withDefaults(def.defaults, raw ? JSON.parse(raw) : undefined) as T;
}

export function getDocMeta(key: string) {
  const row = db().prepare('SELECT draft, published, updated_at, published_at, updated_by FROM content WHERE key = ?').get(key) as
    | { draft: string; published: string | null; updated_at: string; published_at: string | null; updated_by: string | null } | undefined;
  return row ? { ...row, hasUnpublished: row.draft !== row.published } : null;
}

export function saveDraft(key: string, data: Json, userId: string) {
  if (!DOC_MAP[key]) throw new Error('Unknown document');
  const json = JSON.stringify(data);
  // Settings take effect immediately: there is no draft state for business details.
  if (key === 'settings') {
    db().prepare('UPDATE content SET draft = ?, published = ?, updated_at = ?, published_at = ?, updated_by = ? WHERE key = ?').run(json, json, now(), now(), userId, key);
  } else {
    db().prepare('UPDATE content SET draft = ?, updated_at = ?, updated_by = ? WHERE key = ?').run(json, now(), userId, key);
  }
  audit(userId, 'content.save', key);
}

export function publishDoc(key: string, userId: string) {
  db().prepare('UPDATE content SET published = draft, published_at = ?, updated_by = ? WHERE key = ?').run(now(), userId, key);
  audit(userId, 'content.publish', key);
}

export function discardDraft(key: string, userId: string) {
  db().prepare('UPDATE content SET draft = published WHERE key = ? AND published IS NOT NULL').run(key);
  audit(userId, 'content.discard', key);
}

export function resetDocToDefault(key: string, userId: string) {
  const def = DOC_MAP[key];
  db().prepare('UPDATE content SET draft = ?, updated_at = ?, updated_by = ? WHERE key = ?').run(JSON.stringify(def.defaults), now(), userId, key);
  audit(userId, 'content.reset', key);
}

// --- Settings ---------------------------------------------------------------

export interface Settings {
  brandName: string; descriptor: string; motto: string; tagline: string;
  logo: ImageRef | null; tenderiqLogo: ImageRef | null;
  registeredName: string; legalStatus: string; registrationNumber: string; vatNumber: string;
  physicalAddress: string; postalAddress: string; location: string;
  email: string; phone: string; whatsapp: string; tenderiqEmail: string;
  informationOfficer: { name: string; email: string; phone: string };
  socials: { label: string; url: string }[];
  bookingUrl: string;
  marketingConsentWording: string; tenderiqConsentWording: string; consentWordingVersion: string;
  analytics: { provider: 'none' | 'ga4'; ga4Id: string };
  cookieConsentVersion: string;
  retentionMonths: number;
}
export interface ImageRef { id: string; alt?: string }

export const getSettings = () => getDoc<Settings>('settings');

// --- Collections ------------------------------------------------------------

export interface Item<T = Json> { id: string; collection: string; data: T; status: 'draft' | 'published'; sort: number; created_at: string; updated_at: string }

function rowToItem<T>(r: { id: string; collection: string; data: string; status: string; sort: number; created_at: string; updated_at: string }): Item<T> {
  return { ...r, data: JSON.parse(r.data) as T, status: r.status as Item['status'] };
}

export function listItems<T = Json>(collection: string, opts: { includeDrafts?: boolean } = {}): Item<T>[] {
  if (!COLLECTION_MAP[collection]) throw new Error('Unknown collection');
  const rows = db().prepare(
    `SELECT * FROM items WHERE collection = ? ${opts.includeDrafts ? '' : "AND status = 'published'"} ORDER BY sort ASC, created_at DESC`,
  ).all(collection) as Parameters<typeof rowToItem>[0][];
  return rows.map((r) => rowToItem<T>(r));
}

export function getItem<T = Json>(id: string): Item<T> | null {
  const r = db().prepare('SELECT * FROM items WHERE id = ?').get(id) as Parameters<typeof rowToItem>[0] | undefined;
  return r ? rowToItem<T>(r) : null;
}

export function saveItem(collection: string, id: string | null, data: Json, status: 'draft' | 'published', sort: number, userId: string): string {
  if (!COLLECTION_MAP[collection]) throw new Error('Unknown collection');
  const json = JSON.stringify(data);
  if (id) {
    const r = db().prepare('UPDATE items SET data = ?, status = ?, sort = ?, updated_at = ? WHERE id = ? AND collection = ?').run(json, status, sort, now(), id, collection);
    if (r.changes === 0) throw new Error('Item not found');
    audit(userId, `item.save.${status}`, id);
    return id;
  }
  const newId = crypto.randomUUID();
  db().prepare('INSERT INTO items (id, collection, data, status, sort, created_at, updated_at) VALUES (?,?,?,?,?,?,?)').run(newId, collection, json, status, sort, now(), now());
  audit(userId, 'item.create', newId);
  return newId;
}

export function deleteItem(id: string, userId: string) {
  db().prepare('DELETE FROM items WHERE id = ?').run(id);
  audit(userId, 'item.delete', id);
}

// --- Forms ------------------------------------------------------------------

export function getForm(key: FormKey): FormDef {
  const row = db().prepare('SELECT definition FROM forms WHERE key = ?').get(key) as { definition: string } | undefined;
  const base = DEFAULT_FORMS[key];
  if (!row) return base;
  const stored = JSON.parse(row.definition) as FormDef;
  // Never allow locked system fields to disappear, even if stored data is edited by hand.
  const keys = new Set(stored.fields.map((f) => f.key));
  for (const f of base.fields) if (f.locked && !keys.has(f.key)) stored.fields.unshift(f);
  for (const f of stored.fields) {
    const b = base.fields.find((x) => x.key === f.key);
    if (b?.locked) { f.locked = true; f.enabled = true; f.type = b.type; if (b.key === 'email' || b.key === 'name') f.required = true; }
  }
  return { ...base, ...stored, sheets: { ...base.sheets, ...stored.sheets }, key };
}

export function saveForm(key: FormKey, def: FormDef, userId: string) {
  db().prepare('UPDATE forms SET definition = ?, updated_at = ? WHERE key = ?').run(JSON.stringify({ ...def, key }), now(), key);
  audit(userId, 'form.save', key);
}

// --- Placeholder audit -------------------------------------------------------

/** Lists [BRACKETED PLACEHOLDERS] still present in published content, for the launch checklist. */
export function findPublishedPlaceholders(): { doc: string; title: string; text: string }[] {
  const out: { doc: string; title: string; text: string }[] = [];
  const re = /\[(?:[A-Z][A-Z0-9 ,/&'’—–:\-().]{3,}|LEGAL REVIEW:[^\]]*|CONFIRM[^\]]*)\]/g;
  const rows = db().prepare('SELECT key, published FROM content').all() as { key: string; published: string | null }[];
  for (const r of rows) {
    if (!r.published) continue;
    const found = new Set(r.published.match(re) ?? []);
    for (const t of found) out.push({ doc: r.key, title: DOC_MAP[r.key]?.title ?? r.key, text: t.length > 90 ? t.slice(0, 87) + '…]' : t });
  }
  const items = db().prepare("SELECT id, collection, data FROM items WHERE status = 'published'").all() as { id: string; collection: string; data: string }[];
  for (const it of items) for (const t of new Set(it.data.match(re) ?? [])) out.push({ doc: it.collection, title: `${it.collection} item`, text: t });
  return out;
}
