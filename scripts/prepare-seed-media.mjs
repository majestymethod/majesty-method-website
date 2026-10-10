// Generates responsive WebP variants for the seed images (run once; outputs are committed).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('seed/media');
fs.mkdirSync(out, { recursive: true });
const items = [
  { id: 'seed-logo-mark', src: 'seed/logo-mark.png', widths: [160, 320, 722], alt: 'Majesty Method monogram' },
  { id: 'seed-hero-entry', src: 'seed/hero-entry.jpg', widths: [640, 1080, 1600, 2400], alt: '' },
  // Owner-supplied photographs
  { id: 'seed-entry-architecture', src: 'seed/photos/entry-architecture.jpg', widths: [640, 1080, 1600, 2061], alt: 'Curved white balconies of a modern building, in black and white', mono: true },
  { id: 'seed-founder', src: 'seed/photos/founder-adelade-nyarirangwe.png', widths: [480, 800, 1122], alt: 'Adelade Nyarirangwe, founder of Majesty Method, in an emerald suit' },
  { id: 'seed-bootcamp', src: 'seed/photos/bootcamp-think-bigger.jpg', widths: [480, 736], alt: 'A person in a dark suit holding up a newspaper that reads “Think bigger”' },
  { id: 'seed-acceleration', src: 'seed/photos/acceleration-team-strategy.jpg', widths: [640, 1080, 1600], alt: 'A team working through marketing strategy documents around a table' },
  { id: 'seed-webinars', src: 'seed/photos/webinars-portrait.png', widths: [480, 800, 1122], alt: 'A smiling woman in a cream dress seated in a studio' },
  { id: 'seed-courses', src: 'seed/photos/courses-social-apps.jpg', widths: [640, 1080, 1600], alt: 'A phone screen showing a folder of social media apps' },
  { id: 'seed-resources', src: 'seed/photos/resources-break-the-internet.jpg', widths: [480, 800, 1200], alt: 'A hand holding a phone with letter tiles spelling “Break the internet”' },
];
const manifest = [];
for (const it of items) {
  const meta = await sharp(it.src).metadata();
  const variants = [];
  for (const w of it.widths.filter((w) => w <= meta.width)) {
    const file = `${it.id}-${w}.webp`;
    let pipe = sharp(it.src).resize({ width: w });
    if (it.mono) pipe = pipe.grayscale().linear(1.08, -6); // black-and-white with a touch more contrast
    const info = await pipe.webp({ quality: it.id.includes('logo') ? 90 : 80, alphaQuality: 100 }).toFile(path.join(out, file));
    variants.push({ w, file, h: info.height });
  }
  manifest.push({ id: it.id, original_name: path.basename(it.src), mime: 'image/webp', width: meta.width, height: meta.height, variants, alt: it.alt });
}
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(manifest.map((m) => `${m.id}: ${m.variants.map((v) => v.w).join(',')}`).join('\n'));
