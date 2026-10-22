/**
 * FINANCEQUEST - NEXT DAY LOGIC
 * Logique d'avancement du jour avec mise à jour du portfolio
 */

import { db } from '@/lib/db';
import { games, type Game } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { getApiI18n } from '@/lib/i18n/server';
import { getNextTradingDate, getPriceCoverage } from '@/lib/market/calendar';
import { daysBetween } from './achievement-rules';
import { endGame, type EndReason } from './end';
import { getScenario } from './scenarios';
import { loadGameState, settleAction } from './state';
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
  /** La séance a terminé la partie (faillite, fin de période ou des données) */
  endReason?: EndReason;
  error?: string;
}

// ==========================================
// NEXT DAY FUNCTION
// ==========================================

/**
 * Avancer d'un jour dans le game
 * - Prochain jour de bourse d'après la base prix (week-ends et fériés sautés)
 * - Compte la séance (retraite possible à partir de MIN_SESSIONS_TO_RETIRE)
 * - Vérifie les achievements et renvoie l'état complet de la partie
 * - Termine la partie d'elle-même en cas de faillite, à la dernière séance d'une
 *   période imposée ou à la fin des données de marché
 *
 * @param game - Ligne games, déjà lue par l'appelant (contrôle de propriété)
 * @returns Résultat de l'opération
 */
export async function advanceToNextDay(game: Game): Promise<NextDayResult> {
  const { api } = await getApiI18n();

  try {
    // 1. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { success: false, error: api.gameEnded };
    }

    const { period } = getScenario(game.scenario).rules;

    // 2. Prochain jour de bourse disponible, dans la période du scénario
    const nextDate = await getNextTradingDate(game.currentDate);

    if (!nextDate || (period && nextDate > period.end)) {
      // Plus aucune séance à jouer : la partie se termine à la date actuelle
      return finish(game, period ? 'period_end' : 'data_end', game.currentDate, []);
    }

    // 3. Mettre à jour le game, seulement s'il est encore à la date lue
    //    (un double-clic ne fait pas sauter deux jours)
    const [updatedGame] = await db
      .update(games)
      .set({
        currentDate: nextDate,
        sessionsPlayed: sql`${games.sessionsPlayed} + 1`,
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

    // 5. Fins automatiques
    const endReason = await automaticEnd(updatedGame, state?.portfolio.totalValue ?? null);
    if (endReason) {
      return finish(updatedGame, endReason, nextDate, achievementsUnlocked);
    }

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
 * La séance qui vient de passer termine-t-elle la partie ?
 * Faillite d'abord, puis dernière séance de la période ou des données
 */
async function automaticEnd(game: Game, totalValue: number | null): Promise<EndReason | null> {
  if (totalValue !== null && totalValue <= 0) {
    return 'bankrupt';
  }

  const { period } = getScenario(game.scenario).rules;
  if (period) {
    const following = await getNextTradingDate(game.currentDate);
    return !following || following > period.end ? 'period_end' : null;
  }

  const coverage = await getPriceCoverage();
  return game.currentDate >= coverage.end ? 'data_end' : null;
}

/** Clore la partie et renvoyer son état final (bilan) */
async function finish(
  game: Game,
  reason: EndReason,
  date: string,
  achievementsUnlocked: Array<{ name: string; points: number }>
): Promise<NextDayResult> {
  const ended = await endGame(game.id, reason);
  const state = await loadGameState(ended ?? game);
  return { success: true, newDate: date, state: state ?? undefined, achievementsUnlocked, endReason: reason };
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
