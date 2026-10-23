"""
FINANCEQUEST - IMAGES LIBRES DE DROITS (Wikimedia Commons)
Télécharge les images listées dans scripts/commons-images.json (titre Commons → nom local)
dans assets-src/libres/, et écrit leurs crédits (auteur, licence, source) dans
content/mag/credits.json. Seules les licences du domaine public ou CC0 sont acceptées.

    python scripts/fetch-commons.py

Le script est relançable : une image déjà téléchargée n'est pas redemandée.
"""

import html
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIST = ROOT / 'scripts' / 'commons-images.json'
OUT = ROOT / 'assets-src' / 'libres'
CREDITS = ROOT / 'content' / 'mag' / 'credits.json'
UA = {'User-Agent': 'FinanceQuest/1.0 (https://virgule-studio.fr) image credits script'}
ACCEPTED = ('public domain', 'cc0', 'no restrictions', 'pd')
THUMB_WIDTH = 1600


def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({**params, 'format': 'json'})
    for attempt in range(5):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30))
        except urllib.error.HTTPError as error:
            if error.code != 429:
                raise
            time.sleep(10 * (attempt + 1))
    raise RuntimeError('Commons : trop de requêtes')


def plain(value: str) -> str:
    """Texte sans balises HTML (champ « Artist » de Commons)"""
    return html.unescape(re.sub(r'<[^>]+>', '', value or '')).strip()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    wanted = json.loads(LIST.read_text(encoding='utf-8'))
    credits = json.loads(CREDITS.read_text(encoding='utf-8')) if CREDITS.exists() else {}

    for title, slug in wanted.items():
        target = OUT / f'{slug}.jpg'
        if target.exists() and slug in credits:
            continue

        info = api({
            'action': 'query', 'titles': f'File:{title}', 'prop': 'imageinfo',
            'iiprop': 'url|extmetadata', 'iiurlwidth': THUMB_WIDTH,
            'iiextmetadatafilter': 'LicenseShortName|Artist|DateTimeOriginal|ObjectName',
        })
        page = next(iter(info['query']['pages'].values()))
        if 'imageinfo' not in page:
            print(f'!! introuvable : {title}')
            continue
        ii = page['imageinfo'][0]
        meta = ii.get('extmetadata', {})
        license_name = plain(meta.get('LicenseShortName', {}).get('value', ''))
        if not license_name.lower().startswith(ACCEPTED):
            print(f'!! licence refusée ({license_name}) : {title}')
            continue

        url = ii.get('thumburl') or ii['url']
        target.write_bytes(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())
        credits[slug] = {
            'title': plain(meta.get('ObjectName', {}).get('value', '')) or title.rsplit('.', 1)[0],
            'author': plain(meta.get('Artist', {}).get('value', '')) or 'Auteur inconnu',
            'date': plain(meta.get('DateTimeOriginal', {}).get('value', ''))[:40],
            'license': license_name,
            'source': ii['descriptionurl'],
        }
        print(f'ok {slug} ({license_name})')
        time.sleep(3)

    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
