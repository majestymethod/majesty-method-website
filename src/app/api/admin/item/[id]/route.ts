import { COLLECTION_MAP } from '@/lib/content/schema';
import { getItem, saveItem, deleteItem } from '@/lib/content/store';
import { sanitizeBySchema } from '@/lib/content/sanitize';
import { requireUser, fail, ok, readJson } from '@/lib/api';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const item = getItem((await params).id);
  return item ? ok({ item }) : fail(404, 'Not found');
}

export async function PUT(req: Request, { params }: Ctx) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const item = getItem((await params).id);
  if (!item) return fail(404, 'Not found');
  const def = COLLECTION_MAP[item.collection];
  const body = await readJson<{ data: unknown; status: string; sort: number }>(req);
  if (!body) return fail(400, 'Could not read the item.');
  const data = sanitizeBySchema(def.fields, body.data);
  const status = body.status === 'published' ? 'published' : 'draft';
  const missing = def.fields.filter((f) => f.required && !data[f.key]).map((f) => f.label);
  if (status === 'published' && missing.length) return fail(422, `Fill in before publishing: ${missing.join(', ')}`);
  saveItem(item.collection, item.id, data, status, Number(body.sort) || 0, u.id);
  return ok();
}

export async function DELETE(req: Request, { params }: Ctx) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  deleteItem((await params).id, u.id);
  return ok();
}
