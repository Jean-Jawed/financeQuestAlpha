/**
 * FINANCEQUEST - TICKER
 * Bande de cotations de l'accueil : variation réelle de quelques valeurs
 * connues sur toute la période couverte par la base prix
 */

import { sql } from 'drizzle-orm';
import { marketQuery } from './db';
import { getPriceCoverage } from './calendar';

// ==========================================
// CONFIGURATION
// ==========================================

const TICKER_SYMBOLS = [
  'NVDA', 'MC', 'BTC', 'AAPL', '^FCHI', 'TSLA', 'AIR', 'GC=F', '7203', 'ETH',
  'RMS', '^GSPC', 'TTE', 'MSFT', '0700', 'CL=F', 'OR', 'EURUSD', 'SAN', '^N225',
];

const TICKER_TTL_MS = 60 * 60 * 1000;

// ==========================================
// TYPES
// ==========================================

export interface TickerItem {
  symbol: string;
  name: string;
  /** Variation en % entre le premier et le dernier cours de la période */
  changePercent: number;
}

export interface TickerData {
  from: string;
  to: string;
  items: TickerItem[];
  /** Nombre d'actifs négociables (actifs) dans la base */
  assetCount: number;
  /** Nombre de places de cotation représentées */
  marketCount: number;
  /** Nombre de séances de bourse couvertes (jours de cotation de la valeur de référence) */
  sessionCount: number;
}

/** Valeur de référence pour compter les séances : une action de New York, cotée tous les jours ouvrés */
const SESSION_REFERENCE_SYMBOL = 'AAPL';

let tickerCache: { value: TickerData; expiresAt: number } | null = null;

// ==========================================
// DATA FETCHING
// ==========================================

/**
 * Variation de chaque valeur de la bande sur la période couverte
 * Deux lectures d'index par actif (premier et dernier cours), en cache 1 h
 */
export async function getTickerData(): Promise<TickerData> {
  const now = Date.now();
  if (tickerCache && tickerCache.expiresAt > now) {
    return tickerCache.value;
  }

  const coverage = await getPriceCoverage();

  const [rows, [counts]] = await Promise.all([
    marketQuery(sql`
    SELECT a.symbol, a.name, first_p.close_price AS first_close, last_p.close_price AS last_close
    FROM assets a
    CROSS JOIN LATERAL (
      SELECT close_price FROM prices
      WHERE asset_id = a.id AND date >= ${coverage.start}
      ORDER BY date ASC LIMIT 1
    ) first_p
    CROSS JOIN LATERAL (
      SELECT close_price FROM prices
      WHERE asset_id = a.id AND date <= ${coverage.end}
      ORDER BY date DESC LIMIT 1
    ) last_p
    WHERE a.symbol IN ${TICKER_SYMBOLS}
  `),
    marketQuery(sql`
      SELECT
        COUNT(*)::int AS asset_count,
        COUNT(DISTINCT market_id)::int AS market_count,
        (
          SELECT COUNT(*)::int FROM prices
          WHERE asset_id = (SELECT id FROM assets WHERE symbol = ${SESSION_REFERENCE_SYMBOL})
        ) AS session_count
      FROM assets
      WHERE is_active
    `),
  ]);

  const bySymbol = new Map(rows.map((row) => [row.symbol as string, row]));
  const items: TickerItem[] = [];

  for (const symbol of TICKER_SYMBOLS) {
    const row = bySymbol.get(symbol);
    const first = Number(row?.first_close);
    const last = Number(row?.last_close);
    if (!row || !(first > 0) || !(last > 0)) continue;
    items.push({
      symbol,
      name: row.name,
      changePercent: ((last - first) / first) * 100,
    });
  }

  const value: TickerData = {
    from: coverage.start,
    to: coverage.end,
    items,
    assetCount: counts.asset_count,
    marketCount: counts.market_count,
    sessionCount: counts.session_count,
  };
  tickerCache = { value, expiresAt: now + TICKER_TTL_MS };
  return value;
}
