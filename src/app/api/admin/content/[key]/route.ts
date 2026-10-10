import { DOC_MAP } from '@/lib/content/schema';
import { getDoc, getDocMeta, saveDraft, publishDoc, discardDraft, resetDocToDefault } from '@/lib/content/store';
import { sanitizeBySchema } from '@/lib/content/sanitize';
import { requireUser, fail, ok, readJson } from '@/lib/api';

type Ctx = { params: Promise<{ key: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const { key } = await params;
  if (!DOC_MAP[key]) return fail(404, 'Not found');
  if (key === 'settings' && u.role !== 'owner') return fail(403, 'Only owners can change business details and settings.');
  return ok({ data: getDoc(key, true), meta: getDocMeta(key) });
}

export async function PUT(req: Request, { params }: Ctx) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const { key } = await params;
  const def = DOC_MAP[key];
  if (!def) return fail(404, 'Not found');
  if (key === 'settings' && u.role !== 'owner') return fail(403, 'Only owners can change business details and settings.');
  const body = await readJson<{ data: unknown }>(req);
  if (!body) return fail(400, 'Could not read the changes.');
  saveDraft(key, sanitizeBySchema(def.fields, body.data), u.id);
  return ok({ meta: getDocMeta(key) });
}

export async function POST(req: Request, { params }: Ctx) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const { key } = await params;
  if (!DOC_MAP[key]) return fail(404, 'Not found');
  const body = await readJson<{ action: string }>(req, 1000);
  if (body?.action === 'publish') publishDoc(key, u.id);
  else if (body?.action === 'discard') discardDraft(key, u.id);
  else if (body?.action === 'reset') resetDocToDefault(key, u.id);
  else return fail(400, 'Unknown action');
  return ok({ data: getDoc(key, true), meta: getDocMeta(key) });
}
