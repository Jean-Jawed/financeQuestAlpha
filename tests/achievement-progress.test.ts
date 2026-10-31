import { describe, expect, it } from 'vitest';
import {
  achievementProgress,
  pickNearest,
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

const buy = (symbol: string, date = '2023-03-01'): RuleTransaction => ({ type: 'buy', symbol, quantity: 1, price: 10, date });

function progressOf(type: string, value: Record<string, unknown>, ctx: AchievementContext) {
  return achievementProgress(type, value, ctx, replayTransactions(ctx.transactions));
}

describe('progression vers un succès', () => {
  it('compte les ordres', () => {
    const ctx = context({ transactions: [buy('A'), buy('B'), buy('C')] });
    expect(progressOf('transaction_count', { min_count: 10 }, ctx)).toMatchObject({ current: 3, target: 10, ratio: 0.3 });
  });

  it('mesure le seuil de valeur sur le gain, pas sur la valeur brute', () => {
    const ctx = context({ totalValue: 11_000 });
    expect(progressOf('portfolio_value', { min_value: 12_000 }, ctx)).toMatchObject({ current: 11_000, target: 12_000, ratio: 0.5 });
  });

  it('ne descend pas sous zéro pour un rendement négatif', () => {
    expect(progressOf('return_percentage', { min_return: 10 }, context({ returnPercentage: -4 }))?.ratio).toBe(0);
  });

  it('mesure la plus longue détention', () => {
    const ctx = context({ currentDate: '2023-03-16', transactions: [buy('A', '2023-03-01')] });
    expect(progressOf('hold_duration', { min_days: 30 }, ctx)).toMatchObject({ current: 15, target: 30, unit: 'days' });
  });

  it('ignore les critères non mesurables', () => {
    expect(progressOf('perfect_timing', {}, context())).toBeNull();
    expect(progressOf('sector_focus', { sector: 'tech' }, context())).toBeNull();
  });
});

describe('le plus proche', () => {
  const candidate = (points: number, ratio: number) => ({
    achievement: { points },
    progress: { current: ratio, target: 1, ratio, unit: 'count' as const },
  });

  it('prend la plus forte progression, puis le moins de points', () => {
    expect(pickNearest([candidate(50, 0.4), candidate(20, 0.7), candidate(10, 0.7)])?.achievement.points).toBe(10);
  });

  it('écarte les succès déjà atteints', () => {
    expect(pickNearest([candidate(10, 1), candidate(30, 0.2)])?.achievement.points).toBe(30);
  });

  it('sans progression entamée, propose le plus facile', () => {
    expect(pickNearest([candidate(40, 0), candidate(15, 0)])?.achievement.points).toBe(15);
  });
});
