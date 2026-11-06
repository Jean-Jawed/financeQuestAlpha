/**
 * PASTFOLIO - PORTFOLIO MATH
 * Calculs financiers purs (sans accès base) : valorisation, frais, marge
 *
 * Convention de comptabilité des ventes à découvert (short) :
 * - À l'ouverture, le produit de la vente (net de frais) est crédité au cash,
 *   et une DETTE est créée : rendre `quantité` titres plus tard.
 * - La dette est valorisée au prix courant : quantité × prix actuel.
 * - Valeur totale = cash + valeur des longs − dette des shorts.
 * - Compte sur marge (règle type Reg T, garantie de 150 % du montant vendu) :
 *   le cash qui servira au rachat (la dette au cours du jour) est réservé,
 *   et la garantie (50 % de la dette au cours du jour) est bloquée.
 *   Liquidités disponibles = min(cash − dette, valeur nette − garantie).
 *   La garantie suit le cours : une baisse du titre shorté en libère,
 *   une hausse en exige davantage (disponible négatif : ordres bloqués).
 *   Les titres détenus comptent dans la valeur nette, donc dans la garantie.
 *
 * Exemple : 10 000 € de cash, short de 20 000 € (frais ignorés)
 * → cash 30 000 €, dette 20 000 € (réservée au rachat), garantie 10 000 € (bloquée),
 *   disponible 0 €, valeur nette 10 000 €.
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
  const margin = marginAccount(cash, totalValue, shortLiability);
  const returnPercentage =
    initialBalance > 0 ? ((totalValue - initialBalance) / initialBalance) * 100 : 0;
  const score = Math.floor(returnPercentage * 10);

  return {
    currentBalance: cash,
    availableCash: margin.available,
    portfolioValueLong,
    shortLiability,
    shortProceeds,
    marginRequired: margin.required,
    marginExcess: margin.excess,
    shortPositionsPnl,
    totalValue,
    returnPercentage,
    score,
  };
}

// ==========================================
// COMPTE SUR MARGE
// ==========================================

export interface MarginAccount {
  /** Garantie exigée : SHORT_MARGIN_RATIO × dette au cours du jour */
  required: number;
  /** Valeur nette au-delà de la garantie (négatif : garantie insuffisante) */
  excess: number;
  /** Liquidités utilisables pour acheter ou payer des frais (négatif : ordres bloqués) */
  available: number;
}

/**
 * Garantie et liquidités disponibles
 * Sans short : disponible = cash (la valeur nette, titres compris, est au moins le cash)
 *
 * @param cash - Cash brut (produit des shorts compris)
 * @param equity - Valeur nette : cash + longs − dette
 * @param liability - Dette des shorts au cours du jour
 */
export function marginAccount(cash: number, equity: number, liability: number): MarginAccount {
  const required = SHORT_MARGIN_RATIO * liability;
  const excess = equity - required;
  return { required, excess, available: Math.min(cash - liability, excess) };
}

/**
 * Quantité maximale d'un nouveau short (titres entiers) : la garantie de 50 %
 * et les frais doivent tenir dans l'excédent, les frais dans le disponible
 */
export function maxShortQuantity(
  portfolio: Pick<PortfolioCalculation, 'marginExcess' | 'availableCash'>,
  price: number,
  feeRate: number
): number {
  if (price <= 0) return 0;
  const fee = feeRate / 100;
  const byMargin = portfolio.marginExcess / (price * (SHORT_MARGIN_RATIO + fee));
  const byFees = fee > 0 ? portfolio.availableCash / (price * fee) : Infinity;
  return Math.max(Math.floor(Math.min(byMargin, byFees) + 1e-9), 0);
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
