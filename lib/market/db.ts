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
export const marketDb = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
});

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
