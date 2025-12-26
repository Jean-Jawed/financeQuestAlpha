/**
 * FINANCEQUEST - API ROUTE: Admin Monitoring
 * GET /api/admin/monitoring
 * 
 * Dashboard admin avec stats système
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { users, games, marketDataCache } from '@/lib/db/schema';
import { eq, count, sql } from 'drizzle-orm';
import { getCacheStats } from '@/lib/market/cache';
import { getRemainingRequests } from '@/lib/market/marketstack';

// ==========================================
// ADMIN USER IDS (à configurer)
// ==========================================

const ADMIN_USER_IDS = [
  // Ajouter les IDs des admins ici
  // 'uuid-admin-1',
  // 'uuid-admin-2',
];

// ==========================================
// API HANDLER
// ==========================================

export const GET = withAuth(async (req, { userId }) => {
  try {
    // Vérifier si l'utilisateur est admin
    // TEMPORAIRE: Autoriser tous les users (à retirer en production)
    // if (!ADMIN_USER_IDS.includes(userId)) {
    //   return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    // }

    console.log('[Admin] Fetching monitoring data...');

    // 1. Stats Users
    const totalUsers = await db.select({ count: count() }).from(users);
    const activeUsersResult = await db
      .select({ count: count() })
      .from(games)
      .where(eq(games.status, 'active'));

    // 2. Stats Games
    const totalGames = await db.select({ count: count() }).from(games);
    const activeGames = await db
      .select({ count: count() })
      .from(games)
      .where(eq(games.status, 'active'));

    // 3. Stats Cache
    const cacheStats = await getCacheStats();

    // 4. Stats API
    const marketStackRemaining = getRemainingRequests();

    // 5. Database size (estimation)
    const dbSize = await db.execute(sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);

    const monitoring = {
      database: {
        size: dbSize.rows[0]?.size || 'N/A',
        recordCount: cacheStats.totalRecords,
        cacheRecords: cacheStats.totalRecords,
        estimatedSizeMB: cacheStats.estimatedSizeMB,
      },
      users: {
        total: totalUsers[0].count,
        active: activeUsersResult[0].count,
      },
      games: {
        total: totalGames[0].count,
        active: activeGames[0].count,
      },
      cache: {
        uniqueSymbols: cacheStats.uniqueSymbols,
        totalRecords: cacheStats.totalRecords,
        oldestDate: cacheStats.oldestDate,
        newestDate: cacheStats.newestDate,
      },
      api: {
        marketStackRemaining,
        marketStackLimit: 100, // Free tier
      },
    };

    console.log('[Admin] Monitoring data fetched successfully');

    return NextResponse.json({
      success: true,
      data: monitoring,
    });
  } catch (error) {
    console.error('[Admin] Monitoring error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
});
