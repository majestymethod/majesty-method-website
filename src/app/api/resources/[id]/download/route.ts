import { getItem } from '@/lib/content/store';
import { getFile, readPrivateFile } from '@/lib/media';
import { verifyToken } from '@/lib/security';
import { isPreview } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getItem<{ title: string; file: { id: string } | null; requiresRegistration: boolean }>(id);
  const preview = await isPreview();
  if (!item || item.collection !== 'resources' || (item.status !== 'published' && !preview)) return new Response('Not found', { status: 404 });
  const file = getFile(item.data.file?.id);
  if (!file) return new Response('Not found', { status: 404 });
  if (item.data.requiresRegistration && !preview) {
    const token = new URL(req.url).searchParams.get('t');
    if (verifyToken(token) !== `res:${id}`) {
      return Response.redirect(new URL(`/majesty-method/resources#${id}`, req.url), 303);
    }
  }
  return new Response(new Uint8Array(readPrivateFile(file)), {
    headers: {
      'Content-Type': file.mime,
      'Content-Length': String(file.size),
      'Content-Disposition': `attachment; filename="${file.original_name.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
