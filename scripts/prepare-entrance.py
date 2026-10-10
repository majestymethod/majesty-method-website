"""
Builds the layered Grand Entrance from the owner's artwork (seed/entrance/grand-entrance-original.png).

Layers (all in the image's own 1672×940 coordinate space, cropped to their bounding boxes):
  base       – the entrance with the ribbon removed and the doorway repainted as a lit interior
  leaf-l/-r  – the two emerald door leaves (incl. the logo and welcome text), ribbon removed
  ribbon-l/-r– the two halves of the satin ribbon
  seal       – the gold wax seal
Writes WebP layers to public/entrance/ and their positions to src/components/entrance-layout.json.

Run: python3 scripts/prepare-entrance.py
"""
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

SRC = 'seed/entrance/grand-entrance-original.png'
OUT = 'public/entrance'
im = Image.open(SRC).convert('RGB')
W, H = im.size
A = np.asarray(im).astype(np.float32)

# ---------------------------------------------------------------- geometry (traced from the artwork)
SEAL_C, SEAL_R = (836, 496), 45
CX = 836  # centre line of the double door
RIB_L = [(431, 430), (580, 449), (700, 464), (800, 479), (CX, 485), (CX, 501), (800, 496), (750, 507), (700, 519), (650, 527), (580, 529), (500, 525), (431, 520)]
RIB_R = [(CX, 485), (873, 479), (1000, 459), (1100, 447), (1243, 429), (1243, 521), (1130, 527), (1060, 529), (1000, 522), (900, 501), (CX, 501)]
DOOR_X0, DOOR_X1, DOOR_TOP, DOOR_SPRING, DOOR_BOTTOM = 577, 1095, 2, 128, 748


def poly_mask(points, grow=0):
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon(points, fill=255)
    if grow:
        m = m.filter(ImageFilter.MaxFilter(grow * 2 + 1))
    return np.asarray(m).astype(np.float32) / 255


def arch_mask():
    """Flattened arch: straight sides, elliptical top."""
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)
    d.rectangle([DOOR_X0, DOOR_SPRING, DOOR_X1, DOOR_BOTTOM], fill=255)
    d.ellipse([DOOR_X0, DOOR_TOP, DOOR_X1, DOOR_SPRING * 2 - DOOR_TOP], fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255


rib_l = poly_mask(RIB_L, grow=3)
rib_r = poly_mask(RIB_R, grow=3)
yy, xx = np.mgrid[0:H, 0:W]
seal = ((xx - SEAL_C[0]) ** 2 + (yy - SEAL_C[1]) ** 2 <= SEAL_R ** 2).astype(np.float32)
seal_soft = np.asarray(Image.fromarray((seal * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
ribbon_any = np.clip(rib_l + rib_r + seal, 0, 1)
hole = ndimage.binary_dilation(ribbon_any > 0.01, iterations=4)


def fill_vertical(arr, hole_mask, rng):
    """Fill masked pixels column by column by interpolating between the pixels just above and below.
    The architecture under the ribbon is vertical (pillars, light strips, door seam), so this reconstructs it cleanly."""
    out = arr.copy()
    for x in np.where(hole_mask.any(axis=0))[0]:
        col = hole_mask[:, x]
        ys = np.where(col)[0]
        # contiguous runs
        runs = np.split(ys, np.where(np.diff(ys) != 1)[0] + 1)
        for r in runs:
            y0, y1 = max(r[0] - 3, 0), min(r[-1] + 3, H - 1)
            top = arr[max(y0 - 4, 0):y0 + 1, x].mean(axis=0)
            bot = arr[y1:min(y1 + 5, H), x].mean(axis=0)
            t = np.linspace(0, 1, y1 - y0 + 1)[:, None]
            out[y0:y1 + 1, x] = top * (1 - t) + bot * t
    noise = rng.normal(0, 1.6, out.shape).astype(np.float32)
    out = np.where(hole_mask[..., None], out + noise, out)
    return np.clip(out, 0, 255)


rng = np.random.default_rng(7)
clean = fill_vertical(A, hole, rng)
# gentle smoothing of the filled band only (horizontal), to hide column streaks
blur = np.asarray(Image.fromarray(clean.astype(np.uint8)).filter(ImageFilter.BoxBlur(1))).astype(np.float32)
clean = np.where(hole[..., None], blur, clean)

# ---------------------------------------------------------------- lit interior behind the doors
arch = arch_mask()
ix = (xx - CX) / ((DOOR_X1 - DOOR_X0) / 2)
iy = (yy - 430) / 360
r = np.sqrt(ix ** 2 * 0.9 + iy ** 2 * 0.7)
glow = np.clip(1.08 - r, 0, 1) ** 1.05
c_core = np.array([255, 254, 249], np.float32)
c_mid = np.array([251, 244, 228], np.float32)
c_edge = np.array([226, 204, 156], np.float32)
interior = c_edge * (1 - glow[..., None]) + c_mid * glow[..., None]
interior = interior * (1 - glow[..., None] ** 2) + c_core * glow[..., None] ** 2
# polished floor with a soft reflection
floor = np.clip((yy - 640) / 110, 0, 1)[..., None]
interior = interior * (1 - 0.25 * floor) + np.array([250, 244, 230], np.float32) * 0.25 * floor
# faint vertical light rays
rays = (0.5 + 0.5 * np.sin((xx - CX) / 23.0)) * np.clip(1 - np.abs(ix), 0, 1) * np.clip(1 - (yy / 760), 0, 1)
interior += rays[..., None] * 10
interior = np.clip(interior, 0, 255)
base = clean * (1 - arch[..., None]) + interior * arch[..., None]


def save_layer(name, rgb, alpha, pad=2, quality=86):
    ys, xs = np.where(alpha > 0.003)
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, W)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, H)
    rgba = np.dstack([rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1] * 255]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(f'{OUT}/{name}.webp', quality=quality, alpha_quality=95, method=6)
    return {'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0)}


import os
os.makedirs(OUT, exist_ok=True)
layout = {'width': W, 'height': H, 'seal': {'cx': SEAL_C[0], 'cy': SEAL_C[1], 'r': SEAL_R}, 'door': {'x0': DOOR_X0, 'x1': DOOR_X1, 'top': DOOR_TOP, 'bottom': DOOR_BOTTOM}}

# Base: full frame, no alpha. Two sizes for responsive loading.
base_img = Image.fromarray(base.astype(np.uint8))
for w in (1672, 1100):
    base_img.resize((w, round(H * w / W)), Image.LANCZOS).save(f'{OUT}/base-{w}.webp', quality=72, method=6)

# Door leaves: clean door (ribbon removed), split at the centre seam, clipped to the arch.
leaf_alpha_l = arch * (xx < CX + 0.5)
leaf_alpha_r = arch * (xx >= CX - 0.5)
layout['leafL'] = save_layer('leaf-l', clean, leaf_alpha_l)
layout['leafR'] = save_layer('leaf-r', clean, leaf_alpha_r)
# Arch mask for clipping the sliding leaves
am = (arch * 255).astype(np.uint8)
ab = layout['door']
Image.fromarray(am[DOOR_TOP - 2:DOOR_BOTTOM + 3, DOOR_X0 - 2:DOOR_X1 + 3]).save(f'{OUT}/arch-mask.png', optimize=True)
layout['archBox'] = {'x': DOOR_X0 - 2, 'y': DOOR_TOP - 2, 'w': DOOR_X1 - DOOR_X0 + 5, 'h': DOOR_BOTTOM - DOOR_TOP + 5}

# Ribbon halves (original pixels) and seal
soft = lambda m: np.asarray(Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))).astype(np.float32) / 255
layout['ribbonL'] = save_layer('ribbon-l', A, soft(rib_l) * (1 - seal))
layout['ribbonR'] = save_layer('ribbon-r', A, soft(rib_r) * (1 - seal))
layout['sealBox'] = save_layer('seal', A, seal_soft, quality=90)

with open('src/components/entrance-layout.json', 'w') as f:
    json.dump(layout, f, indent=2)

# Verification composites
def composite(opened=0.0):
    canvas = base_img.convert('RGBA')
    for n in ['leaf-l', 'leaf-r', 'ribbon-l', 'ribbon-r', 'seal']:
        key = {'leaf-l': 'leafL', 'leaf-r': 'leafR', 'ribbon-l': 'ribbonL', 'ribbon-r': 'ribbonR', 'seal': 'sealBox'}[n]
        b = layout[key]
        layer = Image.open(f'{OUT}/{n}.webp').convert('RGBA')
        canvas.alpha_composite(layer, (b['x'], b['y']))
    return canvas.convert('RGB')

composite().save('/tmp/claude-0/entrance-recomposed.png')
diff = np.abs(np.asarray(composite()).astype(int) - A.astype(int))
print('mean abs diff vs original:', round(diff.mean(), 2), ' 99th pct:', np.percentile(diff, 99))
base_img.save('/tmp/claude-0/entrance-base.png')
print(json.dumps(layout))
