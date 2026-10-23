/**
 * FINANCEQUEST - JOURNAL DE LA SÉANCE
 * Plus fortes hausses et baisses de la séance et de la semaine, humeur du marché,
 * grands indices. Une requête (index prices(asset_id, date desc), quelques ms),
 * en cache par date et scénario : les cours passés ne changent jamais.
 */

import { sql } from 'drizzle-orm';
import { getScenario } from '@/lib/game/scenarios';
import { marketQuery } from './db';

// ==========================================
// TYPES
// ==========================================

export interface Mover {
  symbol: string;
  name: string;
  /** Code de la place (absent pour les devises) */
  market: string | null;
  /** Cours de clôture dans la devise de l'actif */
  close: number;
  currency: string;
  /** Variation en %, en devise d'origine */
  changePercent: number;
}

export interface MarketMovers {
  date: string;
  day: { gainers: Mover[]; losers: Mover[] };
  week: { gainers: Mover[]; losers: Mover[] };
  /** Humeur du marché sur la séance */
  breadth: { up: number; down: number; flat: number };
  /** Grands indices de référence, variation de la séance et de la semaine */
  indices: Array<{ symbol: string; name: string; close: number; day: number | null; week: number | null }>;
}

const TOP_COUNT = 5;

/** Indices affichés dans le journal, dans cet ordre */
const INDEX_SYMBOLS = ['^GSPC', '^FCHI', '^N225', 'BTC'];

/** Au-delà de ce délai sans cotation, une valeur n'entre pas dans le palmarès du jour */
const STALE_DAYS = 4;

// ==========================================
// CACHE
// ==========================================

const CACHE_LIMIT = 500;
const cache = new Map<string, MarketMovers>();

// ==========================================
// CALCUL
// ==========================================

interface Row extends Record<string, unknown> {
  symbol: string;
  name: string;
  market: string | null;
  currency: string;
  type: string;
  last_date: string;
  close: string;
  prev_close: string | null;
  week_close: string | null;
}

function change(from: string | null, to: string): number | null {
  const start = from === null ? NaN : Number(from);
  const end = Number(to);
  return start > 0 && end > 0 ? ((end - start) / start) * 100 : null;
}

/**
 * Journal du marché à une date, limité aux valeurs du scénario
 *
 * @param date - Jour simulé (YYYY-MM-DD)
 * @param scenarioId - Scénario de la partie (types et places autorisés)
 */
export async function getMarketMovers(date: string, scenarioId: string): Promise<MarketMovers> {
  const { rules } = getScenario(scenarioId);
  const key = `${date}|${scenarioId}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const typeFilter = rules.assetTypes ? sql`AND t.code IN ${[...rules.assetTypes]}` : sql``;
  const marketFilter = rules.markets ? sql`AND m.code IN ${[...rules.markets]}` : sql``;

  // Les indices de référence sont toujours lus, même hors du scénario
  const rows = await marketQuery<Row>(sql`
    SELECT a.symbol, a.name, m.code AS market, c.code AS currency, t.code AS type,
           last.date::text AS last_date, last.close_price AS close,
           prev.close_price AS prev_close, week.close_price AS week_close
    FROM assets a
    JOIN asset_types t ON t.id = a.asset_type_id
    JOIN currencies c ON c.id = a.currency_id
    LEFT JOIN markets m ON m.id = a.market_id
    CROSS JOIN LATERAL (
      SELECT date, close_price FROM prices
      WHERE asset_id = a.id AND date <= ${date}::date
      ORDER BY date DESC LIMIT 1
    ) last
    LEFT JOIN LATERAL (
      SELECT close_price FROM prices
      WHERE asset_id = a.id AND date < last.date
      ORDER BY date DESC LIMIT 1
    ) prev ON true
    LEFT JOIN LATERAL (
      SELECT close_price FROM prices
      WHERE asset_id = a.id AND date <= last.date - 7
      ORDER BY date DESC LIMIT 1
    ) week ON true
    WHERE a.is_active
      AND (a.symbol IN ${INDEX_SYMBOLS} OR (TRUE ${typeFilter} ${marketFilter}))
  `);

  const staleLimit = new Date(Date.parse(`${date}T00:00:00Z`) - STALE_DAYS * 86_400_000).toISOString().slice(0, 10);
  const inScenario = rows.filter(
    (row) =>
      (!rules.assetTypes || rules.assetTypes.includes(row.type)) &&
      (!rules.markets || (row.market !== null && rules.markets.includes(row.market)))
  );

  const toMover = (row: Row, value: number | null): Mover | null =>
    value === null
      ? null
      : {
          symbol: row.symbol,
          name: row.name,
          market: row.market,
          close: Number(row.close),
          currency: String(row.currency).trim(),
          changePercent: value,
        };

  const rank = (pick: (row: Row) => number | null) => {
    const movers = inScenario
      .filter((row) => row.last_date >= staleLimit)
      .map((row) => toMover(row, pick(row)))
      .filter((mover): mover is Mover => mover !== null);
    const sorted = [...movers].sort((a, b) => b.changePercent - a.changePercent);
    return {
      gainers: sorted.filter((m) => m.changePercent > 0).slice(0, TOP_COUNT),
      losers: sorted.filter((m) => m.changePercent < 0).reverse().slice(0, TOP_COUNT),
    };
  };

  const dayChanges = inScenario
    .filter((row) => row.last_date >= staleLimit)
    .map((row) => change(row.prev_close, row.close))
    .filter((value): value is number => value !== null);

  const bySymbol = new Map(rows.map((row) => [row.symbol, row]));
  const value: MarketMovers = {
    date,
    day: rank((row) => change(row.prev_close, row.close)),
    week: rank((row) => change(row.week_close, row.close)),
    breadth: {
      up: dayChanges.filter((v) => v > 0).length,
      down: dayChanges.filter((v) => v < 0).length,
      flat: dayChanges.filter((v) => v === 0).length,
    },
    indices: INDEX_SYMBOLS.flatMap((symbol) => {
      const row = bySymbol.get(symbol);
      return row
        ? [{ symbol, name: row.name, close: Number(row.close), day: change(row.prev_close, row.close), week: change(row.week_close, row.close) }]
        : [];
    }),
  };

  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  cache.set(key, value);
  return value;
}
