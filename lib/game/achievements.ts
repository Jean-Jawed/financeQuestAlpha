/**
 * FINANCEQUEST - ACHIEVEMENTS LOGIC
 * Vérification et débloquage automatique des achievements
 */

import { db } from '@/lib/db';
import { achievements, userAchievements, games, holdings, transactions } from '@/lib/db/schema';
import { eq, and, count, sql } from 'drizzle-orm';
import { calculatePortfolio } from './calculations';
import type { Achievement } from '@/types/database';

// ==========================================
// TYPES
// ==========================================

export interface UnlockedAchievement {
  achievement: Achievement;
  unlockedAt: Date;
}

// ==========================================
// ACHIEVEMENT CHECKING
// ==========================================

/**
 * Vérifier et débloquer tous les achievements pour un game
 * Appelé après chaque transaction ou next-day
 * 
 * @param gameId - ID du game
 * @returns Liste des achievements débloqués (nouveaux uniquement)
 */
export async function checkAndUnlockAchievements(
  gameId: string
): Promise<UnlockedAchievement[]> {
  try {
    console.log(`[Achievements] Checking for game ${gameId}`);

    // 1. Récupérer le game
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
      with: {
        user: true,
      },
    });

    if (!game) {
      console.error('[Achievements] Game not found');
      return [];
    }

    // 2. Récupérer tous les achievements
    const allAchievements = await db.query.achievements.findMany();

    // 3. Récupérer les achievements déjà débloqués pour ce game
    const unlockedIds = await db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.gameId, gameId));

    const unlockedIdSet = new Set(unlockedIds.map((u) => u.achievementId));

    // 4. Vérifier chaque achievement non débloqué
    const newlyUnlocked: UnlockedAchievement[] = [];

    for (const achievement of allAchievements) {
      // Skip si déjà débloqué
      if (unlockedIdSet.has(achievement.id)) {
        continue;
      }

      // Vérifier si critères remplis
      const shouldUnlock = await checkAchievementCriteria(
        gameId,
        game.userId,
        achievement
      );

      if (shouldUnlock) {
        // Débloquer l'achievement
        await db.insert(userAchievements).values({
          userId: game.userId,
          gameId: gameId,
          achievementId: achievement.id,
        });

        console.log(`[Achievements] Unlocked: ${achievement.name}`);

        newlyUnlocked.push({
          achievement,
          unlockedAt: new Date(),
        });
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('[Achievements] Error checking achievements:', error);
    return [];
  }
}

/**
 * Vérifier si un achievement spécifique doit être débloqué
 */
async function checkAchievementCriteria(
  gameId: string,
  userId: string,
  achievement: Achievement
): Promise<boolean> {
  try {
    const criteriaValue = achievement.criteriaValue as Record<string, any>;

    switch (achievement.criteriaType) {
      case 'first_transaction':
        return await checkFirstTransaction(gameId);

      case 'asset_count':
        return await checkAssetCount(gameId, criteriaValue.min_count);

      case 'portfolio_value':
        return await checkPortfolioValue(gameId, criteriaValue.min_value);

      case 'return_percentage':
        return await checkReturnPercentage(gameId, criteriaValue.min_return);

      case 'specific_trade':
        return await checkSpecificTrade(
          gameId,
          criteriaValue.asset_type,
          criteriaValue.min_count
        );

      default:
        console.warn(`[Achievements] Unknown criteria type: ${achievement.criteriaType}`);
        return false;
    }
  } catch (error) {
    console.error('[Achievements] Error checking criteria:', error);
    return false;
  }
}

// ==========================================
// CRITERIA CHECKERS
// ==========================================

/**
 * Vérifier si l'utilisateur a fait au moins 1 transaction
 */
async function checkFirstTransaction(gameId: string): Promise<boolean> {
  const result = await db
    .select({ count: count() })
    .from(transactions)
    .where(eq(transactions.gameId, gameId));

  return result[0].count >= 1;
}

/**
 * Vérifier si l'utilisateur détient au moins X actifs différents
 */
async function checkAssetCount(gameId: string, minCount: number): Promise<boolean> {
  const distinctAssets = await db
    .selectDistinct({ symbol: holdings.symbol })
    .from(holdings)
    .where(and(eq(holdings.gameId, gameId), eq(holdings.isShort, false)));

  return distinctAssets.length >= minCount;
}

/**
 * Vérifier si la valeur du portfolio atteint un seuil
 */
async function checkPortfolioValue(gameId: string, minValue: number): Promise<boolean> {
  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
  });

  if (!game) return false;

  const portfolio = await calculatePortfolio(gameId, game.currentDate);
  if (!portfolio) return false;

  return portfolio.totalValue >= minValue;
}

/**
 * Vérifier si le rendement atteint un pourcentage
 */
async function checkReturnPercentage(gameId: string, minReturn: number): Promise<boolean> {
  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
  });

  if (!game) return false;

  const portfolio = await calculatePortfolio(gameId, game.currentDate);
  if (!portfolio) return false;

  return portfolio.returnPercentage >= minReturn;
}

/**
 * Vérifier si l'utilisateur a tradé X actifs d'un type spécifique
 */
async function checkSpecificTrade(
  gameId: string,
  assetType: string,
  minCount: number
): Promise<boolean> {
  // Import dynamique pour éviter circular dependency
  const { ALL_ASSETS } = await import('@/lib/market/assets');

  // Filtrer les symboles par type
  const symbolsOfType = ALL_ASSETS.filter((a) => a.type === assetType).map((a) => a.symbol);

  if (symbolsOfType.length === 0) return false;

  // Compter les actifs de ce type détenus
  const holdingsOfType = await db
    .selectDistinct({ symbol: holdings.symbol })
    .from(holdings)
    .where(
      and(
        eq(holdings.gameId, gameId),
        eq(holdings.isShort, false),
        sql`${holdings.symbol} = ANY(${symbolsOfType})`
      )
    );

  return holdingsOfType.length >= minCount;
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
  const allAchievements = await db.query.achievements.findMany();
  const unlockedIds = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.gameId, gameId));

  const unlockedIdSet = new Set(unlockedIds.map((u) => u.achievementId));

  return allAchievements.filter((a) => !unlockedIdSet.has(a.id));
}
