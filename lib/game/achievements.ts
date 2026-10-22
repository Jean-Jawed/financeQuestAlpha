/**
 * FINANCEQUEST - ACHIEVEMENTS LOGIC
 * Vérification et débloquage automatique des achievements
 *
 * Le contexte (partie, transactions, positions, portfolio, types d'actifs) est
 * chargé en une poignée de requêtes parallèles, puis tous les critères sont
 * évalués en mémoire (voir ./achievement-rules). Les achievements débloqués
 * sont insérés en une seule requête.
 */

import { db } from '@/lib/db';
import { achievements, userAchievements, games, holdings, transactions } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { calculatePortfolio } from './calculations';
import {
  IMPLEMENTED_CRITERIA,
  evaluateAchievement,
  replayTransactions,
  type AchievementContext,
} from './achievement-rules';
import { getQuotes } from '@/lib/market/prices';
import { getAssetTypesBySymbol } from '@/lib/market/assets';
import type { Achievement } from '@/types/database';
import type { PortfolioCalculation } from '@/types/game';

/** Capital de référence des seuils de valeur (achievements « portfolio_value ») */
const ACHIEVEMENT_REFERENCE_CAPITAL = 10_000;

// ==========================================
// TYPES
// ==========================================

export interface UnlockedAchievement {
  achievement: Achievement;
  unlockedAt: Date;
}

// ==========================================
// DEFINITIONS (cache mémoire)
// ==========================================

const DEFINITIONS_TTL_MS = 10 * 60 * 1000; // Table quasi statique

let definitionsCache: { value: Achievement[]; expiresAt: number } | null = null;

async function getAchievementDefinitions(): Promise<Achievement[]> {
  const now = Date.now();

  if (definitionsCache && definitionsCache.expiresAt > now) {
    return definitionsCache.value;
  }

  const value = await db.query.achievements.findMany();
  definitionsCache = { value, expiresAt: now + DEFINITIONS_TTL_MS };

  return value;
}

// ==========================================
// ACHIEVEMENT CHECKING
// ==========================================

/**
 * Vérifier et débloquer tous les achievements pour un game
 * Appelé après chaque transaction ou next-day
 *
 * @param gameId - ID du game
 * @param portfolio - Portfolio déjà calculé par l'appelant (évite un recalcul)
 * @returns Liste des achievements débloqués (nouveaux uniquement)
 */
export async function checkAndUnlockAchievements(
  gameId: string,
  portfolio?: PortfolioCalculation | null
): Promise<UnlockedAchievement[]> {
  try {
    // 1. Charger le contexte en parallèle
    const [game, allAchievements, unlockedRows, transactionRows, holdingRows] = await Promise.all([
      db.query.games.findFirst({ where: eq(games.id, gameId) }),
      getAchievementDefinitions(),
      db
        .select({ achievementId: userAchievements.achievementId })
        .from(userAchievements)
        .where(eq(userAchievements.gameId, gameId)),
      db.query.transactions.findMany({
        where: eq(transactions.gameId, gameId),
        orderBy: [asc(transactions.transactionDate), asc(transactions.createdAt)],
      }),
      db.query.holdings.findMany({ where: eq(holdings.gameId, gameId) }),
    ]);

    if (!game) {
      console.error('[Achievements] Game not found');
      return [];
    }

    // 2. Ne garder que les achievements à vérifier
    const unlockedIdSet = new Set(unlockedRows.map((u) => u.achievementId));
    const pending = allAchievements.filter(
      (a) => !unlockedIdSet.has(a.id) && IMPLEMENTED_CRITERIA.has(a.criteriaType)
    );

    if (pending.length === 0) {
      return [];
    }

    // 3. Compléter le contexte (portfolio, valeurs des longs, types d'actifs)
    const longHoldings = holdingRows.filter((h) => !h.isShort);
    const symbols = [
      ...new Set([...transactionRows.map((t) => t.symbol), ...holdingRows.map((h) => h.symbol)]),
    ];

    const [resolvedPortfolio, quotes, assetTypeBySymbol] = await Promise.all([
      portfolio ?? calculatePortfolio(gameId, game.currentDate),
      getQuotes([...new Set(longHoldings.map((h) => h.symbol))], game.currentDate, game.currency),
      getAssetTypesBySymbol(symbols),
    ]);

    if (!resolvedPortfolio) {
      return [];
    }

    const longValueBySymbol = new Map<string, number>();
    for (const holding of longHoldings) {
      const price = quotes.get(holding.symbol)?.price ?? 0;
      longValueBySymbol.set(
        holding.symbol,
        (longValueBySymbol.get(holding.symbol) ?? 0) + parseFloat(holding.quantity) * price
      );
    }

    const ctx: AchievementContext = {
      startDate: game.startDate,
      currentDate: game.currentDate,
      transactions: transactionRows.map((t) => ({
        type: t.type,
        symbol: t.symbol,
        quantity: parseFloat(t.quantity),
        price: parseFloat(t.price),
        date: t.transactionDate,
      })),
      longValueBySymbol,
      assetTypeBySymbol,
      // Seuils « portfolio_value » pensés pour un capital de 10 000 :
      // ramener la valeur à cette échelle, quelle que soit la devise de jeu
      totalValue:
        (resolvedPortfolio.totalValue / parseFloat(game.initialBalance)) * ACHIEVEMENT_REFERENCE_CAPITAL,
      returnPercentage: resolvedPortfolio.returnPercentage,
    };

    const replay = replayTransactions(ctx.transactions);

    // 4. Évaluer en mémoire
    const toUnlock = pending.filter((achievement) =>
      evaluateAchievement(
        achievement.criteriaType,
        (achievement.criteriaValue ?? {}) as Record<string, unknown>,
        ctx,
        replay
      )
    );

    if (toUnlock.length === 0) {
      return [];
    }

    // 5. Débloquer en une requête (idempotent grâce à UNIQUE (game_id, achievement_id))
    const inserted = await db
      .insert(userAchievements)
      .values(
        toUnlock.map((achievement) => ({
          userId: game.userId,
          gameId,
          achievementId: achievement.id,
        }))
      )
      .onConflictDoNothing()
      .returning({ achievementId: userAchievements.achievementId, unlockedAt: userAchievements.unlockedAt });

    const byId = new Map(toUnlock.map((a) => [a.id, a]));

    return inserted.flatMap((row) => {
      const achievement = byId.get(row.achievementId);
      return achievement ? [{ achievement, unlockedAt: row.unlockedAt }] : [];
    });
  } catch (error) {
    console.error('[Achievements] Error checking achievements:', error);
    return [];
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Obtenir tous les achievements débloqués pour un game
 */
export async function getUnlockedAchievements(gameId: string): Promise<Achievement[]> {
  const unlocked = await db.query.userAchievements.findMany({
    where: eq(userAchievements.gameId, gameId),
    with: {
      achievement: true,
    },
  });

  return unlocked.map((u) => u.achievement);
}

/**
 * Obtenir le total de points d'achievements pour un game
 */
export async function getTotalAchievementPoints(gameId: string): Promise<number> {
  const unlocked = await getUnlockedAchievements(gameId);
  return unlocked.reduce((sum, a) => sum + a.points, 0);
}

/**
 * Obtenir les achievements disponibles (non débloqués)
 */
export async function getAvailableAchievements(gameId: string): Promise<Achievement[]> {
  const [allAchievements, unlockedIds] = await Promise.all([
    getAchievementDefinitions(),
    db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.gameId, gameId)),
  ]);

  const unlockedIdSet = new Set(unlockedIds.map((u) => u.achievementId));

  return allAchievements.filter((a) => !unlockedIdSet.has(a.id));
}
