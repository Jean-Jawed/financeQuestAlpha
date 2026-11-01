/**
 * PASTFOLIO - VARIATION DE SÉANCE
 * Ce que le marché a fait au portefeuille depuis la séance précédente.
 * Formules pures (serveur et client), sans base.
 */

import type { HoldingWithValue } from '@/types/game';

/**
 * Variation de séance d'une position, dans la devise de la partie :
 * mouvement du cours depuis la séance précédente, appliqué à la quantité
 * détenue avant la séance (les titres pris aujourd'hui l'ont été au cours du jour)
 *
 * @param netTodayQuantity - Quantité ouverte aujourd'hui : achats − ventes (long), ventes à découvert − rachats (short)
 * @returns null si la variation du cours est inconnue
 */
export function positionSessionChange(position: {
  quantity: number;
  isShort: boolean;
  /** Cours actuel et cours à la séance précédente, dans la devise de la partie (effet de change compris) */
  price: number;
  previousPrice: number | null;
  netTodayQuantity: number;
}): number | null {
  if (position.previousPrice === null || position.price <= 0) return null;
  const carried = Math.max(position.quantity - position.netTodayQuantity, 0);
  const move = (position.price - position.previousPrice) * carried;
  return position.isShort ? -move : move;
}

export interface SessionChange {
  /** Gain ou perte de la séance, dans la devise de la partie */
  change: number;
  /** En % de la valeur à l'ouverture de la séance */
  percent: number;
}

/**
 * Variation de séance du portefeuille : somme des positions
 * null si aucune position n'a de variation connue
 */
export function portfolioSessionChange(holdings: HoldingWithValue[], totalValue: number): SessionChange | null {
  const known = holdings.filter((holding) => holding.dayChange !== null);
  if (known.length === 0) return null;
  const change = known.reduce((sum, holding) => sum + (holding.dayChange ?? 0), 0);
  const base = totalValue - change;
  return { change, percent: base > 0 ? (change / base) * 100 : 0 };
}

/** Meilleure et pire position de la séance (variation en devise), hors positions du jour */
export function sessionExtremes(holdings: HoldingWithValue[]): { best: HoldingWithValue | null; worst: HoldingWithValue | null } {
  const moved = holdings
    .filter((holding) => holding.dayChange !== null && holding.dayChange !== 0 && !holding.openedToday)
    .sort((a, b) => (b.dayChange ?? 0) - (a.dayChange ?? 0));
  const best = moved[0] && (moved[0].dayChange ?? 0) > 0 ? moved[0] : null;
  const last = moved[moved.length - 1];
  const worst = last && (last.dayChange ?? 0) < 0 ? last : null;
  return { best, worst };
}
