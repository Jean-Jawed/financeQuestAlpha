import { describe, expect, it } from 'vitest';
import { marginCallPrice, marginStatus, planMarginCall, toleratedRise, MAINTENANCE_MARGIN_RATIO, type MarginPosition } from '@/lib/game/margin-call';
import { SHORT_MARGIN_RATIO } from '@/lib/game/portfolio-math';

const FEES = 0.25;

function short(id: string, quantity: number, averageCost: number, price: number | null): MarginPosition {
  return { id, symbol: id.toUpperCase(), quantity, averageCost, isShort: true, price };
}

function long(id: string, quantity: number, price: number | null): MarginPosition {
  return { id, symbol: id.toUpperCase(), quantity, averageCost: price ?? 1, isShort: false, price };
}

/** Cash après un short de `quantity` titres à `price` depuis 10 000 € */
function cashAfterShort(quantity: number, price: number) {
  return 10_000 + quantity * price * (1 - FEES / 100);
}

describe('planMarginCall', () => {
  it('ne fait rien sans découvert', () => {
    const plan = planMarginCall(10_000, [long('a', 10, 100)], FEES);
    expect(plan.ratio).toBeNull();
    expect(plan.orders).toEqual([]);
  });

  it('ne fait rien au-dessus du seuil d’entretien', () => {
    // Short de 10 000 €, le cours fait +5 % : marge ≈ 90 %
    const cash = cashAfterShort(100, 100);
    const plan = planMarginCall(cash, [short('a', 100, 100, 105)], FEES);
    expect(plan.ratio).toBeGreaterThan(MAINTENANCE_MARGIN_RATIO);
    expect(plan.orders).toEqual([]);
  });

  it('rachète juste assez pour revenir à la marge initiale', () => {
    // Short de 199 titres à 100 € (≈ 2 × la valeur nette), puis +40 %
    const cash = cashAfterShort(199, 100);
    const positions = [short('a', 199, 100, 140)];
    const before = marginStatus(cash, positions);
    expect(before.ratio).toBeLessThan(MAINTENANCE_MARGIN_RATIO);

    const plan = planMarginCall(cash, positions, FEES);
    expect(plan.orders).toHaveLength(1);
    const [order] = plan.orders;
    expect(order.type).toBe('cover');
    expect(Number.isInteger(order.quantity)).toBe(true);
    expect(order.remaining).toBeGreaterThan(0);

    const after = marginStatus(plan.cashAfter, [short('a', order.remaining, 100, 140)]);
    expect(after.ratio).toBeGreaterThanOrEqual(SHORT_MARGIN_RATIO);
    // Un titre de moins et la marge n'y serait pas : rachat minimal
    const oneLess = marginStatus(plan.cashAfter + 140 * (1 + FEES / 100), [short('a', order.remaining + 1, 100, 140)]);
    expect(oneLess.ratio).toBeLessThan(SHORT_MARGIN_RATIO);
    // Seuls les frais sont perdus par le rachat
    expect(after.equity).toBeCloseTo(before.equity - order.fee, 6);
  });

  it('rachète d’abord le découvert le plus perdant', () => {
    const cash = 10_000 + 10_000 + 10_000;
    const plan = planMarginCall(cash, [short('calme', 100, 100, 101), short('fou', 100, 100, 180)], FEES);
    expect(plan.orders[0].symbol).toBe('FOU');
  });

  it('valeur nette négative : tout est soldé, découverts puis titres', () => {
    // 10 000 € → short de 10 000 €, achat de 9 975 € de titres, puis le short fait +120 %
    const cash = 10_000 + 10_000 * (1 - FEES / 100) - 9_975;
    const positions = [short('a', 100, 100, 220), long('b', 99.75, 80)];
    const status = marginStatus(cash, positions);
    expect(status.equity).toBeLessThan(0);

    const plan = planMarginCall(cash, positions, FEES);
    expect(plan.orders.map((o) => [o.type, o.remaining])).toEqual([
      ['cover', 0],
      ['sell', 0],
    ]);
    expect(plan.cashAfter).toBeLessThan(0);
  });

  it('vend des titres si le cash ne suffit pas à payer les rachats', () => {
    // Le produit du short a servi à acheter des titres
    const cash = 10_000 + 10_000 * (1 - FEES / 100) - 15_000;
    const positions = [short('a', 100, 100, 175), long('b', 150, 100)];
    expect(marginStatus(cash, positions).ratio).toBeLessThan(MAINTENANCE_MARGIN_RATIO);

    const plan = planMarginCall(cash, positions, FEES);
    expect(plan.orders.some((o) => o.type === 'sell')).toBe(true);
    expect(plan.cashAfter).toBeGreaterThanOrEqual(0);
    // On ne vend que le nécessaire
    const sell = plan.orders.find((o) => o.type === 'sell')!;
    expect(plan.cashAfter).toBeLessThan(100 * (1 - FEES / 100));
    expect(sell.remaining).toBeGreaterThan(0);
  });

  it('laisse en place une position sans cours', () => {
    const cash = cashAfterShort(199, 100);
    const plan = planMarginCall(cash, [short('a', 199, 100, 160), short('suspendu', 10, 50, null)], FEES);
    expect(plan.orders.every((o) => o.symbol !== 'SUSPENDU')).toBe(true);
  });

  it('garde les quantités fractionnaires (crypto) au plus juste', () => {
    const cash = 10_000 + 2.5 * 4_000 * (1 - FEES / 100);
    const positions = [short('btc', 2.5, 4_000, 7_000)];
    const plan = planMarginCall(cash, positions, FEES);
    expect(plan.orders).toHaveLength(1);
    expect(Number.isInteger(plan.orders[0].quantity)).toBe(false);
    const after = marginStatus(plan.cashAfter, [short('btc', plan.orders[0].remaining, 4_000, 7_000)]);
    expect(after.ratio).toBeGreaterThanOrEqual(SHORT_MARGIN_RATIO - 1e-6);
  });
});

describe('seuils affichés', () => {
  // 10 000 € de valeur nette, short de 200 titres à 100 €
  const book = { equity: 10_000, liability: 20_000 };

  it('cours d’appel de marge : la marge y vaut exactement le seuil', () => {
    const price = marginCallPrice(book, 200, 100)!;
    expect(price).toBeCloseTo(30_000 / 260, 6); // ≈ 115,38 €
    const status = marginStatus(30_000, [short('a', 200, 100, price)]);
    expect(status.ratio).toBeCloseTo(MAINTENANCE_MARGIN_RATIO, 9);
  });

  it('cours d’appel de marge avec un autre découvert', () => {
    const positions = [short('a', 100, 100, 100), short('b', 50, 200, 200)];
    const cash = 40_000;
    const status = marginStatus(cash, positions);
    const price = marginCallPrice({ equity: status.equity, liability: status.liability }, 100, 100)!;
    const at = marginStatus(cash, [short('a', 100, 100, price), short('b', 50, 200, 200)]);
    expect(at.ratio).toBeCloseTo(MAINTENANCE_MARGIN_RATIO, 9);
  });

  it('hausse tolérée de tous les découverts : ≈ +15,4 % au levier maximal', () => {
    const rise = toleratedRise(book)!;
    expect(rise).toBeCloseTo(4_000 / 26_000, 9);
    const status = marginStatus(30_000, [short('a', 200, 100, 100 * (1 + rise))]);
    expect(status.ratio).toBeCloseTo(MAINTENANCE_MARGIN_RATIO, 9);
    expect(toleratedRise({ equity: 0, liability: 0 })).toBeNull();
  });
});
