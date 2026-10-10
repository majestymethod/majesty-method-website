import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { db, now, MEDIA_DIR, PRIVATE_DIR } from './db';

export interface MediaRow { id: string; original_name: string; mime: string; width: number | null; height: number | null; variants: { w: number; h: number; file: string }[]; alt: string; created_at: string }

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']);
const WIDTHS = [320, 640, 1080, 1600, 2400];
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export function getMedia(id: string | null | undefined): MediaRow | null {
  if (!id) return null;
  const r = db().prepare('SELECT * FROM media WHERE id = ?').get(id) as (Omit<MediaRow, 'variants'> & { variants: string }) | undefined;
  return r ? { ...r, variants: JSON.parse(r.variants) } : null;
}

export function listMedia(): MediaRow[] {
  return (db().prepare('SELECT * FROM media ORDER BY created_at DESC').all() as (Omit<MediaRow, 'variants'> & { variants: string })[]).map((r) => ({ ...r, variants: JSON.parse(r.variants) }));
}

export async function storeImage(buf: Buffer, originalName: string, mime: string, alt = ''): Promise<MediaRow> {
  if (!IMAGE_MIME.has(mime)) throw new Error('Unsupported image type. Use JPG, PNG, WebP, AVIF or SVG.');
  if (buf.length > MAX_IMAGE_BYTES) throw new Error('Image is larger than 15 MB.');
  const id = crypto.randomUUID();
  let variants: MediaRow['variants'] = [];
  let width: number | null = null, height: number | null = null;
  if (mime === 'image/svg+xml') {
    const text = buf.toString('utf8');
    if (/<script|on\w+\s*=|javascript:/i.test(text)) throw new Error('SVG contains scripts or event handlers and was rejected.');
    const file = `${id}.svg`;
    fs.writeFileSync(path.join(MEDIA_DIR, file), buf);
    variants = [{ w: 0, h: 0, file }];
  } else {
    const img = sharp(buf, { failOn: 'error' }).rotate(); // honour EXIF orientation, strip metadata
    const meta = await img.metadata();
    width = meta.width ?? null; height = meta.height ?? null;
    if (!width || !height) throw new Error('Could not read image dimensions.');
    const widths = WIDTHS.filter((w) => w < width!).concat(width > 2400 ? [] : [width]);
    for (const w of widths) {
      const file = `${id}-${w}.webp`;
      const info = await sharp(buf).rotate().resize({ width: w }).webp({ quality: 80 }).toFile(path.join(MEDIA_DIR, file));
      variants.push({ w, h: info.height, file });
    }
  }
  db().prepare('INSERT INTO media (id, original_name, mime, width, height, variants, alt, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, originalName.slice(0, 200), mime === 'image/svg+xml' ? mime : 'image/webp', width, height, JSON.stringify(variants), alt, now());
  return getMedia(id)!;
}

export function deleteMedia(id: string) {
  const m = getMedia(id);
  if (!m) return;
  for (const v of m.variants) fs.rmSync(path.join(MEDIA_DIR, v.file), { force: true });
  db().prepare('DELETE FROM media WHERE id = ?').run(id);
}

// ---- Private files (resource downloads) ------------------------------------

const FILE_MIME: Record<string, string> = {
  '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.zip': 'application/zip', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.csv': 'text/csv', '.txt': 'text/plain',
};
export const ALLOWED_FILE_EXT = Object.keys(FILE_MIME);

export interface FileRow { id: string; original_name: string; stored_name: string; mime: string; size: number; created_at: string }

export function storePrivateFile(buf: Buffer, originalName: string): FileRow {
  const ext = path.extname(originalName).toLowerCase();
  if (!FILE_MIME[ext]) throw new Error(`File type not allowed. Allowed: ${ALLOWED_FILE_EXT.join(', ')}`);
  if (buf.length > MAX_FILE_BYTES) throw new Error('File is larger than 25 MB.');
  const id = crypto.randomUUID();
  const stored = `${id}${ext}`;
  fs.writeFileSync(path.join(PRIVATE_DIR, stored), buf, { mode: 0o600 });
  const safeName = originalName.replace(/[^\w.\- ()]/g, '_').slice(0, 150);
  db().prepare('INSERT INTO files (id, original_name, stored_name, mime, size, created_at) VALUES (?,?,?,?,?,?)').run(id, safeName, stored, FILE_MIME[ext], buf.length, now());
  return getFile(id)!;
}

export function getFile(id: string | null | undefined): FileRow | null {
  if (!id) return null;
  return (db().prepare('SELECT * FROM files WHERE id = ?').get(id) as FileRow | undefined) ?? null;
}

export function readPrivateFile(f: FileRow): Buffer {
  return fs.readFileSync(path.join(PRIVATE_DIR, path.basename(f.stored_name)));
}
