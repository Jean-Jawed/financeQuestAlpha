/**
 * FINANCEQUEST - PORTFOLIO MATH
 * Calculs financiers purs (sans accès base) : valorisation, frais, marge
 *
 * Convention de comptabilité des ventes à découvert (short) :
 * - À l'ouverture, le produit de la vente (net de frais) est crédité au cash,
 *   et une DETTE est créée : rendre `quantité` titres plus tard.
 * - La dette est valorisée au prix courant : quantité × prix actuel.
 * - Valeur totale = cash + valeur des longs − dette des shorts.
 * - Le produit des shorts reste bloqué en garantie : il n'est pas
 *   disponible pour acheter (cash disponible = cash − Σ coût moyen × quantité).
 *
 * Exemple : 10 000 € de cash, short de 10 titres à 100 € (frais 0,25 %)
 * → cash 10 997,50 €, dette 1 000 €, valeur totale 9 997,50 € (seuls les frais sont perdus).
 */

import type { PortfolioCalculation } from '@/types/game';

// ==========================================
// CONSTANTES
// ==========================================

/**
 * Marge exigée sur les positions short : la valeur nette du portefeuille
 * doit couvrir au moins 50 % de la dette totale des shorts (règle type Reg T).
 * Levier maximal en short : 2 × la valeur nette.
 */
export const SHORT_MARGIN_RATIO = 0.5;

// ==========================================
// TYPES
// ==========================================

export interface PositionInput {
  quantity: number;
  averageCost: number;
  isShort: boolean;
  /** Prix courant ; null ou 0 si indisponible */
  price: number | null;
}

// ==========================================
// VALORISATION
// ==========================================

/**
 * Valoriser un portefeuille à partir du cash et des positions
 *
 * Prix indisponible :
 * - long : valeur 0 (prudent)
 * - short : dette valorisée au coût moyen (P&L neutre), pour ne jamais
 *   gonfler artificiellement la valeur
 */
export function valuePortfolio(
  cash: number,
  initialBalance: number,
  positions: PositionInput[]
): PortfolioCalculation {
  let portfolioValueLong = 0;
  let shortLiability = 0;
  let shortProceeds = 0;

  for (const position of positions) {
    const hasPrice = position.price !== null && position.price > 0;

    if (position.isShort) {
      const price = hasPrice ? (position.price as number) : position.averageCost;
      shortLiability += position.quantity * price;
      shortProceeds += position.quantity * position.averageCost;
    } else if (hasPrice) {
      portfolioValueLong += position.quantity * (position.price as number);
    }
  }

  const shortPositionsPnl = shortProceeds - shortLiability;
  const totalValue = cash + portfolioValueLong - shortLiability;
  const availableCash = cash - shortProceeds;
  const returnPercentage =
    initialBalance > 0 ? ((totalValue - initialBalance) / initialBalance) * 100 : 0;
  const score = Math.floor(returnPercentage * 10);

  return {
    currentBalance: cash,
    availableCash,
    portfolioValueLong,
    shortLiability,
    shortPositionsPnl,
    totalValue,
    returnPercentage,
    score,
  };
}

// ==========================================
// TRANSACTIONS
// ==========================================

/**
 * Calculer le P&L d'une transaction potentielle (preview avant exécution)
 *
 * @param type - Type de transaction (buy/sell/short/cover)
 * @param quantity - Quantité
 * @param price - Prix actuel
 * @param fees - Frais de transaction (%)
 * @returns Détails du calcul
 */
export function calculateTransactionPreview(
  type: 'buy' | 'sell' | 'short' | 'cover',
  quantity: number,
  price: number,
  fees: number
): {
  subtotal: number;
  feeAmount: number;
  total: number;
  balanceChange: number;
} {
  const subtotal = quantity * price;
  const feeAmount = subtotal * (fees / 100);

  let total: number;
  let balanceChange: number;

  switch (type) {
    case 'buy':
      total = subtotal + feeAmount;
      balanceChange = -total; // Balance diminue
      break;

    case 'sell':
      total = subtotal - feeAmount;
      balanceChange = total; // Balance augmente
      break;

    case 'short':
      total = subtotal - feeAmount;
      balanceChange = total; // Produit crédité, mais bloqué en garantie (dette)
      break;

    case 'cover':
      total = subtotal + feeAmount;
      balanceChange = -total; // Balance diminue
      break;
  }

  return {
    subtotal,
    feeAmount,
    total,
    balanceChange,
  };
}

/**
 * Vérifier la marge avant d'ouvrir (ou d'augmenter) un short
 *
 * Après l'ordre, la valeur nette (diminuée des frais) doit couvrir
 * SHORT_MARGIN_RATIO × (dette existante + nouveau notionnel).
 *
 * @returns null si OK, sinon la marge requise et la valeur nette disponible
 */
export function checkShortMargin(
  portfolio: Pick<PortfolioCalculation, 'totalValue' | 'shortLiability'>,
  notional: number,
  feeAmount: number
): { required: number; equity: number } | null {
  const equityAfter = portfolio.totalValue - feeAmount;
  const required = SHORT_MARGIN_RATIO * (portfolio.shortLiability + notional);

  return equityAfter >= required ? null : { required, equity: equityAfter };
}
