/**
 * FINANCEQUEST - MARKET CALENDAR
 * Calendrier de jeu piloté par les données de la base prix
 *
 * Un « jour de bourse » est une date où au moins 25 % des actifs hors crypto
 * ont un prix. Mesuré sur 2023-2024 :
 * - jour normal : 184 à 214 actifs cotés (sur 214)
 * - férié US ou européen seulement (Thanksgiving, 4 juillet, 1er mai) : 110 à 130,
 *   l'autre grande place reste ouverte → jour joué
 * - fermeture générale (vendredi saint, Noël, Nouvel An) : 10 à 27, seules
 *   quelques places asiatiques cotent → jour sauté
 * Pas de liste de jours fériés codée en dur : la plage jouable est celle
 * réellement couverte par la base.
 */

import { sql } from 'drizzle-orm';
import { marketQuery } from './db';

// ==========================================
// CONFIGURATION
// ==========================================

/** Part minimale des actifs hors crypto cotés pour qu'un jour soit joué */
const MIN_QUOTED_SHARE = 0.25;

/** Fenêtre de recherche du jour de bourse voisin (au-delà : fin des données) */
const SEARCH_WINDOW_DAYS = 14;

// ==========================================
// TYPES
// ==========================================

export interface PriceCoverage {
  /** Premier jour de bourse disponible (YYYY-MM-DD) */
  start: string;
  /** Dernier jour de bourse disponible (YYYY-MM-DD) */
  end: string;
}

// ==========================================
// TRADING DAYS
// ==========================================

/**
 * Jour de bourse le plus proche de `date` dans une direction
 * Parcourt l'index (date, asset_id) sur une fenêtre de 14 jours au plus
 *
 * @param direction - 'after' (> date), 'from' (≥ date) ou 'until' (≤ date, en reculant)
 * @returns YYYY-MM-DD, ou null s'il n'y en a pas (fin des données)
 */
async function findTradingDate(
  date: string,
  direction: 'after' | 'from' | 'until'
): Promise<string | null> {
  const dateFilter =
    direction === 'after'
      ? sql`p.date > ${date}::date AND p.date <= ${date}::date + ${SEARCH_WINDOW_DAYS}::int`
      : direction === 'from'
        ? sql`p.date >= ${date}::date AND p.date <= ${date}::date + ${SEARCH_WINDOW_DAYS}::int`
        : sql`p.date <= ${date}::date AND p.date >= ${date}::date - ${SEARCH_WINDOW_DAYS}::int`;

  const order = direction === 'until' ? sql`DESC` : sql`ASC`;

  const results = await marketQuery(sql`
    SELECT p.date::text AS date
    FROM prices p
    JOIN assets a ON a.id = p.asset_id
    JOIN asset_types t ON t.id = a.asset_type_id
    WHERE t.code <> 'CRYPTO' AND ${dateFilter}
    GROUP BY p.date
    HAVING COUNT(*) >= (
      SELECT COUNT(*) * ${MIN_QUOTED_SHARE}::numeric
      FROM assets a2
      JOIN asset_types t2 ON t2.id = a2.asset_type_id
      WHERE t2.code <> 'CRYPTO' AND a2.is_active
    )
    ORDER BY p.date ${order}
    LIMIT 1
  `);

  return results.length > 0 ? results[0].date : null;
}

/**
 * Jour de bourse suivant la date donnée (pour « Jour suivant »)
 */
export async function getNextTradingDate(date: string): Promise<string | null> {
  return findTradingDate(date, 'after');
}

/**
 * Premier jour de bourse à partir de la date donnée incluse (création de partie)
 */
export async function getTradingDateOnOrAfter(date: string): Promise<string | null> {
  return findTradingDate(date, 'from');
}

// ==========================================
// COVERAGE (cache mémoire)
// ==========================================

const COVERAGE_TTL_MS = 60 * 60 * 1000; // 1 h : la base n'est mise à jour qu'à l'import

let coverageCache: { value: PriceCoverage; expiresAt: number } | null = null;

/**
 * Plage de jours de bourse couverte par la base prix
 */
export async function getPriceCoverage(): Promise<PriceCoverage> {
  const now = Date.now();

  if (coverageCache && coverageCache.expiresAt > now) {
    return coverageCache.value;
  }

  // MIN/MAX sur la clé de l'index (date, asset_id) : lecture d'index instantanée
  const [bounds] = await marketQuery(sql`
    SELECT
      (SELECT date::text FROM prices ORDER BY date ASC LIMIT 1) AS first_date,
      (SELECT date::text FROM prices ORDER BY date DESC LIMIT 1) AS last_date
  `);

  const [start, end] = await Promise.all([
    findTradingDate(bounds.first_date, 'from'),
    findTradingDate(bounds.last_date, 'until'),
  ]);

  const value: PriceCoverage = {
    start: start ?? bounds.first_date,
    end: end ?? bounds.last_date,
  };
  coverageCache = { value, expiresAt: now + COVERAGE_TTL_MS };

  return value;
}
