/**
 * Tests des chiffres clés d'un actif (lib/market/price-stats.ts)
 */

import { describe, expect, it } from 'vitest';
import { computePriceStats, pctChange, type PricePoint } from '@/lib/market/price-stats';

/** Séances ouvrées consécutives à partir d'une date, avec des clôtures données */
function series(start: string, closes: number[]): PricePoint[] {
  const points: PricePoint[] = [];
  let day = Date.parse(`${start}T00:00:00Z`);
  for (const close of closes) {
    while ([0, 6].includes(new Date(day).getUTCDay())) day += 86_400_000;
    points.push({ date: new Date(day).toISOString().slice(0, 10), close, volume: 1000 });
    day += 86_400_000;
  }
  return points;
}

describe('pctChange', () => {
  it('calcule une variation en %', () => {
    expect(pctChange(100, 110)).toBeCloseTo(10);
    expect(pctChange(0, 110)).toBeNull();
    expect(pctChange(undefined, 110)).toBeNull();
  });
});

describe('computePriceStats', () => {
  it('donne séance, semaine, plus haut et plus bas', () => {
    const points = series('2023-06-01', [100, 102, 101, 104, 103, 105, 110]);
    const stats = computePriceStats(points)!;
    expect(stats.day).toBeCloseTo(((110 - 105) / 105) * 100);
    expect(stats.high).toBe(110);
    expect(stats.low).toBe(100);
    expect(stats.averageVolume).toBe(1000);
    // Historique trop court pour la volatilité
    expect(stats.volatility).toBeNull();
  });

  it('calcule la variation depuis le 1er janvier sur la clôture de l’année précédente', () => {
    const points = [
      { date: '2023-12-29', close: 200, volume: null },
      { date: '2024-01-02', close: 210, volume: null },
      { date: '2024-01-03', close: 220, volume: null },
    ];
    expect(computePriceStats(points)!.ytd).toBeCloseTo(10);
  });

  it('une série constante a une volatilité nulle', () => {
    const points = series('2023-01-02', Array.from({ length: 40 }, () => 50));
    expect(computePriceStats(points)!.volatility).toBe(0);
  });

  it('renvoie null sans historique', () => {
    expect(computePriceStats([])).toBeNull();
  });
});
