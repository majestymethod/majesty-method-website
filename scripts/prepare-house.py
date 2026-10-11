"""
Builds the House of Majesty entrance layers from the owner's two artworks:
  seed/house/exterior-original.png  – the arrival (corridor, glass doors, emerald ribbon, gold seal)
  seed/house/interior-original.png  – the lobby with the emerald (Majesty Method) and purple (TenderIQ) pathways

Exterior layers (in the artwork's own 1672×941 coordinate space, cropped to their boxes):
  ext-base     – the exterior with the ribbon and seal removed (two sizes)
  door-l/-r    – the two glass door leaves, ribbon removed
  ribbon-l/-r  – the two halves of the satin ribbon (original pixels)
  seal         – the gold wax seal (original pixels)
Interior: int-1672 / int-1100 / int-800 WebP (full frame, no edits).
Positions go to src/components/house-layout.json.

Run: python3 scripts/prepare-house.py
"""
import json
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

EXT = 'seed/house/exterior-original.png'
INT = 'seed/house/interior-original.png'
OUT = 'public/house'
os.makedirs(OUT, exist_ok=True)

ext = Image.open(EXT).convert('RGB')
W, H = ext.size
A = np.asarray(ext).astype(np.float32)

# ------------------------------------------------------------ geometry traced from the exterior artwork
SEAL_C, SEAL_R = (836, 545), 37
CX = 836
RIB_L = [(503, 490), (560, 493), (630, 501), (700, 511), (760, 520), (806, 529), (822, 533),
         (822, 559), (806, 562), (760, 564), (700, 567), (630, 569), (560, 572), (503, 576)]
RIB_R = [(850, 533), (867, 529), (912, 520), (972, 511), (1042, 501), (1112, 493), (1170, 490),
         (1170, 576), (1112, 572), (1042, 569), (972, 567), (912, 564), (867, 562), (850, 559)]
DOOR = {'x0': 690, 'x1': 982, 'y0': 416, 'y1': 781}


def poly_mask(points, grow=0):
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon(points, fill=255)
    if grow:
        m = m.filter(ImageFilter.MaxFilter(grow * 2 + 1))
    return np.asarray(m).astype(np.float32) / 255


yy, xx = np.mgrid[0:H, 0:W]
rib_l = poly_mask(RIB_L, grow=3)
rib_r = poly_mask(RIB_R, grow=3)
seal = (((xx - SEAL_C[0]) ** 2 + (yy - SEAL_C[1]) ** 2) <= SEAL_R ** 2).astype(np.float32)
hole = ndimage.binary_dilation(np.clip(rib_l + rib_r + seal, 0, 1) > 0.01, iterations=4)


def fill_vertical(arr, hole_mask, rng):
    """Columns under the ribbon are vertical architecture (pillars, frames, glass), so interpolate each
    column between the pixels just above and just below the ribbon."""
    out = arr.copy()
    for x in np.where(hole_mask.any(axis=0))[0]:
        ys = np.where(hole_mask[:, x])[0]
        for r in np.split(ys, np.where(np.diff(ys) != 1)[0] + 1):
            y0, y1 = max(r[0] - 3, 0), min(r[-1] + 3, H - 1)
            top = arr[max(y0 - 4, 0):y0 + 1, x].mean(axis=0)
            bot = arr[y1:min(y1 + 5, H), x].mean(axis=0)
            t = np.linspace(0, 1, y1 - y0 + 1)[:, None]
            out[y0:y1 + 1, x] = top * (1 - t) + bot * t
    out = np.where(hole_mask[..., None], out + rng.normal(0, 1.4, out.shape).astype(np.float32), out)
    return np.clip(out, 0, 255)


clean = fill_vertical(A, hole, np.random.default_rng(11))
blur = np.asarray(Image.fromarray(clean.astype(np.uint8)).filter(ImageFilter.BoxBlur(1))).astype(np.float32)
clean = np.where(hole[..., None], blur, clean)


def save_layer(name, rgb, alpha, quality=86):
    ys, xs = np.where(alpha > 0.003)
    x0, x1 = max(xs.min() - 2, 0), min(xs.max() + 3, W)
    y0, y1 = max(ys.min() - 2, 0), min(ys.max() + 3, H)
    rgba = np.dstack([rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1] * 255]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(f'{OUT}/{name}.webp', quality=quality, alpha_quality=95, method=6)
    return {'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0)}


layout = {'width': W, 'height': H, 'seal': {'cx': SEAL_C[0], 'cy': SEAL_C[1], 'r': SEAL_R},
          'door': {'x': DOOR['x0'], 'y': DOOR['y0'], 'w': DOOR['x1'] - DOOR['x0'], 'h': DOOR['y1'] - DOOR['y0']}}

base = Image.fromarray(clean.astype(np.uint8))
for w in (1672, 1100):
    base.resize((w, round(H * w / W)), Image.LANCZOS).save(f'{OUT}/ext-{w}.webp', quality=74, method=6)


def crop_rgb(name, x0, x1, y0, y1, quality=84):
    Image.fromarray(clean[y0:y1, x0:x1].astype(np.uint8)).save(f'{OUT}/{name}.webp', quality=quality, method=6)
    return {'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0}


layout['doorL'] = crop_rgb('door-l', DOOR['x0'], CX, DOOR['y0'], DOOR['y1'])
layout['doorR'] = crop_rgb('door-r', CX, DOOR['x1'], DOOR['y0'], DOOR['y1'])

soft = lambda m: np.asarray(Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))).astype(np.float32) / 255
seal_soft = np.asarray(Image.fromarray((seal * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))).astype(np.float32) / 255
layout['ribbonL'] = save_layer('ribbon-l', A, soft(rib_l) * (1 - seal))
layout['ribbonR'] = save_layer('ribbon-r', A, soft(rib_r) * (1 - seal))
layout['sealBox'] = save_layer('seal', A, seal_soft, quality=90)

# ------------------------------------------------------------ interior
inter = Image.open(INT).convert('RGB')
IW, IH = inter.size
for w in (1672, 1100, 800):
    inter.resize((w, round(IH * w / IW)), Image.LANCZOS).save(f'{OUT}/int-{w}.webp', quality=74, method=6)
layout['interior'] = {
    'width': IW, 'height': IH,
    # Clickable pathway areas and the parts that light up on hover (traced from the interior artwork)
    'mm': {'hit': {'x': 200, 'y': 150, 'w': 470, 'h': 750},
           'sign': {'x': 350, 'y': 158, 'w': 316, 'h': 199},
           'door': {'x': 395, 'y': 358, 'w': 232, 'h': 244},
           'carpet': [[440, 600], [585, 600], [405, 888], [205, 888]],
           'chip': {'x': 378, 'y': 760},
           'focus': {'x': 507, 'y': 380}},
    'tiq': {'hit': {'x': 1002, 'y': 150, 'w': 470, 'h': 750},
            'sign': {'x': 1007, 'y': 158, 'w': 313, 'h': 199},
            'door': {'x': 1045, 'y': 358, 'w': 232, 'h': 244},
            'carpet': [[1082, 597], [1203, 597], [1468, 888], [1250, 888]],
            'chip': {'x': 1296, 'y': 760},
            'focus': {'x': 1163, 'y': 380}},
}

with open('src/components/house-layout.json', 'w') as f:
    json.dump(layout, f, indent=2)

# ------------------------------------------------------------ verification: recompose the closed exterior
canvas = base.convert('RGBA')
for n, key in [('door-l', 'doorL'), ('door-r', 'doorR'), ('ribbon-l', 'ribbonL'), ('ribbon-r', 'ribbonR'), ('seal', 'sealBox')]:
    b = layout[key]
    canvas.alpha_composite(Image.open(f'{OUT}/{n}.webp').convert('RGBA'), (b['x'], b['y']))
comp = np.asarray(canvas.convert('RGB')).astype(int)
diff = np.abs(comp - A.astype(int))
print('recomposed vs original: mean', round(diff.mean(), 2), ' 99th pct', np.percentile(diff, 99))
canvas.convert('RGB').save('/tmp/claude-0/hx/recomposed.png')
base.save('/tmp/claude-0/hx/ext-clean.png')
for f in sorted(os.listdir(OUT)):
    print(f, os.path.getsize(f'{OUT}/{f}') // 1024, 'KB')
