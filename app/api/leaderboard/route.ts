/**
 * FINANCEQUEST - API ROUTE: Leaderboard
 * GET /api/leaderboard?period=all_time&limit=50
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, users } from '@/lib/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { calculatePortfolio } from '@/lib/game/calculations';

// ==========================================
// TYPES
// ==========================================

type Period = 'all_time' | 'monthly' | 'weekly';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || 'all_time') as Period;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validation
    if (!['all_time', 'monthly', 'weekly'].includes(period)) {
      return NextResponse.json({ error: 'Period invalide' }, { status: 400 });
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Limit doit être entre 1 et 100' }, { status: 400 });
    }

    // Date filters
    let dateFilter;
    const now = new Date();

    switch (period) {
      case 'weekly':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = gte(games.updatedAt, weekAgo);
        break;

      case 'monthly':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = gte(games.updatedAt, monthAgo);
        break;

      case 'all_time':
      default:
        dateFilter = undefined;
        break;
    }

    // Récupérer les games actifs
    const activeGames = await db.query.games.findMany({
      where: dateFilter ? and(eq(games.status, 'active'), dateFilter) : eq(games.status, 'active'),
      with: {
        user: true,
      },
      orderBy: [desc(games.updatedAt)],
      limit: limit * 2, // Fetch plus pour compenser les erreurs de calcul
    });

    console.log(`[Leaderboard] Found ${activeGames.length} active games for ${period}`);

    // Calculer les scores pour chaque game
    const entries = await Promise.all(
      activeGames.map(async (game) => {
        try {
          const portfolio = await calculatePortfolio(game.id, game.currentDate);

          if (!portfolio) {
            console.warn(`[Leaderboard] Could not calculate portfolio for game ${game.id}`);
            return null;
          }

          return {
            gameId: game.id,
            userName: game.user.name,
            totalValue: portfolio.totalValue,
            returnPercentage: portfolio.returnPercentage,
            score: portfolio.score,
            startDate: game.startDate,
            currentDate: game.currentDate,
          };
        } catch (error) {
          console.error(`[Leaderboard] Error calculating game ${game.id}:`, error);
          return null;
        }
      })
    );

    // Filtrer les null et trier par score
    const validEntries = entries
      .filter((entry) => entry !== null)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, limit);

    // Ajouter les rangs
    const rankedEntries = validEntries.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return NextResponse.json({
      success: true,
      data: {
        period,
        entries: rankedEntries,
        total: rankedEntries.length,
      },
    });
  } catch (error) {
    console.error('[API] Leaderboard error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
