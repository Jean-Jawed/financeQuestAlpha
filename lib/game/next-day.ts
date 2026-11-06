/**
 * PASTFOLIO - NEXT DAY LOGIC
 * Logique d'avancement du jour avec mise à jour du portfolio
 */

import { db } from '@/lib/db';
import { games, groups, type Game } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { getApiI18n } from '@/lib/i18n/server';
import { getNextTradingDate, getPriceCoverage } from '@/lib/market/calendar';
import { daysBetween } from './achievement-rules';
import { endGame, type EndReason } from './end';
import { getScenario } from './scenarios';
import { groupEndReason } from './groups';
import { loadGameState, settleAction } from './state';
import { applyMarginCall } from './margin-call-server';
import type { ForcedOrder } from './margin-call';
import { sessionGrants } from '@/lib/xp/hooks';
import { mergeOutcomes, type XpOutcome } from '@/lib/xp/server';
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
  /** XP gagnée par la séance (et la fin de partie qu'elle a provoquée) */
  xp?: XpOutcome | null;
  /** Appel de marge à l'ouverture : ordres passés d'office (vide : aucun) */
  forcedOrders?: ForcedOrder[];
  error?: string;
}

// ==========================================
// NEXT DAY FUNCTION
// ==========================================

/**
 * Avancer d'un jour dans le game
 * - Prochain jour de bourse d'après la base prix (week-ends et fériés sautés)
 * - Compte la séance (retraite possible à partir de MIN_SESSIONS_TO_RETIRE)
 * - Appel de marge au cours du jour : rachats et ventes d'office si la marge est trop faible
 * - Vérifie les achievements et renvoie l'état complet de la partie
 * - Termine la partie d'elle-même en cas de faillite, à la fin fixée par son groupe
 *   (partie de groupe), à la dernière séance d'une période imposée ou à la fin des
 *   données de marché
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
      return finish(game, period ? 'period_end' : 'data_end', game.currentDate, [], null);
    }

    // 3. Mettre à jour le game, seulement s'il est encore à la date lue
    //    (un double-clic ne fait pas sauter deux jours)
    const [advancedGame] = await db
      .update(games)
      .set({
        currentDate: nextDate,
        sessionsPlayed: sql`${games.sessionsPlayed} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(games.id, game.id), eq(games.currentDate, game.currentDate)))
      .returning();

    if (!advancedGame) {
      return { success: false, error: api.alreadyAdvanced };
    }

    // 4. Appel de marge à l'ouverture de la séance
    const marginCall = await applyMarginCall(advancedGame.id);
    const updatedGame = marginCall?.game ?? advancedGame;
    const forcedOrders = marginCall?.orders ?? [];

    // 5. Portfolio à la nouvelle date, succès et état de la partie
    //    (la séance est passée même si l'état manque : la page le relira)
    const { state, achievementsUnlocked, xp } = await settleAction(
      updatedGame,
      await sessionGrants(updatedGame, game.currentDate).catch(() => [])
    );

    // 6. Fins automatiques
    const endReason = await automaticEnd(updatedGame, state);
    if (endReason) {
      return { ...(await finish(updatedGame, endReason, nextDate, achievementsUnlocked, xp)), forcedOrders };
    }

    return { success: true, newDate: nextDate, state: state ?? undefined, achievementsUnlocked, xp, forcedOrders };
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
 * Faillite d'abord, puis règles du groupe, puis dernière séance de la période ou des données
 */
export async function automaticEnd(game: Game, state: GameState | null): Promise<EndReason | null> {
  const returnPercentage = state?.portfolio.returnPercentage ?? null;

  if (state && isBankrupt(state)) {
    return 'bankrupt';
  }

  if (game.groupId) {
    const group = await db.query.groups.findFirst({ where: eq(groups.id, game.groupId) });
    if (group) {
      const reason = groupEndReason(
        {
          mode: group.mode,
          sessionsTarget: group.sessionsTarget,
          targetReturn: group.targetReturn === null ? null : parseFloat(group.targetReturn),
        },
        game.sessionsPlayed,
        returnPercentage ?? 0
      );
      if (reason) return reason;
    }
  }

  const { period } = getScenario(game.scenario).rules;
  if (period) {
    const following = await getNextTradingDate(game.currentDate);
    return !following || following > period.end ? 'period_end' : null;
  }

  const coverage = await getPriceCoverage();
  return game.currentDate >= coverage.end ? 'data_end' : null;
}

/**
 * Faillite : valeur nette nulle ou négative, et plus aucun moyen de se refaire.
 * Après l'appel de marge, il ne reste alors aucune position cotée ; une position
 * sans cours (actif suspendu) peut encore revenir : la partie continue.
 */
export function isBankrupt(state: Pick<GameState, 'portfolio' | 'holdings'>): boolean {
  return state.portfolio.totalValue <= 0 && state.holdings.length === 0;
}

/** Clore la partie et renvoyer son état final (bilan) */
export async function finish(
  game: Game,
  reason: EndReason,
  date: string,
  achievementsUnlocked: Array<{ name: string; points: number }>,
  xp: XpOutcome | null
): Promise<NextDayResult> {
  const ended = await endGame(game.id, reason);
  const state = await loadGameState(ended?.game ?? game);
  return {
    success: true,
    newDate: date,
    state: state ?? undefined,
    achievementsUnlocked,
    endReason: reason,
    xp: mergeOutcomes(xp, ended?.xp ?? null),
  };
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
