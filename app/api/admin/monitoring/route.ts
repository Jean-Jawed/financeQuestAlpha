/**
 * FINANCEQUEST - API ROUTE: Admin Monitoring
 * GET /api/admin/monitoring
 * Réservé aux comptes ayant le rôle `admin` (app_metadata)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, games, transactions } from '@/lib/db/schema';
import { eq, sql, count } from 'drizzle-orm';
import { marketQuery } from '@/lib/market/db';
import { checkAdmin } from '@/lib/auth/session';
import type { MonitoringData } from '@/types/api';

// ==========================================
// API HANDLER
// ==========================================

export async function GET() {
  try {
    // 1. Vérifier le rôle admin
    const access = await checkAdmin();

    if (access === 'unauthenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (access === 'forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Collecter les statistiques (requêtes indépendantes en parallèle)
    const [
      [totalUsers],
      [activeUsers],
      [totalGames],
      [activeGames],
      [totalTransactions],
      [pricesStats],
      [assetsStats],
      settingsRows,
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db
        .select({ count: count() })
        .from(users)
        .where(sql`${users.updatedAt} > NOW() - INTERVAL '30 days'`),
      db.select({ count: count() }).from(games),
      db.select({ count: count() }).from(games).where(eq(games.status, 'active')),
      db.select({ count: count() }).from(transactions),
      marketQuery(sql`
        SELECT MIN(date)::text AS oldest_date, MAX(date)::text AS newest_date, COUNT(*)::int AS total_rows
        FROM prices
      `),
      marketQuery(sql`
        SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active
        FROM assets
      `),
      marketQuery(sql`SELECT value FROM settings WHERE key = 'last_data_update'`),
    ]);

    // 3. Construire la réponse
    const data: MonitoringData = {
      users: {
        total: totalUsers.count,
        active: activeUsers.count,
      },
      games: {
        total: totalGames.count,
        active: activeGames.count,
      },
      transactions: {
        total: totalTransactions.count,
      },
      prices: {
        oldestDate: pricesStats.oldest_date,
        newestDate: pricesStats.newest_date,
        totalRows: pricesStats.total_rows,
        assetsTotal: assetsStats.total,
        assetsActive: assetsStats.active,
        lastDataUpdate: settingsRows[0]?.value ?? null,
      },
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[Admin] Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
