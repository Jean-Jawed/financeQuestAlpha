/**
 * FINANCEQUEST - GAME STATE
 * État complet d'une partie pour la page de jeu (portfolio, positions,
 * dernières transactions, succès, fin des données)
 */

import { db } from '@/lib/db';
import { transactions, type Game } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { calculatePortfolio, calculateHoldingsValues } from './calculations';
import { checkAndUnlockAchievements, getUnlockedAchievements } from './achievements';
import { daysBetween } from './achievement-rules';
import { loadGameSummary } from './summary';
import { getPriceCoverage } from '@/lib/market/calendar';
import { getApiI18n } from '@/lib/i18n/server';
import type { GameState, PortfolioCalculation } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

export interface ActionOutcome {
  /** État de la partie après l'action (null si le portfolio n'a pas pu être calculé) */
  state: GameState | null;
  /** Succès débloqués par l'action */
  achievementsUnlocked: Array<{ name: string; points: number }>;
}

// ==========================================
// STATE
// ==========================================

/**
 * Charger l'état et les identifiants des succès débloqués
 * (requêtes indépendantes en parallèle)
 */
async function buildGameState(
  game: Game,
  portfolio?: PortfolioCalculation | null
): Promise<{ state: GameState; achievementIds: Set<string> } | null> {
  const [resolvedPortfolio, holdingsWithValues, recentTransactions, unlocked, coverage, summary] =
    await Promise.all([
      portfolio ?? calculatePortfolio(game.id, game.currentDate),
      calculateHoldingsValues(game.id, game.currentDate, game.currency),
      db.query.transactions.findMany({
        where: eq(transactions.gameId, game.id),
        orderBy: [desc(transactions.createdAt)],
        limit: 20,
      }),
      getUnlockedAchievements(game.id),
      getPriceCoverage(),
      game.status === 'completed' ? loadGameSummary(game) : null,
    ]);

  if (!resolvedPortfolio) {
    return null;
  }

  const initialBalance = parseFloat(game.initialBalance);
  const achievementIds = new Set(unlocked.map((a) => a.id));

  return {
    achievementIds,
    state: {
      game: {
        ...game,
        portfolioValue: resolvedPortfolio.portfolioValueLong,
        shortPositionsPnl: resolvedPortfolio.shortPositionsPnl,
        totalValue: resolvedPortfolio.totalValue,
        returnPercentage: resolvedPortfolio.returnPercentage,
        score: resolvedPortfolio.score,
        achievementsUnlocked: achievementIds.size,
        // Jours restants jusqu'à la fin des données de marché
        remainingDays: Math.max(daysBetween(game.currentDate, coverage.end), 0),
        dataEndDate: coverage.end,
      },
      portfolio: {
        currentBalance: resolvedPortfolio.currentBalance,
        availableCash: resolvedPortfolio.availableCash,
        portfolioValueLong: resolvedPortfolio.portfolioValueLong,
        shortLiability: resolvedPortfolio.shortLiability,
        shortPositionsPnl: resolvedPortfolio.shortPositionsPnl,
        totalValue: resolvedPortfolio.totalValue,
        returnPercentage: resolvedPortfolio.returnPercentage,
        score: resolvedPortfolio.score,
        initialBalance,
        profitLoss: resolvedPortfolio.totalValue - initialBalance,
      },
      holdings: holdingsWithValues,
      recentTransactions,
      summary,
    },
  };
}

/**
 * Charger l'état d'une partie
 *
 * @param game - Ligne games à jour
 * @returns L'état, ou null si le portfolio n'a pas pu être calculé
 */
export async function loadGameState(game: Game): Promise<GameState | null> {
  const built = await buildGameState(game);
  return built?.state ?? null;
}

/**
 * Après un ordre ou une séance : vérifier les succès et renvoyer l'état,
 * pour que la page n'ait pas à relire la partie
 * Le portfolio est calculé une fois ; succès et état sont chargés en parallèle
 *
 * @param game - Ligne games à jour (renvoyée par l'UPDATE … RETURNING de l'action)
 */
export async function settleAction(game: Game): Promise<ActionOutcome> {
  const portfolio = await calculatePortfolio(game.id, game.currentDate);

  const [unlocked, built] = await Promise.all([
    checkAndUnlockAchievements(game.id, portfolio),
    buildGameState(game, portfolio),
  ]);

  // Les succès lus par l'état peuvent précéder ou suivre leur déblocage : union
  if (built) {
    for (const { achievement } of unlocked) built.achievementIds.add(achievement.id);
    built.state.game.achievementsUnlocked = built.achievementIds.size;
  }

  // Nom affiché dans la langue du joueur (clé : le nom stocké en base)
  const { server } = await getApiI18n();

  return {
    state: built?.state ?? null,
    achievementsUnlocked: unlocked.map((a) => ({
      name: server.achievements[a.achievement.name]?.name ?? a.achievement.name,
      points: a.achievement.points,
    })),
  };
}
