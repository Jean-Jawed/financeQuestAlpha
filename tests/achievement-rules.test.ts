/**
 * Tests des règles d'achievements (lib/game/achievement-rules.ts)
 * Les critères sont ceux réellement présents en base (table achievements)
 */

import { describe, expect, it } from 'vitest';
import {
  daysBetween,
  evaluateAchievement,
  replayTransactions,
  type AchievementContext,
  type RuleTransaction,
} from '@/lib/game/achievement-rules';

function context(overrides: Partial<AchievementContext> = {}): AchievementContext {
  return {
    startDate: '2023-03-01',
    currentDate: '2023-03-01',
    transactions: [],
    longValueBySymbol: new Map(),
    assetTypeBySymbol: new Map(),
    totalValue: 10_000,
    returnPercentage: 0,
    ...overrides,
  };
}

function evaluate(type: string, value: Record<string, unknown>, ctx: AchievementContext) {
  return evaluateAchievement(type, value, ctx, replayTransactions(ctx.transactions));
}

const tx = (
  type: RuleTransaction['type'],
  symbol: string,
  quantity: number,
  price: number,
  date = '2023-03-01'
): RuleTransaction => ({ type, symbol, quantity, price, date });

describe('daysBetween', () => {
  it('compte les jours calendaires, indépendamment du fuseau horaire', () => {
    expect(daysBetween('2023-03-01', '2023-03-31')).toBe(30);
    expect(daysBetween('2023-12-31', '2024-01-01')).toBe(1);
    expect(daysBetween('2024-03-30', '2024-04-01')).toBe(2); // passage à l'heure d'été
  });
});

describe('evaluateAchievement', () => {
  it('first_transaction et transaction_count', () => {
    const ctx = context({ transactions: [tx('buy', 'AAPL', 1, 100), tx('sell', 'AAPL', 1, 110)] });
    expect(evaluate('first_transaction', {}, ctx)).toBe(true);
    expect(evaluate('transaction_count', { min_count: 2 }, ctx)).toBe(true);
    expect(evaluate('transaction_count', { min_count: 10 }, ctx)).toBe(false);
  });

  it('portfolio_value et return_percentage', () => {
    const ctx = context({ totalValue: 12_500, returnPercentage: 25 });
    expect(evaluate('portfolio_value', { min_value: 12_000 }, ctx)).toBe(true);
    expect(evaluate('portfolio_value', { min_value: 15_000 }, ctx)).toBe(false);
    expect(evaluate('return_percentage', { min_return: 20 }, ctx)).toBe(true);
    expect(evaluate('return_percentage', { min_return: 50 }, ctx)).toBe(false);
  });

  it('asset_count compte les positions long distinctes', () => {
    const longValueBySymbol = new Map(['A', 'B', 'C', 'D', 'E'].map((s) => [s, 100] as [string, number]));
    expect(evaluate('asset_count', { min_count: 5 }, context({ longValueBySymbol }))).toBe(true);
    expect(evaluate('asset_count', { min_count: 10 }, context({ longValueBySymbol }))).toBe(false);
  });

  it('specific_trade par type de transaction (« Premier Short »)', () => {
    const ctx = context({ transactions: [tx('short', 'TSLA', 1, 200)] });
    expect(evaluate('specific_trade', { min_count: 1, transaction_type: 'short' }, ctx)).toBe(true);
    expect(evaluate('specific_trade', { min_count: 1, transaction_type: 'sell' }, ctx)).toBe(false);
  });

  it('BUG CORRIGÉ : specific_trade par catégorie (« Crypto Curieux ») fonctionne', () => {
    const ctx = context({
      transactions: [tx('buy', 'BTC', 0.1, 30_000), tx('buy', 'AAPL', 1, 150)],
      assetTypeBySymbol: new Map([
        ['BTC', 'crypto'],
        ['AAPL', 'stock'],
      ]),
    });
    expect(evaluate('specific_trade', { min_count: 1, asset_type: 'crypto' }, ctx)).toBe(true);
    expect(evaluate('specific_trade', { min_count: 3, asset_type: 'crypto' }, ctx)).toBe(false);
  });

  it('specific_trade par catégorie : revendre ne fait pas perdre le badge', () => {
    const ctx = context({
      transactions: [tx('buy', 'BTC', 0.1, 30_000), tx('sell', 'BTC', 0.1, 31_000)],
      assetTypeBySymbol: new Map([['BTC', 'crypto']]),
    });
    expect(evaluate('specific_trade', { min_count: 1, asset_type: 'crypto' }, ctx)).toBe(true);
  });

  it('days_played', () => {
    const ctx = context({ startDate: '2023-03-01', currentDate: '2023-03-08' });
    expect(evaluate('days_played', { min_days: 7 }, ctx)).toBe(true);
    expect(evaluate('days_played', { min_days: 30 }, ctx)).toBe(false);
  });

  it('hold_duration : depuis l\'ouverture de la position, en date de jeu', () => {
    const ctx = context({
      currentDate: '2023-04-15',
      transactions: [tx('buy', 'AAPL', 1, 150, '2023-03-01'), tx('buy', 'MSFT', 1, 250, '2023-04-10')],
    });
    expect(evaluate('hold_duration', { min_days: 30 }, ctx)).toBe(true);
    expect(evaluate('hold_duration', { min_days: 90 }, ctx)).toBe(false);
  });

  it('hold_duration : une position revendue puis rachetée repart de zéro', () => {
    const ctx = context({
      currentDate: '2023-04-15',
      transactions: [
        tx('buy', 'AAPL', 1, 150, '2023-01-01'),
        tx('sell', 'AAPL', 1, 160, '2023-04-01'),
        tx('buy', 'AAPL', 1, 155, '2023-04-10'),
      ],
    });
    expect(evaluate('hold_duration', { min_days: 30 }, ctx)).toBe(false);
  });

  it('profitable_trades : ventes avec plus-value ≥ seuil, sur le coût moyen', () => {
    const transactions = [
      tx('buy', 'A', 2, 100),
      tx('sell', 'A', 1, 130), // +30 %
      tx('buy', 'B', 1, 100),
      tx('sell', 'B', 1, 110), // +10 %
    ];
    const ctx = context({ transactions });
    expect(evaluate('profitable_trades', { min_count: 1, min_profit: 20 }, ctx)).toBe(true);
    expect(evaluate('profitable_trades', { min_count: 2, min_profit: 20 }, ctx)).toBe(false);
  });

  it('short_profit : couvertures gagnantes uniquement', () => {
    const ctx = context({
      transactions: [
        tx('short', 'TSLA', 2, 200),
        tx('cover', 'TSLA', 1, 150), // gagnant
        tx('cover', 'TSLA', 1, 250), // perdant
      ],
    });
    expect(evaluate('short_profit', { min_count: 1 }, ctx)).toBe(true);
    expect(evaluate('short_profit', { min_count: 2 }, ctx)).toBe(false);
  });

  it('sector_focus crypto : 100 % du portefeuille long en crypto', () => {
    const assetTypeBySymbol = new Map([
      ['BTC', 'crypto'],
      ['ETH', 'crypto'],
      ['AAPL', 'stock'],
    ]);
    const allCrypto = context({
      assetTypeBySymbol,
      longValueBySymbol: new Map([
        ['BTC', 500],
        ['ETH', 300],
      ]),
    });
    const mixed = context({
      assetTypeBySymbol,
      longValueBySymbol: new Map([
        ['BTC', 500],
        ['AAPL', 300],
      ]),
    });
    expect(evaluate('sector_focus', { sector: 'crypto', min_percentage: 100 }, allCrypto)).toBe(true);
    expect(evaluate('sector_focus', { sector: 'crypto', min_percentage: 100 }, mixed)).toBe(false);
    expect(evaluate('sector_focus', { sector: 'tech', min_percentage: 100 }, allCrypto)).toBe(false);
  });

  it('critères non implémentés : jamais débloqués', () => {
    const ctx = context({ returnPercentage: 1000, totalValue: 1e9 });
    expect(evaluate('comeback', { min_loss: -50, recovery: true }, ctx)).toBe(false);
    expect(evaluate('swing_trade', { min_count: 5 }, ctx)).toBe(false);
  });
});
