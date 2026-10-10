// Generates responsive WebP variants for the seed images (run once; outputs are committed).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('seed/media');
fs.mkdirSync(out, { recursive: true });
const items = [
  { id: 'seed-logo-mark', src: 'seed/logo-mark.png', widths: [160, 320, 722], alt: 'Majesty Method monogram' },
  { id: 'seed-hero-entry', src: 'seed/hero-entry.jpg', widths: [640, 1080, 1600, 2400], alt: '' },
];
const manifest = [];
for (const it of items) {
  const meta = await sharp(it.src).metadata();
  const variants = [];
  for (const w of it.widths.filter((w) => w <= meta.width)) {
    const file = `${it.id}-${w}.webp`;
    const info = await sharp(it.src).resize({ width: w }).webp({ quality: it.id.includes('hero') ? 78 : 90, alphaQuality: 100 }).toFile(path.join(out, file));
    variants.push({ w, file, h: info.height });
  }
  manifest.push({ id: it.id, original_name: path.basename(it.src), mime: 'image/webp', width: meta.width, height: meta.height, variants, alt: it.alt });
}
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(manifest.map((m) => `${m.id}: ${m.variants.map((v) => v.w).join(',')}`).join('\n'));
