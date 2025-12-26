/**
 * FINANCEQUEST - MARKETSTACK CACHE (CRITIQUE)
 * Système de cache ultra-strict pour minimiser les appels API MarketStack
 * 
 * RÈGLE D'OR: TOUJOURS vérifier le cache AVANT d'appeler l'API
 */

import { db } from '@/lib/db';
import { marketDataCache } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { fetchEOD, fetchPriceAtDate, type MarketStackEODData } from './marketstack';

// ==========================================
// TYPES
// ==========================================

export interface CachedPrice {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  cachedAt: Date;
}

// ==========================================
// CACHE FUNCTIONS (CRITIQUE)
// ==========================================

/**
 * Obtenir le prix d'un actif à une date donnée
 * VÉRIFIE LE CACHE EN PREMIER, sinon fetch API + store
 * 
 * @param symbol - Symbole de l'actif (ex: "AAPL")
 * @param date - Date au format YYYY-MM-DD
 * @returns Prix de clôture, ou null si non disponible
 * 
 * @example
 * ```ts
 * const price = await getPrice('AAPL', '2023-06-15');
 * console.log(price); // 150.25
 * ```
 */
export async function getPrice(symbol: string, date: string): Promise<number | null> {
  try {
    // 1. TOUJOURS vérifier le cache en premier
    const cached = await db.query.marketDataCache.findFirst({
      where: and(
        eq(marketDataCache.symbol, symbol),
        eq(marketDataCache.date, date)
      ),
    });

    if (cached) {
      console.log(`[Cache] HIT: ${symbol} @ ${date} = ${cached.close}`);
      return parseFloat(cached.close);
    }

    console.log(`[Cache] MISS: ${symbol} @ ${date}, fetching from API...`);

    // 2. Si pas en cache, fetch depuis MarketStack
    const apiData = await fetchPriceAtDate(symbol, date);

    if (!apiData) {
      console.warn(`[Cache] No data available for ${symbol} @ ${date}`);
      return null;
    }

    // 3. Store en cache immédiatement
    await storeInCache([apiData]);

    console.log(`[Cache] STORED: ${symbol} @ ${date} = ${apiData.close}`);

    return apiData.close;
  } catch (error) {
    console.error(`[Cache] Error getting price for ${symbol} @ ${date}:`, error);
    return null;
  }
}

/**
 * Obtenir les prix de PLUSIEURS actifs à une date donnée (BATCH OPTIMISÉ)
 * Évite N appels individuels en fetchant tous les symboles manquants en 1 call
 * 
 * @param symbols - Array de symboles
 * @param date - Date au format YYYY-MM-DD
 * @returns Map<symbol, price> avec les prix disponibles
 * 
 * @example
 * ```ts
 * const prices = await batchGetPrices(['AAPL', 'MSFT', 'GOOGL'], '2025-07-01');
 * // Map { 'AAPL' => 150.25, 'MSFT' => 320.50, 'GOOGL' => 175.84 }
 * ```
 */
export async function batchGetPrices(
  symbols: string[],
  date: string
): Promise<Map<string, number>> {
  const result = new Map<string, number>();

  try {
    // 1. Vérifier le cache pour TOUS les symboles en 1 requête
    const cached = await db
      .select()
      .from(marketDataCache)
      .where(
        and(
          eq(marketDataCache.date, date)
          // Drizzle va chercher tous les symboles qui matchent la date
        )
      );

    // Filtrer pour ne garder que les symboles demandés
    const cachedMap = new Map<string, number>();
    for (const row of cached) {
      if (symbols.includes(row.symbol)) {
        cachedMap.set(row.symbol, parseFloat(row.close));
      }
    }

    // 2. Identifier symboles manquants
    const missingSymbols = symbols.filter((s) => !cachedMap.has(s));

    console.log(`[Cache] Found ${cachedMap.size}/${symbols.length} in cache for ${date}`);

    // 3. Si tout est en cache, retourner
    if (missingSymbols.length === 0) {
      return cachedMap;
    }

    // 4. Fetch les symboles manquants EN 1 SEUL APPEL API
    console.log(`[Cache] Fetching ${missingSymbols.length} missing symbols from API`);
    
    const { batchFetchEOD } = await import('./marketstack');
    const apiData = await batchFetchEOD(missingSymbols, date, date);

    if (apiData.length > 0) {
      // Store en cache
      await storeInCache(apiData);

      // Ajouter au résultat
      for (const item of apiData) {
        cachedMap.set(item.symbol, item.close);
      }

      console.log(`[Cache] Fetched and stored ${apiData.length} missing prices`);
    }

    return cachedMap;
  } catch (error) {
    console.error(`[Cache] Error in batchGetPrices:`, error);
    return result;
  }
}

/**
 * Obtenir l'historique des prix pour un actif sur une période
 * Vérifie le cache, fetch ce qui manque, et store
 * 
 * @param symbol - Symbole de l'actif
 * @param dateFrom - Date de début (YYYY-MM-DD)
 * @param dateTo - Date de fin (YYYY-MM-DD)
 * @returns Array de prix avec dates
 * 
 * @example
 * ```ts
 * const history = await getPriceHistory('AAPL', '2023-01-01', '2023-12-31');
 * // [{ date: '2023-01-01', close: 130.50, ... }, ...]
 * ```
 */
export async function getPriceHistory(
  symbol: string,
  dateFrom: string,
  dateTo: string
): Promise<CachedPrice[]> {
  try {
    // 1. Fetch depuis le cache
    const cachedData = await db
      .select()
      .from(marketDataCache)
      .where(
        and(
          eq(marketDataCache.symbol, symbol),
          // Note: Drizzle n'a pas de between direct, on utilise SQL raw si nécessaire
          // Pour simplifier ici, on fetch tout et on filtre côté app
        )
      );

    // Filtrer par dates
    const filtered = cachedData.filter(
      (row) => row.date >= dateFrom && row.date <= dateTo
    );

    console.log(`[Cache] Found ${filtered.length} cached records for ${symbol}`);

    // Si on a toutes les données, retourner
    if (filtered.length > 0) {
      return filtered.map(mapToCache);
    }

    // 2. Si pas de données, fetch depuis API
    console.log(`[Cache] Fetching history from API: ${symbol} ${dateFrom} to ${dateTo}`);
    const apiData = await fetchEOD(symbol, dateFrom, dateTo);

    if (apiData.length === 0) {
      console.warn(`[Cache] No data from API for ${symbol}`);
      return [];
    }

    // 3. Store en cache
    await storeInCache(apiData);

    console.log(`[Cache] Stored ${apiData.length} records for ${symbol}`);

    return apiData.map((data) => ({
      symbol: data.symbol,
      date: data.date.split('T')[0],
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      volume: data.volume,
      cachedAt: new Date(),
    }));
  } catch (error) {
    console.error(`[Cache] Error getting price history for ${symbol}:`, error);
    return [];
  }
}

/**
 * Store des données MarketStack dans le cache
 * Utilise INSERT ... ON CONFLICT DO NOTHING pour éviter les doublons
 * 
 * @param data - Array de données MarketStack
 */
export async function storeInCache(data: MarketStackEODData[]): Promise<void> {
  if (data.length === 0) return;

  try {
    const values = data.map((item) => ({
      symbol: item.symbol,
      date: item.date.split('T')[0], // Format YYYY-MM-DD
      open: item.open.toString(),
      high: item.high.toString(),
      low: item.low.toString(),
      close: item.close.toString(),
      volume: item.volume,
    }));

    // Insert avec ON CONFLICT DO NOTHING (dédoublonnage natif via PRIMARY KEY)
    await db
      .insert(marketDataCache)
      .values(values)
      .onConflictDoNothing(); // Ne rien faire si (symbol, date) existe déjà

    console.log(`[Cache] Stored ${values.length} records in cache`);
  } catch (error) {
    console.error('[Cache] Error storing in cache:', error);
    throw error;
  }
}

/**
 * Vérifier si des données sont en cache pour un symbole et une période
 * 
 * @param symbol - Symbole
 * @param dateFrom - Date début
 * @param dateTo - Date fin
 * @returns true si toutes les données sont en cache
 */
export async function isCached(
  symbol: string,
  dateFrom: string,
  dateTo: string
): Promise<boolean> {
  try {
    const cachedData = await db
      .select()
      .from(marketDataCache)
      .where(eq(marketDataCache.symbol, symbol));

    const filtered = cachedData.filter(
      (row) => row.date >= dateFrom && row.date <= dateTo
    );

    // Calculer le nombre de jours ouvrables attendus (approximation)
    const expectedDays = getBusinessDays(dateFrom, dateTo);

    return filtered.length >= expectedDays * 0.9; // 90% des jours = considéré complet
  } catch (error) {
    console.error('[Cache] Error checking cache:', error);
    return false;
  }
}

/**
 * Obtenir les prix de plusieurs actifs à une date donnée
 * Optimisé pour minimiser les appels API
 * 
 * @param symbols - Array de symboles
 * @param date - Date (YYYY-MM-DD)
 * @returns Map symbol -> prix
 * 
 * @example
 * ```ts
 * const prices = await getBatchPrices(['AAPL', 'MSFT', 'GOOGL'], '2023-06-15');
 * console.log(prices.get('AAPL')); // 150.25
 * ```
 */
export async function getBatchPrices(
  symbols: string[],
  date: string
): Promise<Map<string, number>> {
  const result = new Map<string, number>();

  try {
    // 1. Check cache pour tous les symboles
    const cachedData = await db
      .select()
      .from(marketDataCache)
      .where(eq(marketDataCache.date, date));

    const cachedSymbols = new Set<string>();

    for (const row of cachedData) {
      if (symbols.includes(row.symbol)) {
        result.set(row.symbol, parseFloat(row.close));
        cachedSymbols.add(row.symbol);
      }
    }

    console.log(`[Cache] Found ${cachedSymbols.size}/${symbols.length} in cache for ${date}`);

    // 2. Fetch ce qui manque
    const missingSymbols = symbols.filter((s) => !cachedSymbols.has(s));

    if (missingSymbols.length > 0) {
      console.log(`[Cache] Fetching ${missingSymbols.length} missing symbols from API`);

      // Fetch en batch (1 seul appel API pour tous)
      const apiData = await fetchEOD(missingSymbols, date, date);

      // Store en cache
      if (apiData.length > 0) {
        await storeInCache(apiData);

        for (const data of apiData) {
          result.set(data.symbol, data.close);
        }
      }
    }

    return result;
  } catch (error) {
    console.error('[Cache] Error getting batch prices:', error);
    return result;
  }
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Mapper données DB vers CachedPrice
 */
function mapToCache(row: typeof marketDataCache.$inferSelect): CachedPrice {
  return {
    symbol: row.symbol,
    date: row.date,
    open: parseFloat(row.open || '0'),
    high: parseFloat(row.high || '0'),
    low: parseFloat(row.low || '0'),
    close: parseFloat(row.close),
    volume: row.volume,
    cachedAt: row.cachedAt,
  };
}

/**
 * Calculer le nombre de jours ouvrables entre 2 dates (approximation)
 */
function getBusinessDays(dateFrom: string, dateTo: string): number {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Approximation: 5/7 des jours sont ouvrables
  return Math.floor(diffDays * (5 / 7));
}

// ==========================================
// STATS (pour monitoring)
// ==========================================

/**
 * Obtenir des statistiques sur le cache
 */
export async function getCacheStats() {
  try {
    const allData = await db.select().from(marketDataCache);

    const uniqueSymbols = new Set(allData.map((row) => row.symbol)).size;
    const totalRecords = allData.length;
    const oldestDate = allData.reduce(
      (min, row) => (row.date < min ? row.date : min),
      allData[0]?.date || ''
    );
    const newestDate = allData.reduce(
      (max, row) => (row.date > max ? row.date : max),
      allData[0]?.date || ''
    );

    return {
      uniqueSymbols,
      totalRecords,
      oldestDate,
      newestDate,
      estimatedSizeMB: (totalRecords * 0.15) / 1000, // Approximation: 150 bytes/record
    };
  } catch (error) {
    console.error('[Cache] Error getting stats:', error);
    return null;
  }
}