/**
 * FINANCEQUEST - API ROUTE: GET GAME
 * GET /api/games/[id]
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { requireOwnership } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games, holdings, transactions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { calculatePortfolio, calculateHoldingsValues } from '@/lib/game/calculations';
import { getUnlockedAchievements } from '@/lib/game/achievements';
import { getRemainingDays } from '@/lib/game/next-day';
import { NotFoundError } from '@/lib/utils/errors';

// ==========================================
// API HANDLER
// ==========================================

export const GET = withAuth(async (req, { userId }, context) => {
  try {
    // CORRECTION: await params avant de l'utiliser
    const { id: gameId } = await context.params;

    // 1. Récupérer le game
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return NextResponse.json({ error: 'Game non trouvé' }, { status: 404 });
    }

    // 2. Vérifier ownership
    await requireOwnership(userId, game.userId);

    // 3. Calculer portfolio
    const portfolio = await calculatePortfolio(game.id, game.currentDate);
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Erreur lors du calcul du portfolio' },
        { status: 500 }
      );
    }

    // 4. Récupérer holdings avec valeurs
    const holdingsWithValues = await calculateHoldingsValues(game.id, game.currentDate);

    // 5. Récupérer les 20 dernières transactions
    const recentTransactions = await db.query.transactions.findMany({
      where: eq(transactions.gameId, game.id),
      orderBy: [desc(transactions.createdAt)],
      limit: 20,
    });

    // 6. Récupérer achievements
    const achievementsUnlocked = await getUnlockedAchievements(game.id);

    // 7. Calculer jours restants
    const remainingDays = getRemainingDays(game.currentDate);

    // 8. Construire la réponse
    return NextResponse.json({
      success: true,
      data: {
        game: {
          ...game,
          portfolioValue: portfolio.portfolioValueLong,
          shortPositionsPnl: portfolio.shortPositionsPnl,
          totalValue: portfolio.totalValue,
          returnPercentage: portfolio.returnPercentage,
          score: portfolio.score,
          achievementsUnlocked: achievementsUnlocked.length,
          remainingDays,
        },
        portfolio: {
          currentBalance: portfolio.currentBalance,
          portfolioValueLong: portfolio.portfolioValueLong,
          shortPositionsPnl: portfolio.shortPositionsPnl,
          totalValue: portfolio.totalValue,
          returnPercentage: portfolio.returnPercentage,
          score: portfolio.score,
          initialBalance: parseFloat(game.initialBalance),
          profitLoss: portfolio.totalValue - parseFloat(game.initialBalance),
        },
        holdings: holdingsWithValues,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('[API] Get game error:', error);

    if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
});