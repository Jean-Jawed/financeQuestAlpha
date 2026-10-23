"""
FINANCEQUEST - IMAGES LIBRES DE DROITS : TRAITEMENT
Gravures, dessins et photographies d'archives (assets-src/libres/, voir
fetch-commons.py) passés en bichromie encre et papier ivoire, pour s'accorder aux
gravures du site, puis recadrés et enregistrés en WebP dans public/mag/.

    python scripts/process-libres.py
"""

import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets-src' / 'libres'
OUT = ROOT / 'public' / 'mag'

INK = (27, 36, 32)
PAPER = (239, 230, 210)

# Largeur des articles : environ 680 px ; 2x pour les écrans haute densité
WIDTH = 1360

# nom -> recadrage en fractions (gauche, haut, droite, bas) de l'image source
IMAGES = {
    'foule-wall-street-1929': (0, 0, 1, 1),
    'courtier-telescripteur-1894': (0.02, 0.02, 0.98, 0.95),
    'telescripteur-edison': (0.05, 0.08, 0.95, 0.95),
    'triomphe-ours-1903': (0.04, 0.245, 0.96, 0.9),
    'activite-wall-street-1908': (0.02, 0.03, 0.98, 0.84),
    'bourse-paris-xixe': (0.08, 0.1, 0.92, 0.74),
    'obligation-1887': (0.01, 0.01, 0.99, 0.99),
    'bulle-mers-du-sud-1721': (0.01, 0.01, 0.99, 0.87),
    'bulle-mississippi-1720': (0.32, 0.27, 0.685, 0.83),
    'preteur-metsys-1514': (0, 0, 1, 1),
    'chute-or-1869': (0.04, 0.08, 0.96, 0.86),
    'panique-1907': (0, 0, 1, 1),
    'ours-wall-street-1907': (0, 0, 1, 0.92),
}

# Images de partage (cadre de lib/og.tsx, 372 x 412, à 2x)
OG_OUT = ROOT / 'public' / 'og'
OG_SIZE = (744, 824)
# Dimensions des images, lues par les articles (next/image)
MANIFEST = ROOT / 'content' / 'mag' / 'images.json'


def duotone(image: Image.Image) -> Image.Image:
    """Niveaux de gris étirés, puis teinte de l'encre (ombres) au papier (lumières)"""
    gray = ImageOps.autocontrast(ImageOps.grayscale(image), cutoff=1)
    return ImageOps.colorize(gray, black=INK, white=PAPER)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for name, (left, top, right, bottom) in IMAGES.items():
        source = Image.open(SRC / f'{name}.jpg').convert('RGB')
        w, h = source.size
        cropped = source.crop((round(left * w), round(top * h), round(right * w), round(bottom * h)))
        if cropped.width > WIDTH:
            cropped = cropped.resize((WIDTH, round(cropped.height * WIDTH / cropped.width)), Image.LANCZOS)
        target = OUT / f'{name}.webp'
        toned = duotone(cropped)
        toned.save(target, 'WEBP', quality=76, method=6)
        manifest[name] = {'width': toned.width, 'height': toned.height}
        ImageOps.fit(toned, OG_SIZE, Image.LANCZOS).save(OG_OUT / f'{name}.jpg', 'JPEG', quality=80, optimize=True)
        print(f'{target.relative_to(ROOT)}  {cropped.width}x{cropped.height}  {target.stat().st_size // 1024} Ko')

    MANIFEST.write_text(json.dumps(manifest, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
