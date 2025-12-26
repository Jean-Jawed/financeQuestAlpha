/**
 * FINANCEQUEST - API ROUTE: LIST GAMES
 * GET /api/games/list
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculatePortfolio } from '@/lib/game/calculations';
import { getUnlockedAchievements } from '@/lib/game/achievements';
import { getRemainingDays } from '@/lib/game/next-day';
import type { GameWithStats } from '@/types/game';

// ==========================================
// API HANDLER
// ==========================================

export const GET = withAuth(async (req, { userId }) => {
  try {
    // 1. Récupérer tous les games de l'utilisateur
    const userGames = await db.query.games.findMany({
      where: eq(games.userId, userId),
      orderBy: (games, { desc }) => [desc(games.updatedAt)],
    });

    if (userGames.length === 0) {
      return NextResponse.json({
        success: true,
        data: { games: [] },
      });
    }

    // 2. Enrichir chaque game avec les stats
    const gamesWithStats: GameWithStats[] = await Promise.all(
      userGames.map(async (game) => {
        // Calculer portfolio
        const portfolio = await calculatePortfolio(game.id, game.currentDate);

        // Compter achievements
        const achievements = await getUnlockedAchievements(game.id);

        // Calculer jours restants
        const remainingDays = getRemainingDays(game.currentDate);

        return {
          ...game,
          portfolioValue: portfolio?.portfolioValueLong || 0,
          shortPositionsPnl: portfolio?.shortPositionsPnl || 0,
          totalValue: portfolio?.totalValue || parseFloat(game.currentBalance),
          returnPercentage: portfolio?.returnPercentage || 0,
          score: portfolio?.score || 0,
          achievementsUnlocked: achievements.length,
          remainingDays,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: { games: gamesWithStats },
    });
  } catch (error) {
    console.error('[API] List games error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
});
