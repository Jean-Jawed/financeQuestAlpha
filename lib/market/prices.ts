/**
 * FINANCEQUEST - PRICES SERVICE
 * Gestion des prix historiques via Supabase Prices DB
 */

import { marketDb, type Price } from './db';

// ==========================================
// DATA FETCHING
// ==========================================

/**
 * Récupérer le dernier prix connu pour un asset à une date donnée (ou avant)
 */
export async function getPrice(symbol: string, date: string): Promise<Price | null> {
  const results = await marketDb`
    SELECT p.*
    FROM prices p
    JOIN assets a ON p.asset_id = a.id
    WHERE a.symbol = ${symbol}
      AND p.date <= ${date}
    ORDER BY p.date DESC
    LIMIT 1
  `;

  if (results.length === 0) return null;
  return mapPriceRow(results[0]);
}

/**
 * Récupérer l'historique de prix pour un asset
 */
export async function getHistory(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<Price[]> {
  const results = await marketDb`
    SELECT p.*
    FROM prices p
    JOIN assets a ON p.asset_id = a.id
    WHERE a.symbol = ${symbol}
      AND p.date >= ${startDate}
      AND p.date <= ${endDate}
    ORDER BY p.date ASC
  `;

  return results.map(mapPriceRow);
}

/**
 * Récupérer les derniers prix pour une liste d'assets (batch fetch)
 */
export async function getLatestPrices(symbols: string[], date: string): Promise<Map<string, Price>> {
  if (symbols.length === 0) return new Map();

  const results = await marketDb`
    SELECT DISTINCT ON (a.symbol) 
      a.symbol, p.*
    FROM prices p
    JOIN assets a ON p.asset_id = a.id
    WHERE a.symbol IN ${marketDb(symbols)}
      AND p.date <= ${date}
    ORDER BY a.symbol, p.date DESC
  `;

  const map = new Map<string, Price>();
  results.forEach(row => {
    map.set(row.symbol, mapPriceRow(row));
  });

  return map;
}

// ==========================================
// HELPERS
// ==========================================

function mapPriceRow(row: any): Price {
  return {
    asset_id: row.asset_id,
    date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
    open_price: row.open_price ? Number(row.open_price) : undefined,
    high_price: row.high_price ? Number(row.high_price) : undefined,
    low_price: row.low_price ? Number(row.low_price) : undefined,
    close_price: Number(row.close_price),
    adj_close: row.adj_close ? Number(row.adj_close) : undefined,
    volume: row.volume ? Number(row.volume) : undefined,
  };
}
