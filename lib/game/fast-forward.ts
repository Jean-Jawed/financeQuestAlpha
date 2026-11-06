/**
 * PASTFOLIO - AVANCE RAPIDE (calcul pur, sans accès base)
 *
 * Le joueur part « en vacances » : les séances défilent sans qu'il puisse passer
 * d'ordre. Chaque séance est jouée comme avec la cloche :
 * - appel de marge à l'ouverture (rachats et ventes d'office, voir margin-call.ts) ;
 * - valorisation au cours du jour (relevé de groupe, objectif de course).
 * L'avance s'arrête avant la date visée si :
 * - le courtier a passé des ordres d'office (le joueur est prévenu, comme par un
 *   vrai courtier, et reprend la main) ;
 * - la partie est perdue (faillite) ;
 * - la règle du groupe termine la partie (séances jouées, objectif de course atteint).
 */

import { planMarginCall, type ForcedOrder } from './margin-call';
import { valuePortfolio } from './portfolio-math';
import { groupEndReason, type GroupRules } from './groups';

// ==========================================
// TYPES
// ==========================================

export interface SimPosition {
  id: string;
  symbol: string;
  quantity: number;
  averageCost: number;
  isShort: boolean;
}

/** Cours d'un actif à une date, dans la devise de la partie */
export interface SimQuote {
  price: number;
  assetPrice: number;
  assetCurrency: string;
  fxRate: number;
}

export interface FastForwardInput {
  cash: number;
  initialBalance: number;
  positions: SimPosition[];
  /** Séances à jouer, dans l'ordre (jours de bourse, après la date en jeu) */
  dates: string[];
  /** Cours par date puis par symbole (absent : pas de cours ce jour-là) */
  quotes: Map<string, Map<string, SimQuote>>;
  feeRate: number;
  /** Séances déjà jouées avant l'avance */
  sessionsPlayed: number;
  /** Partie de groupe : règle de fin */
  group?: GroupRules | null;
}

export interface DatedForcedOrder extends ForcedOrder {
  date: string;
  quote: SimQuote;
}

export type FastForwardStop = 'margin_call' | 'bankrupt' | 'group';

export interface FastForwardResult {
  /** Séances effectivement jouées (≥ 1 si des dates étaient fournies) */
  sessions: number;
  /** Date de la dernière séance jouée */
  finalDate: string;
  cash: number;
  /** Positions restantes (quantité mise à jour) */
  positions: SimPosition[];
  /** Positions soldées d'office */
  closedIds: string[];
  forcedOrders: DatedForcedOrder[];
  /** Valeur nette à la clôture de chaque séance */
  values: Array<{ date: string; totalValue: number; openPositions: number; forcedSoFar: number }>;
  /** Arrêt avant la date visée (null : date visée atteinte) */
  stoppedBy: FastForwardStop | null;
}

// ==========================================
// SIMULATION
// ==========================================

export function simulateFastForward(input: FastForwardInput): FastForwardResult {
  let cash = input.cash;
  let positions = input.positions.map((position) => ({ ...position }));
  const closedIds: string[] = [];
  const forcedOrders: DatedForcedOrder[] = [];
  const values: FastForwardResult['values'] = [];
  let stoppedBy: FastForwardStop | null = null;
  let sessions = 0;

  for (const date of input.dates) {
    sessions += 1;
    const dayQuotes = input.quotes.get(date) ?? new Map<string, SimQuote>();
    const priceOf = (symbol: string) => dayQuotes.get(symbol)?.price ?? null;

    // 1. Appel de marge à l'ouverture
    const plan = planMarginCall(
      cash,
      positions.map((position) => ({ ...position, price: priceOf(position.symbol) })),
      input.feeRate
    );
    if (plan.orders.length > 0) {
      cash = plan.cashAfter;
      for (const order of plan.orders) {
        forcedOrders.push({ ...order, date, quote: dayQuotes.get(order.symbol)! });
        if (order.remaining > 0) {
          positions = positions.map((p) => (p.id === order.holdingId ? { ...p, quantity: order.remaining } : p));
        } else {
          positions = positions.filter((p) => p.id !== order.holdingId);
          closedIds.push(order.holdingId);
        }
      }
    }

    // 2. Valorisation à la clôture
    const portfolio = valuePortfolio(
      cash,
      input.initialBalance,
      positions.map((position) => ({ ...position, price: priceOf(position.symbol) }))
    );
    values.push({ date, totalValue: portfolio.totalValue, openPositions: positions.length, forcedSoFar: forcedOrders.length });

    // 3. Arrêts (même ordre que la cloche : faillite, groupe, puis appel de marge)
    if (portfolio.totalValue <= 0 && positions.length === 0) {
      stoppedBy = 'bankrupt';
    } else if (input.group && groupEndReason(input.group, input.sessionsPlayed + sessions, portfolio.returnPercentage)) {
      stoppedBy = 'group';
    } else if (plan.orders.length > 0) {
      stoppedBy = 'margin_call';
    }
    if (stoppedBy) break;
  }

  // Arrêt sur la toute dernière date visée : la date est atteinte quand même
  if (stoppedBy && sessions === input.dates.length && stoppedBy === 'margin_call') {
    stoppedBy = null;
  }

  return {
    sessions,
    finalDate: input.dates[sessions - 1],
    cash,
    positions,
    closedIds,
    forcedOrders,
    values,
    stoppedBy,
  };
}

// ==========================================
// DATES PROPOSÉES
// ==========================================

/** Durées proposées, en jours calendaires */
export const FAST_FORWARD_PRESETS = { week: 7, month: 30, quarter: 91, year: 365 } as const;
export type FastForwardPreset = keyof typeof FAST_FORWARD_PRESETS;

/** Ajouter des jours calendaires à une date YYYY-MM-DD */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Dernière séance au plus tard `days` jours après la date en jeu
 * (retour de vacances : on reprend à la dernière cloche avant le retour)
 *
 * @param dates - Séances possibles, triées
 * @returns null si la durée dépasse la dernière séance possible, ou si aucune séance n'y tient
 */
export function presetDate(currentDate: string, dates: readonly string[], days: number): string | null {
  if (dates.length === 0) return null;
  const until = addDays(currentDate, days);
  if (until > dates[dates.length - 1]) return null;
  let found: string | null = null;
  for (const date of dates) {
    if (date > until) break;
    found = date;
  }
  return found;
}
