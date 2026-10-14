"""Generates public/textures/stone-veins.webp: soft light veins and clouding on a transparent
background. Laid over dark green it reads as jade/marble; over near-black, as onyx."""
import numpy as np
from PIL import Image
from scipy import ndimage
W, H = 1400, 900
rng = np.random.default_rng(23)

def fbm(octaves, base):
    out = np.zeros((H, W))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        s = base * 2 ** o
        g = rng.random((H // s + 3, W // s + 3))
        z = ndimage.zoom(g, s, order=3)[:H, :W]
        out += amp * z; tot += amp; amp *= 0.5
    return out / tot

yy, xx = np.mgrid[0:H, 0:W] / max(W, H)
def turb(octaves, base):
    out = np.zeros((H, W)); amp = 1.0; tot = 0.0
    for o in range(octaves):
        s = max(int(base / 2 ** o), 2)
        g = rng.random((H // s + 3, W // s + 3)) * 2 - 1
        z = ndimage.zoom(g, s, order=3)[:H, :W]
        out += amp * np.abs(z); tot += amp; amp *= 0.55
    return out / tot
norm = lambda a: (a - a.min()) / (a.max() - a.min() + 1e-9)
smooth = lambda sig: norm(ndimage.gaussian_filter(rng.random((H, W)), sig)) * 2 - 1
t1 = smooth(120) * 1.0 + smooth(40) * 0.25 + smooth(12) * 0.05
t2 = smooth(110) * 1.0 + smooth(35) * 0.3 + smooth(10) * 0.05
fade1, fade2 = norm(smooth(90)), norm(smooth(70))
# Diagonal marble veins: a sine field bent by turbulence; sharp troughs become veins
d1 = (xx * 0.9 + yy * 0.45) * 3.0 + t1 * 0.9
d2 = (xx * 0.35 - yy * 0.95) * 2.4 + t2 * 0.8
vein1 = np.exp(-np.abs(np.sin(d1 * np.pi)) * 22) * (0.35 + 0.65 * fade1)
vein2 = np.exp(-np.abs(np.sin(d2 * np.pi)) * 38) * (0.2 + 0.8 * fade2) * 0.55
haze = ndimage.gaussian_filter(np.exp(-np.abs(np.sin(d1 * np.pi)) * 5), 6) * 0.35
veins = ndimage.gaussian_filter(vein1 + vein2, 0.8) + haze
cloud = norm(smooth(140))
alpha = np.clip(veins * 0.19 + cloud * 0.03, 0, 0.22)
rgb = np.zeros((H, W, 3)); rgb[..., 0], rgb[..., 1], rgb[..., 2] = 238, 232, 214
img = np.dstack([rgb, alpha * 255]).astype(np.uint8)
Image.fromarray(img, 'RGBA').save('public/textures/stone-veins.webp', quality=80, alpha_quality=95, method=6)
print('ok')
