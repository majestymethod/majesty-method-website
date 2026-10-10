import { COLLECTION_MAP } from '@/lib/content/schema';
import { listItems, saveItem } from '@/lib/content/store';
import { sanitizeBySchema } from '@/lib/content/sanitize';
import { requireUser, fail, ok, readJson } from '@/lib/api';

type Ctx = { params: Promise<{ collection: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const { collection } = await params;
  if (!COLLECTION_MAP[collection]) return fail(404, 'Not found');
  return ok({ items: listItems(collection, { includeDrafts: true }) });
}

export async function POST(req: Request, { params }: Ctx) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const { collection } = await params;
  const def = COLLECTION_MAP[collection];
  if (!def) return fail(404, 'Not found');
  const body = await readJson<{ data: unknown; status: string; sort: number }>(req);
  if (!body) return fail(400, 'Could not read the item.');
  const data = sanitizeBySchema(def.fields, body.data);
  const missing = def.fields.filter((f) => f.required && !data[f.key]).map((f) => f.label);
  const status = body.status === 'published' ? 'published' : 'draft';
  if (status === 'published' && missing.length) return fail(422, `Fill in before publishing: ${missing.join(', ')}`);
  const id = saveItem(collection, null, data, status, Number(body.sort) || 0, u.id);
  return ok({ id });
}
