/**
 * FINANCEQUEST - NEXT DAY LOGIC
 * Logique d'avancement du jour avec mise à jour du portfolio
 */

import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nextBusinessDay, getTodayDate, isAfter } from '@/lib/utils/dates';
import { calculatePortfolio } from './calculations';
import { checkAndUnlockAchievements } from './achievements';
import { prefetchSingleDay } from '@/lib/market/prefetch';

// ==========================================
// TYPES
// ==========================================

export interface NextDayResult {
  success: boolean;
  newDate?: string;
  portfolio?: {
    totalValue: number;
    returnPercentage: number;
    portfolioValueLong: number;
    shortPositionsPnl: number;
  };
  achievementsUnlocked?: Array<{ name: string; points: number }>;
  error?: string;
}

// ==========================================
// NEXT DAY FUNCTION
// ==========================================

/**
 * Avancer d'un jour dans le game
 * - Skip les week-ends automatiquement
 * - Recalcule le portfolio
 * - Vérifie les achievements
 * 
 * @param gameId - ID du game
 * @returns Résultat de l'opération
 */
export async function advanceToNextDay(gameId: string): Promise<NextDayResult> {
  try {
    console.log(`[NextDay] Starting for game ${gameId}`);

    // 1. Récupérer le game
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { success: false, error: 'Game non trouvé' };
    }

    // 2. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { success: false, error: 'Le game n\'est pas actif' };
    }

    // 3. Calculer la date suivante (skip week-ends)
    const nextDate = nextBusinessDay(game.currentDate);
    console.log(`[NextDay] Current: ${game.currentDate}, Next: ${nextDate}`);

    // 4. Vérifier que la nouvelle date ne dépasse pas aujourd'hui
    const today = getTodayDate();
    if (isAfter(nextDate, today)) {
      return {
        success: false,
        error: 'Vous avez atteint la date actuelle. Impossible d\'avancer plus loin.',
      };
    }

    // 5. Pre-fetch les données du nouveau jour (BATCH: 1 call pour 85 symboles)
    console.log(`[NextDay] Pre-fetching data for ${nextDate}`);
    const prefetchedRecords = await prefetchSingleDay(nextDate);
    console.log(`[NextDay] Prefetched ${prefetchedRecords} records for ${nextDate}`);

    // 6. Recalculer le portfolio à la nouvelle date (cache = 100% HIT normalement)
    console.log('[NextDay] Calculating portfolio at new date');
    const portfolioCalc = await calculatePortfolio(gameId, nextDate);

    if (!portfolioCalc) {
      return { success: false, error: 'Erreur lors du calcul du portfolio' };
    }

    // 7. Mettre à jour le game
    await db
      .update(games)
      .set({
        currentDate: nextDate,
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId));

    console.log(`[NextDay] Game updated to ${nextDate}`);

    // 8. Vérifier les achievements
    console.log('[NextDay] Checking achievements');
    const unlockedAchievements = await checkAndUnlockAchievements(gameId);

    // 9. Retourner le résultat
    return {
      success: true,
      newDate: nextDate,
      portfolio: {
        totalValue: portfolioCalc.totalValue,
        returnPercentage: portfolioCalc.returnPercentage,
        portfolioValueLong: portfolioCalc.portfolioValueLong,
        shortPositionsPnl: portfolioCalc.shortPositionsPnl,
      },
      achievementsUnlocked: unlockedAchievements.map((a) => ({
        name: a.achievement.name,
        points: a.achievement.points,
      })),
    };
  } catch (error) {
    console.error('[NextDay] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Avancer de plusieurs jours d'un coup (pour tests ou fast-forward)
 * 
 * @param gameId - ID du game
 * @param days - Nombre de jours à avancer
 * @returns Résultat final
 */
export async function advanceMultipleDays(
  gameId: string,
  days: number
): Promise<NextDayResult> {
  try {
    let lastResult: NextDayResult = { success: false };

    for (let i = 0; i < days; i++) {
      lastResult = await advanceToNextDay(gameId);

      if (!lastResult.success) {
        break;
      }
    }

    return lastResult;
  } catch (error) {
    console.error('[NextDay] Error advancing multiple days:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Vérifier combien de jours restent jusqu'à aujourd'hui
 * 
 * @param currentDate - Date actuelle du game
 * @returns Nombre de jours ouvrables restants
 */
export function getRemainingDays(currentDate: string): number {
  const today = getTodayDate();
  let count = 0;
  let date = currentDate;

  while (!isAfter(date, today)) {
    date = nextBusinessDay(date);
    count++;

    // Sécurité : limite à 10000 jours
    if (count > 10000) break;
  }

  return count - 1; // -1 car on compte jusqu'à aujourd'hui inclus
}