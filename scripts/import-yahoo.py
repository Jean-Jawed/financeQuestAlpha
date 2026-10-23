"""
FINANCEQUEST - IMPORT DES COURS DEPUIS YAHOO FINANCE
Ajoute à la base prix (SUPABASE_PRICES_URL) une clôture par actif actif et par jour,
sur une période donnée.

    python scripts/import-yahoo.py --from 2022-01-01 --to 2022-12-31 --dry-run
    python scripts/import-yahoo.py --from 2022-01-01 --to 2022-12-31

Les cours sont ajustés (dividendes et divisions d'actions), comme le reste de la base.
Yahoo recalcule tout l'historique ajusté à chaque nouveau dividende : les cours
importés aujourd'hui ne raccordent donc pas exactement à ceux déjà en base. Le script
lit aussi les semaines qui suivent (ou précèdent) la période, là où la base a déjà des
cours, en déduit pour chaque actif le rapport « base / Yahoo du jour », et l'applique à
la période importée : la série reste continue, sans réécrire les années déjà présentes.

Relançable : écriture par « insert ou mise à jour » sur la clé (asset_id, date).
"""

import argparse
import os
import statistics
import sys
import time
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import psycopg
import yfinance as yf

ROOT = Path(__file__).resolve().parent.parent
BATCH = 40
PAUSE_S = 2
OVERLAP_DAYS = 45
MAX_DAILY_MOVE = 0.40
# Au-delà, le raccord est jugé suspect (changement de ticker, données Yahoo modifiées)
MAX_JUNCTION_GAP = 0.10


def database_url() -> str:
    """SUPABASE_PRICES_URL depuis l'environnement, ou à défaut depuis .env.local"""
    url = os.environ.get('SUPABASE_PRICES_URL')
    if url:
        return url
    for line in (ROOT / '.env.local').read_text(encoding='utf-8').splitlines():
        key, _, value = line.partition('=')
        if key.strip() == 'SUPABASE_PRICES_URL':
            return value.strip().strip('"').strip("'")
    sys.exit('SUPABASE_PRICES_URL introuvable')


def fetch(symbols: list[str], start: date, end: date) -> dict[str, pd.DataFrame]:
    """Clôtures ajustées et volumes, par symbole Yahoo ; par lots, avec reprises"""
    out: dict[str, pd.DataFrame] = {}
    for i in range(0, len(symbols), BATCH):
        batch = symbols[i:i + BATCH]
        for attempt in range(4):
            try:
                data = yf.download(
                    batch, start=start.isoformat(), end=(end + timedelta(days=1)).isoformat(),
                    auto_adjust=True, actions=False, group_by='ticker', threads=True, progress=False,
                )
                break
            except Exception as error:  # Yahoo : trop de requêtes, coupure réseau
                wait = 15 * (attempt + 1)
                print(f'  lot {i // BATCH + 1} : {error} ; nouvel essai dans {wait} s')
                time.sleep(wait)
        else:
            sys.exit('Yahoo ne répond pas, abandon')

        for symbol in batch:
            if symbol not in data.columns.get_level_values(0):
                continue
            frame = data[symbol][['Close', 'Volume']].dropna(subset=['Close'])
            if not frame.empty:
                frame.index = pd.to_datetime(frame.index).date
                out[symbol] = frame
        print(f'  lot {i // BATCH + 1}/{-(-len(symbols) // BATCH)} : {len(batch)} symboles')
        time.sleep(PAUSE_S)
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--from', dest='start', required=True, type=date.fromisoformat)
    parser.add_argument('--to', dest='end', required=True, type=date.fromisoformat)
    parser.add_argument('--dry-run', action='store_true', help='tout sauf l\'écriture')
    args = parser.parse_args()

    with psycopg.connect(database_url(), sslmode='require') as conn:
        assets = conn.execute(
            'SELECT id, symbol, symbol_yahoo FROM assets WHERE is_active AND symbol_yahoo IS NOT NULL ORDER BY id'
        ).fetchall()
        # Cours déjà en base autour de la période, pour le raccord
        existing = conn.execute(
            '''SELECT asset_id, date, close_price::float FROM prices
               WHERE (date > %(end)s AND date <= %(end)s::date + %(days)s)
                  OR (date < %(start)s AND date >= %(start)s::date - %(days)s)''',
            {'start': args.start, 'end': args.end, 'days': OVERLAP_DAYS},
        ).fetchall()
        already = conn.execute(
            'SELECT count(*) FROM prices WHERE date BETWEEN %s AND %s', (args.start, args.end)
        ).fetchone()[0]

    known: dict[int, dict[date, float]] = {}
    for asset_id, day, close in existing:
        known.setdefault(asset_id, {})[day] = close

    print(f'{len(assets)} actifs ; {already} cours déjà en base sur la période')
    print(f'Yahoo : {args.start} → {args.end} (+ {OVERLAP_DAYS} j de raccord)')
    data = fetch(
        [a[2] for a in assets],
        args.start - timedelta(days=OVERLAP_DAYS),
        args.end + timedelta(days=OVERLAP_DAYS),
    )

    rows: list[tuple] = []
    missing, no_junction, odd_junction, big_moves, dropped = [], [], [], [], []
    for asset_id, symbol, yahoo in assets:
        frame = data.get(yahoo)
        if frame is None:
            missing.append(symbol)
            continue

        # Raccord : rapport médian base / Yahoo sur les jours communs hors période
        ratios = [
            known[asset_id][day] / float(close)
            for day, close in frame['Close'].items()
            if not (args.start <= day <= args.end) and day in known.get(asset_id, {}) and close
        ]
        if ratios:
            factor = statistics.median(ratios)
            if abs(factor - 1) > MAX_JUNCTION_GAP:
                odd_junction.append(f'{symbol} ×{factor:.3f}')
        else:
            factor = 1.0
            if known.get(asset_id):
                no_junction.append(symbol)

        period = frame[(frame.index >= args.start) & (frame.index <= args.end)]
        if period.empty:
            missing.append(symbol)
            continue
        closes = period['Close'] * factor
        # Premiers cours parasites (ex. OP-USD avant sa vraie cotation) : un saut de plus
        # de ×10 en une séance invalide tout ce qui précède
        jumps = closes / closes.shift(1)
        broken = jumps[(jumps > 10) | (jumps < 0.1)]
        if not broken.empty:
            cut = broken.index[-1]
            dropped.append(f'{symbol} avant le {cut}')
            closes = closes[closes.index >= cut]
            period = period[period.index >= cut]
        moves = closes.pct_change().abs()
        for day, move in moves[moves > MAX_DAILY_MOVE].items():
            big_moves.append(f'{symbol} {day} {move:+.0%}')
        for day, close in closes.items():
            volume = period.at[day, 'Volume']
            rows.append((asset_id, day, round(float(close), 6), None if pd.isna(volume) else int(volume)))

    print()
    print(f'{len(rows)} cours prêts, {len(assets) - len(missing)} actifs couverts')
    if missing:
        print(f'Sans données sur la période ({len(missing)}) : {", ".join(missing)}')
    if no_junction:
        print(f'Sans jour commun pour le raccord ({len(no_junction)}) : {", ".join(no_junction)}')
    if odd_junction:
        print(f'Raccord suspect, écart > {MAX_JUNCTION_GAP:.0%} ({len(odd_junction)}) : {", ".join(odd_junction)}')
    if dropped:
        print(f'Cours parasites écartés ({len(dropped)}) : {", ".join(dropped)}')
    if big_moves:
        print(f'Variations > {MAX_DAILY_MOVE:.0%} en une séance ({len(big_moves)}) : {", ".join(big_moves)}')

    if args.dry_run:
        print('\nEssai à blanc : rien n\'est écrit.')
        return

    with psycopg.connect(database_url(), sslmode='require') as conn:
        with conn.cursor() as cur:
            cur.execute(
                'CREATE TEMP TABLE import_prices (asset_id int, date date, close_price numeric, volume bigint) ON COMMIT DROP'
            )
            with cur.copy('COPY import_prices (asset_id, date, close_price, volume) FROM STDIN') as copy:
                for row in rows:
                    copy.write_row(row)
            cur.execute(
                '''INSERT INTO prices (asset_id, date, close_price, volume)
                   SELECT asset_id, date, close_price, volume FROM import_prices
                   ON CONFLICT (asset_id, date) DO UPDATE
                   SET close_price = EXCLUDED.close_price, volume = EXCLUDED.volume'''
            )
            written = cur.rowcount
    print(f'\n{written} cours écrits dans la base.')


if __name__ == '__main__':
    main()
