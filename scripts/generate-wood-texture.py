"""Texture de noyer verni (raccord sans couture) : public/textures/noyer.webp

Bruit périodique filtré dans Fourier, fil du bois légèrement ondulé.
Usage : python -I scripts/generate-wood-texture.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

OUT = Path(__file__).resolve().parent.parent / 'public' / 'textures' / 'noyer.webp'
N = 768
rng = np.random.default_rng(11)


def pnoise(shape, cutoff):
    """Bruit périodique : filtre gaussien dans l'espace des fréquences"""
    spectrum = np.fft.fft2(rng.standard_normal(shape))
    fy = np.fft.fftfreq(shape[0])[:, None]
    fx = np.fft.fftfreq(shape[1])[None, :]
    spectrum *= np.exp(-((fx / cutoff[1]) ** 2 + (fy / cutoff[0]) ** 2))
    n = np.real(np.fft.ifft2(spectrum))
    return (n - n.mean()) / n.std()


iy, ix = np.mgrid[0:N, 0:N]
warp = pnoise((N, N), (0.006, 0.004))
wy = (iy + (warp * 14).astype(int)) % N
rings = np.sin(2 * np.pi * (wy / N * 6))
fibers = pnoise((N, N), (0.35, 0.004))[wy, ix]
streak = pnoise((N, N), (0.06, 0.002))[wy, ix]
knot = pnoise((N, N), (0.01, 0.01))
t = np.clip(0.5 + 0.16 * rings + 0.2 * np.tanh(fibers * 0.8) + 0.1 * streak + 0.05 * knot, 0, 1)[..., None]

dark, mid, light = np.array([0x1E, 0x11, 0x0A]), np.array([0x3E, 0x23, 0x14]), np.array([0x60, 0x38, 0x21])
img = np.where(t < 0.5, dark + (mid - dark) * (t / 0.5), mid + (light - mid) * ((t - 0.5) / 0.5))
im = Image.fromarray(np.clip(img, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.6))
OUT.parent.mkdir(parents=True, exist_ok=True)
im.save(OUT, 'WEBP', quality=78, method=6)
print(OUT, OUT.stat().st_size, 'octets')
