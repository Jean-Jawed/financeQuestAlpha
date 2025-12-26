/**
 * FINANCEQUEST - PRE-FETCH BATCH (NOUVELLE LOGIQUE)
 * Pre-fetch intelligent: historique 30j passés au lieu de startDate→today
 * 
 * PHILOSOPHIE:
 * - Au lancement game: Fetch 30j PASSÉS pour historique/tendances
 * - Pendant jeu: Lazy loading (fetch à la demande)
 * - Next day: Batch fetch du nouveau jour (85 symboles)
 */

import { batchFetchEOD, type MarketStackEODData } from './marketstack';
import { storeInCache, isCached } from './cache';
import { ALL_SYMBOLS } from './assets';

// ==========================================
// TYPES
// ==========================================

export interface PrefetchResult {
  success: boolean;
  recordsStored: number;
  strategy?: 'full' | 'partial' | 'skip';
  message?: string;
  error?: string;
}

// ==========================================
// MAIN PREFETCH FUNCTION
// ==========================================

/**
 * Pre-fetch historique pour un nouveau game
 * Fetch les 30 derniers jours AVANT la date de début
 * 
 * @param startDate - Date de début du game (YYYY-MM-DD)
 * @returns Résultat du prefetch
 * 
 * @example
 * ```ts
 * await prefetchGameData('2025-06-01');
 * // Fetch du 2025-05-02 au 2025-06-01
 * // ~85 symboles × ~21 jours ouvrés = ~1,785 records
 * ```
 */
export async function prefetchGameData(startDate: string): Promise<PrefetchResult> {
  try {
    // Calculer période : 30 jours avant startDate
    const prefetchStart = subtractDays(startDate, 30);
    const prefetchEnd = startDate;

    console.log(`[Prefetch] Starting historical prefetch for ${ALL_SYMBOLS.length} symbols`);
    console.log(`[Prefetch] Period: ${prefetchStart} to ${prefetchEnd} (30 days)`);

    // Fetch en batch (1 seul appel API)
    const startTime = Date.now();
    const data = await batchFetchEOD(ALL_SYMBOLS, prefetchStart, prefetchEnd);
    const fetchTime = Date.now() - startTime;

    console.log(`[Prefetch] Fetched ${data.length} records in ${fetchTime}ms`);

    if (data.length === 0) {
      console.warn('[Prefetch] No data returned from API');
      return {
        success: false,
        recordsStored: 0,
        error: 'No data available for this period',
      };
    }

    // Store en cache
    await storeInCache(data);

    console.log(`[Prefetch] Successfully stored ${data.length} historical records`);

    return { 
      success: true, 
      recordsStored: data.length,
      strategy: 'full',
      message: `Prefetched ${data.length} records for 30-day history`,
    };
  } catch (error) {
    console.error('[Prefetch] Error during historical prefetch:', error);
    return {
      success: false,
      recordsStored: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Pre-fetch pour un jour spécifique (next-day)
 * Fetch les prix de TOUS les symboles pour 1 date
 * 
 * @param date - Date à fetcher (YYYY-MM-DD)
 * @returns Nombre de records stockés
 * 
 * @example
 * ```ts
 * await prefetchSingleDay('2025-06-02');
 * // Fetch 85 symboles pour cette date = 85 records max
 * ```
 */
export async function prefetchSingleDay(date: string): Promise<number> {
  try {
    console.log(`[Prefetch] Fetching single day data for ${date}`);

    // Fetch tous les symboles pour cette date exacte
    const data = await batchFetchEOD(ALL_SYMBOLS, date, date);

    if (data.length === 0) {
      console.warn(`[Prefetch] No data available for ${date}`);
      return 0;
    }

    await storeInCache(data);

    console.log(`[Prefetch] Stored ${data.length} records for ${date}`);

    return data.length;
  } catch (error) {
    console.error(`[Prefetch] Error fetching day ${date}:`, error);
    return 0;
  }
}

/**
 * Pre-fetch pour un symbole spécifique avec historique
 * Utilisé quand user consulte graphique d'un asset
 * 
 * @param symbol - Symbole à fetcher
 * @param startDate - Date début
 * @param endDate - Date fin (optionnel, default: today)
 * @returns Nombre de records stockés
 */
export async function prefetchSymbolHistory(
  symbol: string,
  startDate: string,
  endDate?: string
): Promise<number> {
  try {
    const targetEndDate = endDate || getTodayDate();

    console.log(`[Prefetch] Fetching history for ${symbol}: ${startDate} to ${targetEndDate}`);

    const data = await batchFetchEOD([symbol], startDate, targetEndDate);

    if (data.length === 0) {
      console.warn(`[Prefetch] No data for ${symbol}`);
      return 0;
    }

    await storeInCache(data);

    console.log(`[Prefetch] Stored ${data.length} records for ${symbol}`);

    return data.length;
  } catch (error) {
    console.error(`[Prefetch] Error fetching ${symbol}:`, error);
    return 0;
  }
}

/**
 * Stratégie de pre-fetch "smart" : détecte si données déjà en cache
 * 
 * @param startDate - Date début du game
 * @returns Résultat du prefetch avec stratégie
 */
export async function smartPrefetch(startDate: string): Promise<PrefetchResult> {
  try {
    const prefetchStart = subtractDays(startDate, 30);
    const prefetchEnd = startDate;

    // Vérifier ce qui est déjà en cache (sample de 10 symboles)
    const cacheStatus = await analyzeCacheStatus(prefetchStart, prefetchEnd);

    console.log(`[Prefetch] Cache coverage: ${(cacheStatus.coverage * 100).toFixed(1)}%`);

    // Si > 90% en cache, skip
    if (cacheStatus.coverage >= 0.9) {
      console.log('[Prefetch] High cache coverage, skipping prefetch');
      return {
        success: true,
        strategy: 'skip',
        recordsStored: 0,
        message: `Cache already has ${(cacheStatus.coverage * 100).toFixed(0)}% coverage`,
      };
    }

    // Sinon, full prefetch
    console.log('[Prefetch] Low cache coverage, full prefetch');
    return await prefetchGameData(startDate);
  } catch (error) {
    console.error('[Prefetch] Error in smart prefetch:', error);
    return {
      success: false,
      strategy: 'full',
      recordsStored: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==========================================
// CRON JOB: DAILY UPDATE
// ==========================================

/**
 * Pre-fetch quotidien : met à jour le cache avec les dernières données
 * À appeler via Vercel Cron tous les jours
 */
export async function dailyPrefetchUpdate(): Promise<PrefetchResult> {
  try {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    console.log('[Prefetch] Daily update: fetching latest data');

    const data = await batchFetchEOD(ALL_SYMBOLS, yesterday, today);

    if (data.length > 0) {
      await storeInCache(data);
    }

    console.log(`[Prefetch] Daily update: added ${data.length} records`);

    return { 
      success: true, 
      recordsStored: data.length,
      message: `Daily update: ${data.length} records`,
    };
  } catch (error) {
    console.error('[Prefetch] Error during daily update:', error);
    return { 
      success: false, 
      recordsStored: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Soustraire N jours à une date
 */
function subtractDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/**
 * Obtenir la date d'aujourd'hui (YYYY-MM-DD)
 */
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Obtenir la date d'hier (YYYY-MM-DD)
 */
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Analyser le statut du cache pour une période
 * Vérifie un sample de 10 symboles pour estimer coverage
 */
async function analyzeCacheStatus(
  startDate: string,
  endDate: string
): Promise<{ coverage: number; cachedSymbols: number; totalSymbols: number }> {
  try {
    let cachedCount = 0;

    // Sample de 10 symboles pour performance
    const sample = ALL_SYMBOLS.slice(0, 10);

    for (const symbol of sample) {
      const cached = await isCached(symbol, startDate, endDate);
      if (cached) {
        cachedCount++;
      }
    }

    const coverage = cachedCount / sample.length;

    return {
      coverage,
      cachedSymbols: cachedCount,
      totalSymbols: sample.length,
    };
  } catch (error) {
    console.error('[Prefetch] Error analyzing cache:', error);
    return { coverage: 0, cachedSymbols: 0, totalSymbols: 10 };
  }
}