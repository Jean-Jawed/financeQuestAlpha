/**
 * Tests du moteur de valorisation (lib/game/portfolio-math.ts)
 * Scénarios rejoués comme le feraient les routes de trade, sans base de données
 */

import { describe, expect, it } from 'vitest';
import {
  calculateTransactionPreview,
  checkShortMargin,
  valuePortfolio,
  type PositionInput,
} from '@/lib/game/portfolio-math';

const INITIAL = 10_000;
const FEES = 0.25; // %

/** Simule une partie : cash + positions, avec les mêmes règles que les routes */
function simulate() {
  let cash = INITIAL;
  const positions = new Map<string, PositionInput>();
  const key = (symbol: string, isShort: boolean) => `${symbol}:${isShort}`;

  function open(symbol: string, quantity: number, price: number, isShort: boolean) {
    const preview = calculateTransactionPreview(isShort ? 'short' : 'buy', quantity, price, FEES);
    cash += preview.balanceChange;
    const existing = positions.get(key(symbol, isShort));
    if (existing) {
      const total = existing.quantity + quantity;
      existing.averageCost = (existing.quantity * existing.averageCost + quantity * price) / total;
      existing.quantity = total;
    } else {
      positions.set(key(symbol, isShort), { quantity, averageCost: price, isShort, price });
    }
  }

  function close(symbol: string, quantity: number, price: number, isShort: boolean) {
    const preview = calculateTransactionPreview(isShort ? 'cover' : 'sell', quantity, price, FEES);
    cash += preview.balanceChange;
    const position = positions.get(key(symbol, isShort))!;
    position.quantity -= quantity;
    if (position.quantity <= 1e-8) positions.delete(key(symbol, isShort));
  }

  function setPrice(symbol: string, price: number) {
    for (const [positionKey, position] of positions) {
      if (positionKey.startsWith(`${symbol}:`)) position.price = price;
    }
  }

  function value() {
    return valuePortfolio(cash, INITIAL, [...positions.values()]);
  }

  return { open, close, setPrice, value };
}

describe('valuePortfolio', () => {
  it('portefeuille vide : valeur = cash, rendement nul', () => {
    const p = valuePortfolio(INITIAL, INITIAL, []);
    expect(p.totalValue).toBe(INITIAL);
    expect(p.availableCash).toBe(INITIAL);
    expect(p.returnPercentage).toBe(0);
    expect(p.score).toBe(0);
  });

  it('achat : seule la perte des frais réduit la valeur', () => {
    const game = simulate();
    game.open('AAPL', 10, 100, false);
    const p = game.value();
    expect(p.totalValue).toBeCloseTo(INITIAL - 2.5, 6);
    expect(p.portfolioValueLong).toBeCloseTo(1000, 6);
  });

  it('BUG CORRIGÉ : ouvrir un short ne gonfle plus la valeur du portefeuille', () => {
    const game = simulate();
    game.open('GOOGL', 10, 100, true);
    const p = game.value();

    // Ancienne formule : cash (10 997,50) + P&L (0) = +10 % fictifs
    expect(p.currentBalance).toBeCloseTo(10_997.5, 6);
    // Nouvelle formule : cash − dette = 9 997,50 (seuls les frais sont perdus)
    expect(p.shortLiability).toBeCloseTo(1000, 6);
    expect(p.totalValue).toBeCloseTo(9_997.5, 6);
    expect(p.returnPercentage).toBeLessThan(0);
  });

  it('le produit du short est bloqué en garantie (pas de cash disponible en plus)', () => {
    const game = simulate();
    game.open('GOOGL', 10, 100, true);
    expect(game.value().availableCash).toBeCloseTo(INITIAL - 2.5, 6);
  });

  it('short gagnant : la baisse du titre augmente la valeur', () => {
    const game = simulate();
    game.open('GOOGL', 10, 100, true);
    game.setPrice('GOOGL', 80);
    const p = game.value();
    expect(p.shortPositionsPnl).toBeCloseTo(200, 6);
    expect(p.totalValue).toBeCloseTo(INITIAL - 2.5 + 200, 6);
  });

  it('short perdant : la hausse du titre diminue la valeur', () => {
    const game = simulate();
    game.open('GOOGL', 10, 100, true);
    game.setPrice('GOOGL', 130);
    expect(game.value().totalValue).toBeCloseTo(INITIAL - 2.5 - 300, 6);
  });

  it('cycle short → cover : la valeur avant et après la couverture est cohérente', () => {
    const game = simulate();
    game.open('GOOGL', 10, 100, true);
    game.setPrice('GOOGL', 90);
    const before = game.value().totalValue;
    game.close('GOOGL', 10, 90, true);
    const after = game.value();

    // Couvrir ne change la valeur que des frais de rachat (900 × 0,25 %)
    expect(after.totalValue).toBeCloseTo(before - 2.25, 6);
    expect(after.shortLiability).toBe(0);
    expect(after.availableCash).toBeCloseTo(after.currentBalance, 6);
  });

  it('les sommes affichées tombent juste : dispo + longs + P&L shorts = total', () => {
    const game = simulate();
    game.open('AAPL', 5, 200, false);
    game.open('TSLA', 4, 250, true);
    game.setPrice('AAPL', 210);
    game.setPrice('TSLA', 240);
    const p = game.value();
    expect(p.availableCash + p.portfolioValueLong + p.shortPositionsPnl).toBeCloseTo(p.totalValue, 6);
  });

  it('prix indisponible : long à 0, short neutre (jamais de gain fictif)', () => {
    const p = valuePortfolio(INITIAL, INITIAL, [
      { quantity: 10, averageCost: 50, isShort: false, price: null },
      { quantity: 10, averageCost: 50, isShort: true, price: 0 },
    ]);
    expect(p.portfolioValueLong).toBe(0);
    expect(p.shortPositionsPnl).toBe(0);
    expect(p.shortLiability).toBe(500);
  });
});

describe('checkShortMargin', () => {
  it('accepte un short dans la limite de 2 × la valeur nette', () => {
    const portfolio = { totalValue: 10_000, shortLiability: 0 };
    expect(checkShortMargin(portfolio, 19_000, 47.5)).toBeNull();
  });

  it('refuse un short au-delà de 2 × la valeur nette', () => {
    const portfolio = { totalValue: 10_000, shortLiability: 0 };
    const shortfall = checkShortMargin(portfolio, 21_000, 52.5);
    expect(shortfall).not.toBeNull();
    expect(shortfall!.required).toBeCloseTo(10_500, 6);
  });

  it('BUG CORRIGÉ : enchaîner les shorts ne donne plus un levier illimité', () => {
    const game = simulate();
    let accepted = 0;

    // Tenter 10 shorts successifs de 9 000 € chacun
    for (let i = 0; i < 10; i++) {
      const notional = 9_000;
      const fee = notional * (FEES / 100);
      if (checkShortMargin(game.value(), notional, fee) === null) {
        game.open(`S${i}`, 90, 100, true);
        accepted++;
      }
    }

    // Avant : chaque short gonflait le cash, donc la marge, sans fin
    // Après : au plus ~2 × la valeur nette (20 000 €) de dette
    expect(accepted).toBe(2);
    expect(game.value().shortLiability).toBeLessThanOrEqual(2 * INITIAL);
  });
});

describe('calculateTransactionPreview', () => {
  it('achat : débite montant + frais', () => {
    const preview = calculateTransactionPreview('buy', 10, 100, FEES);
    expect(preview.total).toBeCloseTo(1002.5, 6);
    expect(preview.balanceChange).toBeCloseTo(-1002.5, 6);
  });

  it('vente : crédite montant − frais', () => {
    const preview = calculateTransactionPreview('sell', 10, 100, FEES);
    expect(preview.balanceChange).toBeCloseTo(997.5, 6);
  });
});
