import fs from 'node:fs';
import path from 'node:path';
import { MEDIA_DIR, db } from '@/lib/db';

const SAFE = /^[a-z0-9-]+(?:-\d+)?\.(webp|svg)$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  db(); // ensure data dir + seed media exist
  const { file } = await params;
  if (!SAFE.test(file)) return new Response('Not found', { status: 404 });
  const p = path.join(MEDIA_DIR, path.basename(file));
  if (!fs.existsSync(p)) return new Response('Not found', { status: 404 });
  const svg = file.endsWith('.svg');
  return new Response(fs.readFileSync(p), {
    headers: {
      'Content-Type': svg ? 'image/svg+xml' : 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      ...(svg ? { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" } : {}),
    },
  });
}
