/**
 * FINANCEQUEST - MARKET DB CLIENT
 * Client dédié pour la base de données Assets & Prices
 */

import postgres from 'postgres';

// ==========================================
// CONFIGURATION
// ==========================================

const connectionString = process.env.SUPABASE_PRICES_URL;

if (!connectionString) {
    throw new Error('SUPABASE_PRICES_URL environment variable is not set');
}

// Client connection pool
// - prepare: false : obligatoire derrière le pooler Supabase en mode transaction (port 6543)
// - max: 5 : en serverless, chaque instance a son propre pool ; peu de connexions
//   par instance évite de saturer les 60 connexions de la base
// - En dev, le client est conservé sur globalThis pour ne pas ouvrir un nouveau
//   pool à chaque rechargement à chaud (HMR)
const globalForMarketDb = globalThis as unknown as { marketDb?: postgres.Sql };

export const marketDb =
    globalForMarketDb.marketDb ??
    postgres(connectionString, {
        prepare: false,
        max: 5,
        idle_timeout: 20,
        connect_timeout: 10,
    });

if (process.env.NODE_ENV !== 'production') {
    globalForMarketDb.marketDb = marketDb;
}

// ==========================================
// TYPES (Mirroring DB Schema)
// ==========================================

export interface Market {
    id: number;
    code: string;
    name: string;
    country?: string;
    timezone?: string;
    is_major: boolean;
}

export interface Currency {
    id: number;
    code: string;
    name: string;
    symbol?: string;
}

export interface AssetType {
    id: number;
    code: string; // 'STOCK', 'BOND', 'ETF', 'CRYPTO', ...
    label: string;
}

export interface Asset {
    id: number;
    symbol: string;
    name: string;
    asset_type_id: number;
    market_id?: number;
    currency_id: number;
    isin?: string;
    is_active: boolean;
    created_at: Date;
    // Joined fields (optional)
    market?: Market;
    currency?: Currency;
    type?: AssetType;
    // Mapped fields for UI compatibility
    price?: number;
    change?: number;
}

export interface Price {
    asset_id: number;
    date: string; // YYYY-MM-DD
    open_price?: number;
    high_price?: number;
    low_price?: number;
    close_price: number;
    adj_close?: number;
    volume?: number;
}

// ==========================================
// UTILS
// ==========================================

/**
 * Helper to close the connection (useful for scripts/testing)
 */
export async function closeMarketDb() {
    await marketDb.end();
}
