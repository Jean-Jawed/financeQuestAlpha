/**
 * FINANCEQUEST - FX RATES
 * Taux de change historiques lus dans la base prix (actifs de type CURRENCY)
 *
 * Toutes les devises sont ramenées au dollar : EURUSD, GBPUSD, AUDUSD sont
 * cotés « USD pour 1 devise », USDJPY, USDCHF, USDCAD, USDCNY, USDHKD
 * « devise pour 1 USD ». Chaque jour, on prend le dernier cours connu.
 */

import { sql } from 'drizzle-orm';
import { marketQuery } from './db';
import type { UsdRates } from '@/lib/game/currency';

// ==========================================
// CONFIGURATION
// ==========================================

/** Paire cotée contre le dollar, par devise. inverse : cours = USD pour 1 devise */
const USD_PAIRS: Record<string, { symbol: string; inverse: boolean }> = {
  EUR: { symbol: 'EURUSD', inverse: true },
  GBP: { symbol: 'GBPUSD', inverse: true },
  AUD: { symbol: 'AUDUSD', inverse: true },
  NZD: { symbol: 'NZDUSD', inverse: true },
  JPY: { symbol: 'USDJPY', inverse: false },
  CHF: { symbol: 'USDCHF', inverse: false },
  CAD: { symbol: 'USDCAD', inverse: false },
  CNY: { symbol: 'USDCNY', inverse: false },
  HKD: { symbol: 'USDHKD', inverse: false },
};

/**
 * Taux de secours (unités pour 1 USD) si la paire manque en base
 * HKD : arrimé au dollar (7,75 à 7,85). CNY : moyenne 2023-2024.
 * Voir docs/reviewOct2026/sql/03_projet_B_devises.sql
 */
const FALLBACK_UNITS_PER_USD: Record<string, number> = {
  CNY: 7.1,
  HKD: 7.8,
};

// ==========================================
// CACHE (les taux d'une date passée ne changent pas)
// ==========================================

const CACHE_MAX_DATES = 500;
const ratesCache = new Map<string, UsdRates>();
const warnedFallbacks = new Set<string>();

// ==========================================
// DATA FETCHING
// ==========================================

/**
 * Taux de toutes les devises contre le dollar à une date (dernier cours ≤ date)
 * Une requête par date, puis mémoire
 */
export async function getUsdRates(date: string): Promise<UsdRates> {
  const cached = ratesCache.get(date);
  if (cached) return cached;

  const symbols = Object.values(USD_PAIRS).map((pair) => pair.symbol);
  const results = await marketQuery(sql`
    SELECT a.symbol, p.close_price
    FROM assets a
    CROSS JOIN LATERAL (
      SELECT close_price
      FROM prices
      WHERE asset_id = a.id
        AND date <= ${date}
      ORDER BY date DESC
      LIMIT 1
    ) p
    WHERE a.symbol IN ${symbols}
  `);

  const quoteBySymbol = new Map(results.map((row) => [row.symbol as string, Number(row.close_price)]));

  const rates: UsdRates = { USD: 1 };
  for (const [currency, pair] of Object.entries(USD_PAIRS)) {
    const quote = quoteBySymbol.get(pair.symbol);
    if (quote && quote > 0) {
      rates[currency] = pair.inverse ? 1 / quote : quote;
    } else if (FALLBACK_UNITS_PER_USD[currency]) {
      rates[currency] = FALLBACK_UNITS_PER_USD[currency];
      if (!warnedFallbacks.has(currency)) {
        warnedFallbacks.add(currency);
        console.warn(`[FX] ${pair.symbol} absent de la base prix : taux fixe ${rates[currency]} utilisé`);
      }
    }
  }

  if (ratesCache.size >= CACHE_MAX_DATES) {
    const oldest = ratesCache.keys().next().value;
    if (oldest !== undefined) ratesCache.delete(oldest);
  }
  ratesCache.set(date, rates);

  return rates;
}
