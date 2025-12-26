/**
 * FINANCEQUEST - MARKETSTACK API WRAPPER
 * Wrapper pour l'API MarketStack avec gestion d'erreurs et rate limiting
 */

// Vérification API key
if (!process.env.MARKETSTACK_API_KEY) {
  throw new Error('MARKETSTACK_API_KEY environment variable is not set');
}

const MARKETSTACK_API_KEY = process.env.MARKETSTACK_API_KEY;
const MARKETSTACK_BASE_URL = 'http://api.marketstack.com/v1';

// ==========================================
// TYPES
// ==========================================

export interface MarketStackEODData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_open: number;
  adj_high: number;
  adj_low: number;
  adj_close: number;
  adj_volume: number;
  split_factor: number;
  dividend: number;
  symbol: string;
  exchange: string;
  date: string; // Format: "YYYY-MM-DDTHH:mm:ss+0000"
}

export interface MarketStackResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: MarketStackEODData[];
}

export interface MarketStackError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

// ==========================================
// RATE LIMITER (Simple)
// ==========================================

class SimpleRateLimiter {
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly maxRequests = 100; // MarketStack free tier: 100 req/hour
  private readonly windowMs = 60 * 60 * 1000; // 1 heure

  canMakeRequest(): boolean {
    const now = Date.now();

    // Reset window si expiré
    if (now - this.windowStart >= this.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    return this.requestCount < this.maxRequests;
  }

  incrementCount(): void {
    this.requestCount++;
  }

  getRemainingRequests(): number {
    return Math.max(0, this.maxRequests - this.requestCount);
  }
}

const rateLimiter = new SimpleRateLimiter();

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Fetch EOD (End of Day) data pour un ou plusieurs symboles
 * 
 * @param symbols - Symbole unique ou array de symboles (ex: "AAPL" ou ["AAPL", "MSFT"])
 * @param dateFrom - Date de début (format YYYY-MM-DD)
 * @param dateTo - Date de fin (format YYYY-MM-DD)
 * @param limit - Nombre max de résultats (default: 1000)
 * 
 * @example
 * ```ts
 * const data = await fetchEOD('AAPL', '2023-01-01', '2023-12-31');
 * const multiData = await fetchEOD(['AAPL', 'MSFT'], '2023-01-01', '2023-12-31');
 * ```
 */
export async function fetchEOD(
  symbols: string | string[],
  dateFrom: string,
  dateTo?: string,
  limit = 1000
): Promise<MarketStackEODData[]> {
  // Rate limiting check
  if (!rateLimiter.canMakeRequest()) {
    console.warn('[MarketStack] Rate limit reached, blocking request');
    throw new Error('MarketStack rate limit reached. Please try again later.');
  }

  // Construire la query string
  const symbolsParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
  const params = new URLSearchParams({
    access_key: MARKETSTACK_API_KEY,
    symbols: symbolsParam,
    date_from: dateFrom,
    limit: limit.toString(),
  });

  if (dateTo) {
    params.append('date_to', dateTo);
  }

  const url = `${MARKETSTACK_BASE_URL}/eod?${params.toString()}`;

  try {
    console.log(`[MarketStack] Fetching EOD: ${symbolsParam} from ${dateFrom} to ${dateTo || 'now'}`);
    
    const response = await fetch(url);
    const json = await response.json();

    // Récupérer les headers rate limit de MarketStack
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitLimit = response.headers.get('X-RateLimit-Limit');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');

    // Stocker les stats API en DB (async, non-bloquant)
    if (rateLimitRemaining && rateLimitLimit) {
      storeApiStats(
        parseInt(rateLimitRemaining),
        parseInt(rateLimitLimit),
        rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null
      ).catch((err) => console.error('[MarketStack] Error storing API stats:', err));
    }

    // Incrémenter le rate limiter
    rateLimiter.incrementCount();
    console.log(`[MarketStack] Remaining requests: ${rateLimiter.getRemainingRequests()}`);

    // Gestion des erreurs MarketStack
    if (!response.ok || json.error) {
      const error: MarketStackError = json.error || {
        code: 'unknown',
        message: 'Unknown error',
      };
      console.error('[MarketStack] API Error:', error);
      throw new Error(`MarketStack API Error: ${error.message}`);
    }

    const result: MarketStackResponse = json;

    console.log(`[MarketStack] Fetched ${result.data.length} EOD records`);

    return result.data;
  } catch (error) {
    console.error('[MarketStack] Request failed:', error);
    throw error;
  }
}

/**
 * Fetch le dernier prix (latest) pour un symbole
 * 
 * @param symbol - Symbole de l'actif
 * 
 * @example
 * ```ts
 * const latestPrice = await fetchLatestPrice('AAPL');
 * console.log(latestPrice.close); // 150.25
 * ```
 */
export async function fetchLatestPrice(symbol: string): Promise<MarketStackEODData> {
  const data = await fetchEOD(symbol, getTodayDate(), undefined, 1);

  if (data.length === 0) {
    throw new Error(`No data found for symbol: ${symbol}`);
  }

  return data[0];
}

/**
 * Fetch EOD data pour une date spécifique
 * 
 * @param symbol - Symbole de l'actif
 * @param date - Date au format YYYY-MM-DD
 * 
 * @example
 * ```ts
 * const price = await fetchPriceAtDate('AAPL', '2023-06-15');
 * console.log(price.close); // 150.25
 * ```
 */
export async function fetchPriceAtDate(
  symbol: string,
  date: string
): Promise<MarketStackEODData | null> {
  const data = await fetchEOD(symbol, date, date, 1);

  if (data.length === 0) {
    return null;
  }

  return data[0];
}

/**
 * Batch fetch pour plusieurs symboles sur une période
 * ATTENTION: Consomme 1 seul appel API même pour 100 symboles
 * 
 * @param symbols - Array de symboles
 * @param dateFrom - Date de début
 * @param dateTo - Date de fin (optionnel)
 * 
 * @example
 * ```ts
 * const data = await batchFetchEOD(['AAPL', 'MSFT', 'GOOGL'], '2023-01-01', '2023-12-31');
 * // Retourne toutes les données pour les 3 symboles
 * ```
 */
export async function batchFetchEOD(
  symbols: string[],
  dateFrom: string,
  dateTo?: string
): Promise<MarketStackEODData[]> {
  // MarketStack limite à 100 symboles par appel
  const MAX_SYMBOLS_PER_CALL = 100;

  if (symbols.length <= MAX_SYMBOLS_PER_CALL) {
    return fetchEOD(symbols, dateFrom, dateTo, 1000);
  }

  // Si > 100 symboles, découper en chunks
  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += MAX_SYMBOLS_PER_CALL) {
    chunks.push(symbols.slice(i, i + MAX_SYMBOLS_PER_CALL));
  }

  console.log(`[MarketStack] Batch fetching ${symbols.length} symbols in ${chunks.length} chunks`);

  // Fetch tous les chunks
  const allData: MarketStackEODData[] = [];
  for (const chunk of chunks) {
    const data = await fetchEOD(chunk, dateFrom, dateTo, 1000);
    allData.push(...data);
  }

  return allData;
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Obtenir la date d'aujourd'hui au format YYYY-MM-DD
 */
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Obtenir le nombre de requêtes restantes (rate limiter)
 */
export function getRemainingRequests(): number {
  return rateLimiter.getRemainingRequests();
}

/**
 * Stocker les statistiques API en base de données
 */
async function storeApiStats(
  remaining: number,
  limit: number,
  resetDate: Date | null
): Promise<void> {
  try {
    const { db } = await import('@/lib/db');
    const { apiStats } = await import('@/lib/db/schema');

    // Upsert : met à jour si existe, sinon insert
    await db
      .insert(apiStats)
      .values({
        provider: 'marketstack',
        requestsRemaining: remaining,
        requestsLimit: limit,
        resetDate,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: apiStats.provider,
        set: {
          requestsRemaining: remaining,
          requestsLimit: limit,
          resetDate,
          lastUpdated: new Date(),
        },
      });

    console.log(`[MarketStack] API stats stored: ${remaining}/${limit} remaining`);
  } catch (error) {
    console.error('[MarketStack] Error storing API stats:', error);
  }
}