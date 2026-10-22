/**
 * Tests de la conversion de devises (lib/game/currency.ts)
 * Taux réels du 2023-06-15 (base prix), ramenés au dollar
 */

import { describe, expect, it } from 'vitest';
import {
  GAME_CURRENCIES,
  STARTING_CAPITAL,
  fxRate,
  isGameCurrency,
  type UsdRates,
} from '@/lib/game/currency';

const RATES: UsdRates = {
  USD: 1,
  EUR: 1 / 1.0838, // EURUSD
  GBP: 1 / 1.2685, // GBPUSD
  JPY: 141.08, // USDJPY
  CHF: 0.8977, // USDCHF
};

describe('fxRate', () => {
  it('même devise : taux 1, même sans table', () => {
    expect(fxRate('EUR', 'EUR', {})).toBe(1);
  });

  it('dollar → euro : 1 / EURUSD', () => {
    expect(fxRate('USD', 'EUR', RATES)).toBeCloseTo(1 / 1.0838, 10);
  });

  it('croisement par le dollar : yen → euro', () => {
    // 1 JPY = 1/141.08 USD = 1/(141.08 × 1.0838) EUR
    expect(fxRate('JPY', 'EUR', RATES)).toBeCloseTo(1 / (141.08 * 1.0838), 12);
  });

  it('aller-retour sans perte', () => {
    const there = fxRate('GBP', 'CHF', RATES)!;
    const back = fxRate('CHF', 'GBP', RATES)!;
    expect(there * back).toBeCloseTo(1, 12);
  });

  it('devise inconnue : null (le cours est alors ignoré, jamais faux)', () => {
    expect(fxRate('CNY', 'EUR', RATES)).toBeNull();
    expect(fxRate('EUR', 'XXX', RATES)).toBeNull();
  });

  it('une action Apple à 186 $ vaut ~171,6 € ce jour-là', () => {
    expect(186 * fxRate('USD', 'EUR', RATES)!).toBeCloseTo(171.62, 2);
  });
});

describe('devises de jeu', () => {
  it('chaque devise de jeu a un capital de départ', () => {
    for (const currency of GAME_CURRENCIES) {
      expect(STARTING_CAPITAL[currency]).toBeGreaterThan(0);
    }
  });

  it('isGameCurrency refuse ce qui n’est pas proposé', () => {
    expect(isGameCurrency('EUR')).toBe(true);
    expect(isGameCurrency('CNY')).toBe(false);
    expect(isGameCurrency(42)).toBe(false);
  });
});
