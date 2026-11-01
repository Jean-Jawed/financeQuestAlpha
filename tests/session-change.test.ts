import { describe, expect, it } from 'vitest';
import { portfolioSessionChange, positionSessionChange, sessionExtremes } from '@/lib/game/session-change';
import type { HoldingWithValue } from '@/types/game';

describe('positionSessionChange', () => {
  it('applique le mouvement du cours à la quantité détenue avant la séance', () => {
    // 110 aujourd'hui, 100 hier ; 5 titres → +50
    expect(positionSessionChange({ quantity: 5, isShort: false, price: 110, previousPrice: 100, netTodayQuantity: 0 })).toBeCloseTo(50);
  });

  it("ignore les titres achetés aujourd'hui", () => {
    expect(positionSessionChange({ quantity: 5, isShort: false, price: 110, previousPrice: 100, netTodayQuantity: 3 })).toBeCloseTo(20);
    expect(positionSessionChange({ quantity: 5, isShort: false, price: 110, previousPrice: 100, netTodayQuantity: 5 })).toBe(0);
  });

  it("compte les titres vendus aujourd'hui, qui ont bougé avant la vente", () => {
    expect(positionSessionChange({ quantity: 2, isShort: false, price: 110, previousPrice: 100, netTodayQuantity: -3 })).toBeCloseTo(50);
  });

  it('inverse le signe pour un découvert', () => {
    expect(positionSessionChange({ quantity: 5, isShort: true, price: 110, previousPrice: 100, netTodayQuantity: 0 })).toBeCloseTo(-50);
  });

  it('renvoie null sans variation connue', () => {
    expect(positionSessionChange({ quantity: 5, isShort: false, price: 110, previousPrice: null, netTodayQuantity: 0 })).toBeNull();
  });
});

const holding = (symbol: string, dayChange: number | null, openedToday = false) =>
  ({ symbol, dayChange, openedToday }) as HoldingWithValue;

describe('portfolioSessionChange', () => {
  it("rapporte le gain à la valeur d'ouverture de la séance", () => {
    const result = portfolioSessionChange([holding('A', 60), holding('B', -10), holding('C', null)], 10_050);
    expect(result?.change).toBeCloseTo(50);
    expect(result?.percent).toBeCloseTo(0.5);
  });

  it('renvoie null sans position cotée', () => {
    expect(portfolioSessionChange([holding('A', null)], 10_000)).toBeNull();
  });
});

describe('sessionExtremes', () => {
  it('donne la meilleure et la pire position, hors positions du jour', () => {
    const { best, worst } = sessionExtremes([holding('A', 30), holding('B', -12), holding('C', 90, true), holding('D', 5)]);
    expect(best?.symbol).toBe('A');
    expect(worst?.symbol).toBe('B');
  });

  it('pas de pire sans perte', () => {
    expect(sessionExtremes([holding('A', 30)]).worst).toBeNull();
  });
});
