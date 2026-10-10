import { storePrivateFile } from '@/lib/media';
import { audit } from '@/lib/db';
import { requireUser, ok, fail } from '@/lib/api';

export async function POST(req: Request) {
  const u = await requireUser(req); if (u instanceof Response) return u;
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return fail(400, 'Choose a file to upload.');
  try {
    const f = storePrivateFile(Buffer.from(await file.arrayBuffer()), file.name);
    audit(u.id, 'file.upload', f.id);
    return ok({ file: { id: f.id, name: f.original_name, size: f.size } });
  } catch (e) {
    return fail(400, e instanceof Error ? e.message : 'Upload failed.');
  }
}
