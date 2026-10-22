/**
 * FINANCEQUEST - ASSETS SERVICE
 * Service pour la gestion des assets via Supabase Prices DB
 */

import { marketDb, type Asset } from './db';

// ==========================================
// TYPES
// ==========================================

export interface AssetFilters {
  type_id?: number;
  market_id?: number;
  search?: string;
  symbols?: string[];
  limit?: number;
  offset?: number;
}

// ==========================================
// DATA FETCHING
// ==========================================

/**
 * Récupérer la liste des assets avec filtres
 */
export async function getAssets(filters: AssetFilters = {}): Promise<Asset[]> {
  let query = marketDb`
    SELECT 
      a.*,
      m.code as market_code,
      m.name as market_name,
      c.code as currency_code,
      t.code as type_code,
      t.label as type_label
    FROM assets a
    LEFT JOIN markets m ON a.market_id = m.id
    LEFT JOIN currencies c ON a.currency_id = c.id
    LEFT JOIN asset_types t ON a.asset_type_id = t.id
    WHERE a.is_active = true
  `;

  if (filters.type_id) {
    query = marketDb`${query} AND a.asset_type_id = ${filters.type_id}`;
  }

  if (filters.market_id) {
    query = marketDb`${query} AND a.market_id = ${filters.market_id}`;
  }

  if (filters.symbols && filters.symbols.length > 0) {
    query = marketDb`${query} AND a.symbol IN ${marketDb(filters.symbols)}`;
  }

  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    query = marketDb`${query} AND (
      a.symbol ILIKE ${searchPattern} OR 
      a.name ILIKE ${searchPattern}
    )`;
  }

  // Order by symbol
  query = marketDb`${query} ORDER BY a.symbol ASC`;

  // Limit / Offset
  if (filters.limit) {
    query = marketDb`${query} LIMIT ${filters.limit}`;
  }

  if (filters.offset) {
    query = marketDb`${query} OFFSET ${filters.offset}`;
  }

  const results = await query;
  return results.map(mapAssetRow);
}

/**
 * Helper pou récupérer une map de symbol -> Asset
 */
export async function getAssetsMap(symbols: string[]): Promise<Map<string, Asset>> {
  if (symbols.length === 0) return new Map();

  const assets = await getAssets({ symbols });
  const map = new Map<string, Asset>();

  assets.forEach(asset => {
    map.set(asset.symbol, asset);
  });

  return map;
}

/**
 * Récupérer un asset par son symbole
 */
export async function getAssetBySymbol(symbol: string): Promise<Asset | null> {
  const results = await marketDb`
    SELECT 
      a.*,
      m.code as market_code,
      m.name as market_name,
      c.code as currency_code,
      t.code as type_code,
      t.label as type_label
    FROM assets a
    LEFT JOIN markets m ON a.market_id = m.id
    LEFT JOIN currencies c ON a.currency_id = c.id
    LEFT JOIN asset_types t ON a.asset_type_id = t.id
    WHERE a.symbol = ${symbol}
    LIMIT 1
  `;

  if (results.length === 0) return null;
  return mapAssetRow(results[0]);
}

/**
 * Rechercher des assets (raccourci)
 */
export async function searchAssets(query: string, limit = 20): Promise<Asset[]> {
  return getAssets({ search: query, limit });
}

/**
 * Vérifier si un symbole est valide (existe en base)
 *
 * @param requireActive - true pour ouvrir une position (buy/short) : refuse les
 *   actifs désactivés (sans prix ou prix corrompus). Une position existante
 *   reste toujours fermable (sell/cover).
 */
export async function isValidSymbol(symbol: string, requireActive = false): Promise<boolean> {
  const asset = await getAssetBySymbol(symbol);
  if (asset === null) return false;
  return requireActive ? asset.is_active : true;
}

/**
 * Récupérer tous les types d'assets disponibles
 */
export async function getAssetTypes() {
  return await marketDb`SELECT * FROM asset_types ORDER BY id ASC`;
}

/**
 * Type d'actif (code en minuscules : stock, crypto, bond…) pour une liste de symboles
 * Une seule requête, y compris pour les actifs désactivés
 */
export async function getAssetTypesBySymbol(symbols: string[]): Promise<Map<string, string>> {
  if (symbols.length === 0) return new Map();

  const results = await marketDb`
    SELECT a.symbol, LOWER(t.code) AS type_code
    FROM assets a
    JOIN asset_types t ON t.id = a.asset_type_id
    WHERE a.symbol IN ${marketDb(symbols)}
  `;

  return new Map(results.map((row) => [row.symbol as string, row.type_code as string]));
}

/**
 * Récupérer tous les marchés disponibles
 */
export async function getMarkets() {
  return await marketDb`SELECT * FROM markets ORDER BY is_major DESC, name ASC`;
}

// ==========================================
// HELPERS
// ==========================================

function mapAssetRow(row: any): Asset {
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    asset_type_id: row.asset_type_id,
    market_id: row.market_id,
    currency_id: row.currency_id,
    isin: row.isin,
    is_active: row.is_active,
    created_at: row.created_at,
    // Add joined objects for convenience
    market: row.market_id ? {
      id: row.market_id,
      code: row.market_code,
      name: row.market_name,
      is_major: false // Not fetched in detail here, simplified
    } : undefined,
    currency: {
      id: row.currency_id,
      code: row.currency_code,
      name: '' // Not fetched
    },
    // Map code to legacy "type" property if needed for UI compat
    type: {
      id: row.asset_type_id,
      code: row.type_code,
      label: row.type_label
    }
  };
}
// ==========================================
// CATALOGUE (page « Le jeu »)
// ==========================================

export interface CatalogCategory {
  code: string;
  label: string;
  count: number;
  /** Quelques noms d'exemple, par ordre d'identifiant */
  examples: string[];
}

const CATALOG_TTL_MS = 60 * 60 * 1000;
let catalogCache: { value: CatalogCategory[]; expiresAt: number } | null = null;

/**
 * Actifs négociables par type, avec des exemples. Une requête, en cache 1 h
 */
export async function getCatalogSummary(): Promise<CatalogCategory[]> {
  const now = Date.now();
  if (catalogCache && catalogCache.expiresAt > now) {
    return catalogCache.value;
  }

  const rows = await marketDb`
    SELECT t.code, t.label, COUNT(*)::int AS count,
           (ARRAY_AGG(a.name ORDER BY a.id))[1:8] AS examples
    FROM assets a
    JOIN asset_types t ON t.id = a.asset_type_id
    WHERE a.is_active
    GROUP BY t.code, t.label
    ORDER BY COUNT(*) DESC
  `;

  const value = rows.map((row) => ({
    code: row.code as string,
    label: row.label as string,
    count: row.count as number,
    examples: row.examples as string[],
  }));
  catalogCache = { value, expiresAt: now + CATALOG_TTL_MS };
  return value;
}
