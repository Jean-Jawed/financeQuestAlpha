/**
 * PASTFOLIO - AVANCE RAPIDE (bornes et exécution)
 *
 * Bornes : la date visée doit être un jour de bourse après la date en jeu, au plus
 * - à la fin de la période du scénario (période imposée) ;
 * - à la fin des données de marché ;
 * - partie de groupe : à la dernière séance du groupe (séances restantes).
 * Tempo synchronisé : interdit, la séance avance pour tout le groupe à la fois.
 *
 * Exécution : séances simulées en mémoire (voir fast-forward.ts), puis écrites
 * en une transaction (ordres d'office datés, positions, cash, date, séances,
 * relevés de groupe). Succès, XP et fins de partie comme après la cloche.
 */

import { db } from '@/lib/db';
import { gameSnapshots, games, groups, holdings, transactions, type Game } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getPriceCoverage, getTradingDatesBetween } from '@/lib/market/calendar';
import { getQuoteSeries } from '@/lib/market/prices';
import { historicGrants } from '@/lib/xp/hooks';
import { getScenario } from './scenarios';
import { settleAction } from './state';
import { calculatePortfolio } from './calculations';
import { automaticEnd, finish } from './next-day';
import { simulateFastForward, type DatedForcedOrder, type FastForwardStop, type SimQuote } from './fast-forward';
import type { GroupRules } from './groups';
import type { EndReason } from './end';
import type { XpOutcome } from '@/lib/xp/server';
import type { GameState } from '@/types/game';

// ==========================================
// BORNES
// ==========================================

/** Ce qui fixe la dernière date atteignable */
export type FastForwardLimit = 'period' | 'data' | 'group';

export type FastForwardBlock = 'ended' | 'synchro' | 'no_session';

export interface FastForwardBounds {
  /** null : avance possible */
  blocked: FastForwardBlock | null;
  /** Séances atteignables, triées (la dernière est la date maximale) */
  dates: string[];
  limit: FastForwardLimit;
}

interface GroupContext {
  rules: GroupRules;
  tempo: string;
}

async function loadGroupContext(game: Game): Promise<GroupContext | null> {
  if (!game.groupId) return null;
  const group = await db.query.groups.findFirst({ where: eq(groups.id, game.groupId) });
  if (!group) return null;
  return {
    tempo: group.tempo,
    rules: {
      mode: group.mode,
      sessionsTarget: group.sessionsTarget,
      targetReturn: group.targetReturn === null ? null : parseFloat(group.targetReturn),
    },
  };
}

export async function fastForwardBounds(game: Game, group?: GroupContext | null): Promise<FastForwardBounds> {
  const context = group === undefined ? await loadGroupContext(game) : group;
  if (game.status !== 'active') return { blocked: 'ended', dates: [], limit: 'data' };
  if (context?.tempo === 'synchro') return { blocked: 'synchro', dates: [], limit: 'group' };

  const { period } = getScenario(game.scenario).rules;
  const coverage = await getPriceCoverage();
  const periodFirst = period && period.end < coverage.end;
  const until = periodFirst ? period.end : coverage.end;
  let limit: FastForwardLimit = periodFirst ? 'period' : 'data';
  let dates = await getTradingDatesBetween(game.currentDate, until);

  // Groupe : pas au-delà de la dernière séance prévue
  if (context) {
    const remaining = Math.max(context.rules.sessionsTarget - game.sessionsPlayed, 0);
    if (dates.length >= remaining) {
      dates = dates.slice(0, remaining);
      limit = 'group';
    }
  }

  return { blocked: dates.length === 0 ? 'no_session' : null, dates, limit };
}

// ==========================================
// EXÉCUTION
// ==========================================

export class FastForwardError extends Error {
  constructor(public readonly key: FastForwardBlock | 'invalid_date' | 'already_advanced') {
    super(key);
  }
}

export interface FastForwardOutcome {
  fromDate: string;
  newDate: string;
  sessions: number;
  /** Séances demandées (jusqu'à la date visée) */
  requested: number;
  stoppedBy: FastForwardStop | null;
  forcedOrders: Array<Omit<DatedForcedOrder, 'quote'>>;
  valueBefore: number;
  state?: GameState;
  achievementsUnlocked: Array<{ name: string; points: number }>;
  endReason?: EndReason;
  xp: XpOutcome | null;
}

/**
 * Avancer jusqu'à `targetDate` (dernière séance au plus tard à cette date)
 * @throws FastForwardError si l'avance est impossible
 */
export async function fastForward(game: Game, targetDate: string): Promise<FastForwardOutcome> {
  const group = await loadGroupContext(game);
  const bounds = await fastForwardBounds(game, group);
  if (bounds.blocked) throw new FastForwardError(bounds.blocked);

  const dates = bounds.dates.filter((date) => date <= targetDate);
  if (dates.length === 0) throw new FastForwardError('invalid_date');

  // 1. Portefeuille de départ et cours de toute la période
  const positions = await db.query.holdings.findMany({ where: eq(holdings.gameId, game.id) });
  const series = await getQuoteSeries([...new Set(positions.map((p) => p.symbol))], dates, game.currency);
  const quotes = new Map<string, Map<string, SimQuote>>(series);

  const cash = parseFloat(game.currentBalance);
  const initialBalance = parseFloat(game.initialBalance);
  const sim = simulateFastForward({
    cash,
    initialBalance,
    positions: positions.map((p) => ({
      id: p.id,
      symbol: p.symbol,
      quantity: parseFloat(p.quantity),
      averageCost: parseFloat(p.averageCost),
      isShort: p.isShort,
    })),
    dates,
    quotes,
    feeRate: game.settings.transaction_fees,
    sessionsPlayed: game.sessionsPlayed,
    group: group?.rules ?? null,
  });

  // Valeur de départ (bilan des vacances), aux cours de la date en jeu
  const valueBefore = (await calculatePortfolio(game.id, game.currentDate))?.totalValue ?? cash;

  // 2. Écriture, sous verrou : la partie doit être encore à la date lue
  const updatedGame = await db.transaction(async (tx) => {
    const [locked] = await tx.select().from(games).where(eq(games.id, game.id)).for('update');
    if (!locked || locked.status !== 'active' || locked.currentDate !== game.currentDate) {
      throw new FastForwardError('already_advanced');
    }

    const now = new Date();
    // Ordres déjà passés (relevés de groupe), avant ceux de l'avance
    const [{ orders }] = await tx
      .select({ orders: sql<number>`COUNT(*)::int` })
      .from(transactions)
      .where(eq(transactions.gameId, game.id));
    const baseOrders = Number(orders);

    if (sim.forcedOrders.length > 0) {
      await tx.insert(transactions).values(
        sim.forcedOrders.map((order) => ({
          gameId: game.id,
          symbol: order.symbol,
          type: order.type,
          quantity: order.quantity.toFixed(8),
          price: order.price.toFixed(6),
          assetCurrency: order.quote.assetCurrency,
          assetPrice: order.quote.assetPrice.toFixed(6),
          fxRate: order.quote.fxRate.toFixed(10),
          fee: order.fee.toFixed(2),
          total: order.total.toFixed(2),
          forced: true,
          transactionDate: order.date,
        }))
      );
    }

    // Positions réduites ou soldées par les appels de marge
    const before = new Map(positions.map((p) => [p.id, parseFloat(p.quantity)]));
    await Promise.all([
      ...sim.closedIds.map((id) => tx.delete(holdings).where(eq(holdings.id, id))),
      ...sim.positions
        .filter((p) => Math.abs((before.get(p.id) ?? p.quantity) - p.quantity) > 1e-9)
        .map((p) => tx.update(holdings).set({ quantity: p.quantity.toFixed(8), updatedAt: now }).where(eq(holdings.id, p.id))),
    ]);

    // Partie de groupe : relevé de chaque séance (ce que voient les concurrents à leur date)
    if (game.groupId && sim.values.length > 0) {
      await tx
        .insert(gameSnapshots)
        .values(
          sim.values.map((value) => ({
            gameId: game.id,
            date: value.date,
            totalValue: value.totalValue.toFixed(2),
            ordersCount: baseOrders + value.forcedSoFar,
            openPositions: value.openPositions,
          }))
        )
        .onConflictDoUpdate({
          target: [gameSnapshots.gameId, gameSnapshots.date],
          set: {
            totalValue: sql`excluded.total_value`,
            ordersCount: sql`excluded.orders_count`,
            openPositions: sql`excluded.open_positions`,
          },
        });
    }

    const [updated] = await tx
      .update(games)
      .set({
        currentDate: sim.finalDate,
        sessionsPlayed: sql`${games.sessionsPlayed} + ${sim.sessions}`,
        currentBalance: sim.cash.toFixed(2),
        updatedAt: now,
      })
      .where(eq(games.id, game.id))
      .returning();
    return updated;
  });

  // 3. Succès, XP (moments historiques seulement : pas d'XP de séance en vacances)
  //    et état de la partie, puis fins automatiques comme après la cloche
  const { state, achievementsUnlocked, xp } = await settleAction(
    updatedGame,
    await historicGrants(updatedGame, game.currentDate).catch(() => [])
  );

  const outcome: FastForwardOutcome = {
    fromDate: game.currentDate,
    newDate: sim.finalDate,
    sessions: sim.sessions,
    requested: dates.length,
    stoppedBy: sim.stoppedBy,
    forcedOrders: sim.forcedOrders.map(({ quote: _quote, ...order }) => order),
    valueBefore,
    state: state ?? undefined,
    achievementsUnlocked,
    xp,
  };

  const endReason = await automaticEnd(updatedGame, state);
  if (endReason) {
    const ended = await finish(updatedGame, endReason, sim.finalDate, achievementsUnlocked, xp);
    return { ...outcome, state: ended.state, endReason, xp: ended.xp ?? null };
  }
  return outcome;
}
