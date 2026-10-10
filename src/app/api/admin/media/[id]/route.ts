import { db, audit } from '@/lib/db';
import { deleteMedia, getMedia } from '@/lib/media';
import { requireUser, ok, fail, readJson } from '@/lib/api';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const { id } = await params;
  const body = await readJson<{ alt: string }>(req, 2000);
  db().prepare('UPDATE media SET alt = ? WHERE id = ?').run(String(body?.alt || '').slice(0, 300), id);
  return ok({ media: getMedia(id) });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const { id } = await params;
  const needle = `"id":"${id}"`;
  const used = db().prepare('SELECT key FROM content WHERE draft LIKE ? OR published LIKE ?').all(`%${needle}%`, `%${needle}%`) as { key: string }[];
  const usedItems = db().prepare('SELECT id FROM items WHERE data LIKE ?').all(`%${needle}%`);
  if (used.length || usedItems.length) return fail(409, `This image is still in use (${[...used.map((x) => x.key), ...(usedItems.length ? [`${usedItems.length} listing item(s)`] : [])].join(', ')}). Replace it there first.`);
  deleteMedia(id);
  audit(u.id, 'media.delete', id);
  return ok();
}
