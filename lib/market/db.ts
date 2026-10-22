/**
 * FINANCEQUEST - MARKET DB CLIENT
 * Client dédié pour la base de données Assets & Prices
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import type { SQL } from 'drizzle-orm';
import { createPool } from '@/lib/db/pool';

// ==========================================
// CONFIGURATION
// ==========================================

const connectionString = process.env.SUPABASE_PRICES_URL;

if (!connectionString) {
    throw new Error('SUPABASE_PRICES_URL environment variable is not set');
}

// Pool node-postgres partagé (voir lib/db/pool.ts : connexions fermées avant la mise
// en pause de l'instance Vercel, délai de requête)
const pool = createPool('prix', connectionString);
const pricesDb = drizzle(pool);

/**
 * Exécuter une requête sur la base prix
 * Les requêtes s'écrivent avec la balise `sql` de Drizzle ; une liste passée en
 * paramètre devient ($1, $2, …), d'où `a.symbol IN ${symbols}`
 *
 * @example
 * const rows = await marketQuery(sql`SELECT * FROM assets WHERE symbol IN ${symbols}`);
 */
export async function marketQuery<T extends Record<string, unknown> = Record<string, any>>(
    query: SQL
): Promise<T[]> {
    const result = await pricesDb.execute<T>(query);
    return result.rows as T[];
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
 * Fermer le pool (scripts, tests)
 */
export async function closeMarketDb() {
    await pool.end();
}
