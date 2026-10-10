import { listMedia, storeImage } from '@/lib/media';
import { audit } from '@/lib/db';
import { requireUser, ok, fail } from '@/lib/api';

export async function GET(req: Request) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  return ok({ items: listMedia() });
}

export async function POST(req: Request) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return fail(400, 'Choose an image to upload.');
  try {
    const m = await storeImage(Buffer.from(await file.arrayBuffer()), file.name, file.type, String(form?.get('alt') || '').slice(0, 300));
    audit(u.id, 'media.upload', m.id);
    return ok({ media: m });
  } catch (e) {
    return fail(400, e instanceof Error ? e.message : 'Upload failed.');
  }
}
