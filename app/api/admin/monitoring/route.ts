/**
 * FINANCEQUEST - API ROUTE: Admin Monitoring
 * GET /api/admin/monitoring
 * Protected by ADMIN_PASSWORD
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, games, marketDataCache, apiStats } from '@/lib/db/schema';
import { eq, sql, count } from 'drizzle-orm';
import type { MonitoringData } from '@/types/api';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  try {
    // 1. Vérifier le mot de passe admin
    const authHeader = req.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin access not configured' },
        { status: 503 }
      );
    }

    // Format attendu: "Bearer PASSWORD"
    const providedPassword = authHeader?.replace('Bearer ', '');

    if (providedPassword !== adminPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Collecter les statistiques
    console.log('[Admin] Fetching monitoring data...');

    // Users stats
    const totalUsersResult = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = totalUsersResult[0];

    const activeUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.updatedAt} > NOW() - INTERVAL '30 days'`);
    const activeUsers = activeUsersResult[0];

    // Games stats
    const totalGamesResult = await db
      .select({ count: count() })
      .from(games);
    const totalGames = totalGamesResult[0];

    const activeGamesResult = await db
      .select({ count: count() })
      .from(games)
      .where(eq(games.status, 'active'));
    const activeGames = activeGamesResult[0];

    // Cache stats
    const cacheStatsResult = await db
      .select({
        totalRecords: count(),
        uniqueSymbols: sql<number>`COUNT(DISTINCT ${marketDataCache.symbol})`,
        oldestDate: sql<string>`MIN(${marketDataCache.date})`,
        newestDate: sql<string>`MAX(${marketDataCache.date})`,
      })
      .from(marketDataCache);
    const cacheStats = cacheStatsResult[0];

    // Database size (estimation)
    const estimatedSizeMB = (cacheStats.totalRecords * 0.5) / 1024; // ~0.5KB par record

    // API stats (MarketStack) - Lire depuis DB
    const latestApiStats = await db.query.apiStats.findFirst({
      where: sql`${apiStats.provider} = 'marketstack'`,
      orderBy: sql`${apiStats.lastUpdated} DESC`,
    });

    const marketStackLimit = latestApiStats?.requestsLimit || 10000;
    const marketStackRemaining = latestApiStats?.requestsRemaining || 10000;

    // 3. Construire la réponse
    const data: MonitoringData = {
      database: {
        size: `${estimatedSizeMB.toFixed(2)} MB`,
        cacheRecords: cacheStats.totalRecords,
        estimatedSizeMB,
      },
      users: {
        total: totalUsers.count,
        active: activeUsers.count,
      },
      games: {
        total: totalGames.count,
        active: activeGames.count,
      },
      cache: {
        totalRecords: cacheStats.totalRecords,
        uniqueSymbols: cacheStats.uniqueSymbols,
        oldestDate: cacheStats.oldestDate,
        newestDate: cacheStats.newestDate,
      },
      api: {
        marketStackRemaining,
        marketStackLimit,
      },
    };

    console.log('[Admin] Monitoring data collected');

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