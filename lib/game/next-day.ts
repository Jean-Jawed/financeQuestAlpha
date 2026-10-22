/**
 * FINANCEQUEST - NEXT DAY LOGIC
 * Logique d'avancement du jour avec mise à jour du portfolio
 */

import { db } from '@/lib/db';
import { games, type Game } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getApiI18n } from '@/lib/i18n/server';
import { getNextTradingDate } from '@/lib/market/calendar';
import { daysBetween } from './achievement-rules';
import { settleAction } from './state';
import type { GameState } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

export interface NextDayResult {
  success: boolean;
  newDate?: string;
  /** État de la partie après la séance (la page n'a pas à la relire) */
  state?: GameState;
  achievementsUnlocked?: Array<{ name: string; points: number }>;
  error?: string;
}

// ==========================================
// NEXT DAY FUNCTION
// ==========================================

/**
 * Avancer d'un jour dans le game
 * - Prochain jour de bourse d'après la base prix (week-ends et fériés sautés)
 * - S'arrête à la dernière date disponible dans la base prix
 * - Vérifie les achievements et renvoie l'état complet de la partie
 *
 * @param game - Ligne games, déjà lue par l'appelant (contrôle de propriété)
 * @returns Résultat de l'opération
 */
export async function advanceToNextDay(game: Game): Promise<NextDayResult> {
  const { api, fmt, f } = await getApiI18n();

  try {
    // 1. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { success: false, error: api.gameInactive };
    }

    // 2. Prochain jour de bourse disponible
    const nextDate = await getNextTradingDate(game.currentDate);

    if (!nextDate) {
      return {
        success: false,
        error: fmt(api.endOfData, { date: f.date(game.currentDate) }),
      };
    }

    // 3. Mettre à jour le game, seulement s'il est encore à la date lue
    //    (un double-clic ne fait pas sauter deux jours)
    const [updatedGame] = await db
      .update(games)
      .set({
        currentDate: nextDate,
        updatedAt: new Date(),
      })
      .where(and(eq(games.id, game.id), eq(games.currentDate, game.currentDate)))
      .returning();

    if (!updatedGame) {
      return { success: false, error: api.alreadyAdvanced };
    }

    // 4. Portfolio à la nouvelle date, succès et état de la partie
    //    (la séance est passée même si l'état manque : la page le relira)
    const { state, achievementsUnlocked } = await settleAction(updatedGame);

    return { success: true, newDate: nextDate, state: state ?? undefined, achievementsUnlocked };
  } catch (error) {
    console.error('[NextDay] Error:', error);
    return {
      success: false,
      error: api.internal,
    };
  }
}

/**
 * Nombre de jours calendaires restants jusqu'à la fin des données de marché
 *
 * @param currentDate - Date actuelle du game
 * @param endDate - Dernière date de la base prix (voir getPriceCoverage)
 * @returns Nombre de jours restants (0 si la fin est atteinte)
 */
export function getRemainingDays(currentDate: string, endDate: string): number {
  return Math.max(daysBetween(currentDate, endDate), 0);
}
