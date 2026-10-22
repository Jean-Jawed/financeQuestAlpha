"""
FINANCEQUEST - Traitement des gravures (direction artistique « La Corbeille »)

Les sources (assets-src/gravures/, générées sur Gemini, non versionnées) sont des gravures noir
sur blanc. Ce script les uniformise comme le ferait une impression :
  1. niveaux de gris, puis courbe de niveaux (blancs purs, noirs denses) ;
  2. l'encre devient l'opacité : le papier blanc devient transparent ;
  3. l'encre est teintée (ivoire ou laiton) pour se poser sur le fond sombre ;
  4. export WebP redimensionné.

Usage : python scripts/process-engravings.py
Dépendance : Pillow
"""

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "gravures"
OUT = ROOT / "public" / "gravures"

# Teintes d'encre (voir docs/reviewOct2026/10_direction_artistique.md)
PAPER = (239, 230, 210)  # ivoire
BRASS = (201, 164, 92)  # laiton
INK = (27, 36, 32)  # encre, pour une impression positive sur papier ivoire

# Recadrage de la source (gauche, haut, droite, bas) : cadre dessiné à retirer
CROPS = {
    "corbeille.jpg": (58, 52, 1320, 714),
}

# source -> (sortie, largeur max, teinte, point blanc, point noir, fond opaque)
# Largeur max = 2 × la plus grande taille d'affichage (écrans haute densité) ;
# next/image sert ensuite des versions réduites selon l'écran.
# Point blanc : en dessous de cette luminance d'encre, le papier est effacé.
# Fond opaque : image posée sur un aplat connu, pas besoin de transparence
# (fichier bien plus léger).
ASSETS = {
    # Scène avec des visages : impression positive (encre sur papier), le négatif
    # les assombrirait. Affichée jusqu'à ~1140 px de large sur l'accueil.
    "corbeille.jpg": ("corbeille", 1262, INK, 0.06, 0.80, PAPER),
    # Connexion : hauteur max 62vh (~670 px sur un écran 1080p) ; 1 000 px de haut suffisent
    "palais.jpg": ("palais", 750, PAPER, 0.10, 0.85, None),
    "taureau.jpg": ("taureau", 400, PAPER, 0.08, 0.80, None),  # 200 px max
    "telescripteur.png": ("telescripteur", 640, PAPER, 0.08, 0.80, None),  # 320 px (Le jeu)
    "sablier.png": ("sablier", 360, PAPER, 0.08, 0.80, None),  # 176 px max
    "loupe_b.png": ("loupe", 280, PAPER, 0.08, 0.80, None),  # 140 px
    "laurier.png": ("laurier", 320, BRASS, 0.08, 0.75, None),  # 160 px max
    # La Gazette : gravures d'articles, impression positive sur papier (cartes et
    # en-tête d'article, jusqu'à ~1000 px) ; la source fait 1024 px de large
    "apprenti.jpg": ("apprenti", 1024, INK, 0.06, 0.80, PAPER),
    "automate.jpg": ("automate", 1024, INK, 0.06, 0.80, PAPER),
    "gazette.jpg": ("gazette", 560, PAPER, 0.08, 0.80, None),  # 280 px (une du magazine)
}

# Images de partage (Open Graph) : JPEG en impression positive, recadrées au format
# du cadre de lib/og.tsx (372 x 412), à 2x
OG_OUT = ROOT / "public" / "og"
OG_SIZE = (744, 824)
OG_SOURCES = ["corbeille.jpg", "apprenti.jpg", "automate.jpg"]


def engrave(
    src: Path,
    width: int,
    tint: tuple[int, int, int],
    low: float,
    high: float,
    background: tuple[int, int, int] | None,
) -> Image.Image:
    source = Image.open(src).convert("RGB")
    if src.name in CROPS:
        source = source.crop(CROPS[src.name])
    gray = ImageOps.grayscale(source)
    if gray.width > width:
        gray = gray.resize((width, round(gray.height * width / gray.width)), Image.LANCZOS)

    # Encre = 1 - luminance, recadrée entre low et high
    def level(v: int) -> int:
        ink = 1 - v / 255
        ink = (ink - low) / (high - low)
        return round(255 * min(max(ink, 0.0), 1.0))

    alpha = gray.point(level)
    out = Image.new("RGBA", gray.size, tint + (0,))
    out.putalpha(alpha)
    if background is None:
        return out
    # Aplatit l'encre sur le fond : WebP sans canal alpha
    flat = Image.new("RGB", gray.size, background)
    flat.paste(out, mask=out)
    return flat


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (stem, width, tint, low, high, background) in ASSETS.items():
        image = engrave(SRC / name, width, tint, low, high, background)
        target = OUT / f"{stem}.webp"
        image.save(target, "WEBP", quality=78, method=6)
        print(f"{target.relative_to(ROOT)}  {image.size[0]}x{image.size[1]}  {target.stat().st_size // 1024} Ko")

    OG_OUT.mkdir(parents=True, exist_ok=True)
    for name in OG_SOURCES:
        print_ = engrave(SRC / name, 2000, INK, 0.06, 0.80, PAPER)
        cover = ImageOps.fit(print_, OG_SIZE, Image.LANCZOS, centering=(0.5, 0.45))
        target = OG_OUT / f"{Path(name).stem}.jpg"
        cover.save(target, "JPEG", quality=80, optimize=True, progressive=True)
        print(f"{target.relative_to(ROOT)}  {cover.size[0]}x{cover.size[1]}  {target.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
