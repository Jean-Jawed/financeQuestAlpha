/**
 * PASTFOLIO - APPEL DE MARGE (calcul pur, sans accès base)
 *
 * À chaque nouvelle séance, comme un courtier :
 * - Marge = valeur nette ÷ dette des shorts (au cours du jour).
 * - Sous MAINTENANCE_MARGIN_RATIO (30 %), appel de marge : le courtier rachète
 *   d'office des shorts, les plus perdants d'abord, juste assez pour revenir
 *   à la marge initiale (SHORT_MARGIN_RATIO, 50 %).
 * - Si le cash ne suffit pas à payer ces rachats, il vend des positions longues.
 * - Valeur nette nulle ou négative : la marge ne peut plus être rétablie,
 *   tout est soldé. Il ne reste rien : c'est la faillite.
 *
 * Positions sans cours ce jour-là (actif suspendu) : on ne peut pas les traiter,
 * elles restent en place.
 */

import { SHORT_MARGIN_RATIO } from './portfolio-math';

/** Seuil d'entretien : en dessous, appel de marge (règle type FINRA, 30 %) */
export const MAINTENANCE_MARGIN_RATIO = 0.3;

const EPSILON = 1e-9;

export interface MarginPosition {
  id: string;
  symbol: string;
  quantity: number;
  averageCost: number;
  isShort: boolean;
  /** Cours du jour dans la devise de la partie ; null si indisponible */
  price: number | null;
}

export interface ForcedOrder {
  holdingId: string;
  symbol: string;
  type: 'cover' | 'sell';
  quantity: number;
  price: number;
  fee: number;
  /** Montant payé (rachat) ou encaissé (vente), frais compris */
  total: number;
  /** Quantité restante après l'ordre (0 : position soldée) */
  remaining: number;
}

export interface MarginStatus {
  /** Valeur nette : cash + longs − dette des shorts */
  equity: number;
  /** Dette des shorts au cours du jour */
  liability: number;
  /** Valeur nette ÷ dette (null : aucun short) */
  ratio: number | null;
}

export interface MarginCallPlan extends MarginStatus {
  /** Ordres d'office, dans l'ordre d'exécution (vide : pas d'appel de marge) */
  orders: ForcedOrder[];
  /** Cash après les ordres d'office */
  cashAfter: number;
}

/**
 * Niveau de marge d'un portefeuille
 * (short sans cours : dette au coût moyen, comme valuePortfolio)
 */
export function marginStatus(cash: number, positions: MarginPosition[]): MarginStatus {
  let longValue = 0;
  let liability = 0;
  for (const position of positions) {
    const priced = position.price !== null && position.price > 0;
    if (position.isShort) {
      liability += position.quantity * (priced ? (position.price as number) : position.averageCost);
    } else if (priced) {
      longValue += position.quantity * (position.price as number);
    }
  }
  const equity = cash + longValue - liability;
  return { equity, liability, ratio: liability > EPSILON ? equity / liability : null };
}

/**
 * Quantité à traiter pour atteindre un montant : arrondie au titre supérieur
 * pour une position en titres entiers, au plus la position entière
 */
function quantityFor(amount: number, price: number, held: number): number {
  const exact = amount / price;
  const whole = Number.isInteger(Math.round(held * 1e8) / 1e8);
  const quantity = whole ? Math.ceil(exact - EPSILON) : Math.ceil(exact * 1e8) / 1e8;
  return Math.min(Math.max(quantity, 0), held);
}

/**
 * Appel de marge : les ordres d'office à passer à l'ouverture de la séance
 *
 * @param cash - Cash brut en base (produit des shorts compris)
 * @param positions - Positions au cours du jour
 * @param feeRate - Frais de transaction (%)
 */
export function planMarginCall(cash: number, positions: MarginPosition[], feeRate: number): MarginCallPlan {
  const status = marginStatus(cash, positions);
  const plan: MarginCallPlan = { ...status, orders: [], cashAfter: cash };

  if (status.ratio === null || status.ratio >= MAINTENANCE_MARGIN_RATIO) return plan;

  const fee = feeRate / 100;
  let balance = cash;

  // 1. Rachats : montant de dette à racheter pour revenir à la marge initiale
  //    valeur − frais × x ≥ 50 % × (dette − x)  ⇔  x ≥ (50 % × dette − valeur) ÷ (50 % − frais)
  //    Valeur nette nulle ou négative : tout racheter
  const restorable = status.equity > 0 && SHORT_MARGIN_RATIO > fee;
  let toCover = restorable
    ? (SHORT_MARGIN_RATIO * status.liability - status.equity) / (SHORT_MARGIN_RATIO - fee)
    : Infinity;

  const shorts = positions
    .filter((p) => p.isShort && p.price !== null && p.price > 0)
    // Les plus perdants d'abord
    .sort((a, b) => ((b.price as number) - b.averageCost) * b.quantity - ((a.price as number) - a.averageCost) * a.quantity);

  for (const position of shorts) {
    if (toCover <= EPSILON) break;
    const price = position.price as number;
    const quantity = toCover === Infinity ? position.quantity : quantityFor(toCover, price, position.quantity);
    if (quantity <= 0) continue;

    const subtotal = quantity * price;
    const orderFee = subtotal * fee;
    balance -= subtotal + orderFee;
    toCover -= subtotal;
    plan.orders.push({
      holdingId: position.id,
      symbol: position.symbol,
      type: 'cover',
      quantity,
      price,
      fee: orderFee,
      total: subtotal + orderFee,
      remaining: Math.max(Math.round((position.quantity - quantity) * 1e8) / 1e8, 0),
    });
  }

  // 2. Ventes : le cash ne doit pas rester négatif (plus grosses positions d'abord)
  const longs = positions
    .filter((p) => !p.isShort && p.price !== null && p.price > 0)
    .sort((a, b) => b.quantity * (b.price as number) - a.quantity * (a.price as number));

  for (const position of longs) {
    if (balance >= -EPSILON) break;
    const price = position.price as number;
    const net = price * (1 - fee);
    const quantity = quantityFor(-balance, net, position.quantity);
    if (quantity <= 0) continue;

    const subtotal = quantity * price;
    const orderFee = subtotal * fee;
    balance += subtotal - orderFee;
    plan.orders.push({
      holdingId: position.id,
      symbol: position.symbol,
      type: 'sell',
      quantity,
      price,
      fee: orderFee,
      total: subtotal - orderFee,
      remaining: Math.max(Math.round((position.quantity - quantity) * 1e8) / 1e8, 0),
    });
  }

  plan.cashAfter = balance;
  return plan;
}

// ==========================================
// SEUILS AFFICHÉS AU JOUEUR
// ==========================================

/** Sous ce niveau de marge, alerte « appel de marge proche » */
export const MARGIN_WARNING_RATIO = 0.4;

export interface MarginBook {
  /** Valeur nette : cash + longs − dette */
  equity: number;
  /** Dette des shorts au cours du jour */
  liability: number;
}

/**
 * Cours (devise de la partie) au-delà duquel un short déclenche l'appel de marge,
 * toutes autres positions inchangées
 *
 * Avec Q titres shortés au cours P et la dette des autres shorts D :
 * (valeur nette + Q·P − Q·X) ÷ (D + Q·X) = seuil  ⇔  X = (valeur nette + Q·P − seuil·D) ÷ ((1 + seuil)·Q)
 *
 * @returns null sans quantité ; un cours ≤ P signifie que l'appel est déjà déclenché
 */
export function marginCallPrice(book: MarginBook, quantity: number, price: number): number | null {
  if (quantity <= EPSILON || price <= 0) return null;
  const others = Math.max(book.liability - quantity * price, 0);
  const threshold = (book.equity + quantity * price - MAINTENANCE_MARGIN_RATIO * others) / ((1 + MAINTENANCE_MARGIN_RATIO) * quantity);
  return Math.max(threshold, 0);
}

/**
 * Hausse de tous les shorts (en fraction, 0,15 = +15 %) qui déclencherait l'appel de marge,
 * titres détenus inchangés : (V − x·D) ÷ (D·(1 + x)) = seuil
 *
 * @returns null sans short ; négatif ou nul : appel déjà déclenché
 */
export function toleratedRise(book: MarginBook): number | null {
  if (book.liability <= EPSILON) return null;
  return (book.equity - MAINTENANCE_MARGIN_RATIO * book.liability) / ((1 + MAINTENANCE_MARGIN_RATIO) * book.liability);
}
