import { describe, expect, it } from 'vitest';
import { addDays, presetDate, simulateFastForward, type SimPosition, type SimQuote } from '@/lib/game/fast-forward';
import { marginStatus, MAINTENANCE_MARGIN_RATIO } from '@/lib/game/margin-call';

const FEES = 0.25;
const DATES = ['2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-08'];

function quote(price: number): SimQuote {
  return { price, assetPrice: price, assetCurrency: 'EUR', fxRate: 1 };
}

/** Cours par date : un prix par séance pour chaque symbole */
function series(prices: Record<string, number[]>, dates = DATES) {
  return new Map(
    dates.map((date, index) => [date, new Map(Object.entries(prices).map(([symbol, list]) => [symbol, quote(list[index])]))])
  );
}

const long = (id: string, quantity: number, cost: number): SimPosition => ({ id, symbol: id.toUpperCase(), quantity, averageCost: cost, isShort: false });
const short = (id: string, quantity: number, cost: number): SimPosition => ({ id, symbol: id.toUpperCase(), quantity, averageCost: cost, isShort: true });

describe('simulateFastForward', () => {
  it('joue toutes les séances sans rien toucher aux positions acheteuses', () => {
    const result = simulateFastForward({
      cash: 5_000,
      initialBalance: 10_000,
      positions: [long('a', 50, 100)],
      dates: DATES,
      quotes: series({ A: [100, 102, 98, 110, 120] }),
      feeRate: FEES,
      sessionsPlayed: 3,
    });
    expect(result.sessions).toBe(5);
    expect(result.finalDate).toBe('2024-01-08');
    expect(result.stoppedBy).toBeNull();
    expect(result.cash).toBe(5_000);
    expect(result.positions).toEqual([long('a', 50, 100)]);
    expect(result.values.map((v) => v.totalValue)).toEqual([10_000, 10_100, 9_900, 10_500, 11_000]);
  });

  it('s’arrête à la séance d’un appel de marge, après les rachats d’office', () => {
    // 10 000 € de valeur nette, short de 200 titres à 100 € ; +20 % le 3e jour
    const result = simulateFastForward({
      cash: 30_000,
      initialBalance: 10_000,
      positions: [short('s', 200, 100)],
      dates: DATES,
      quotes: series({ S: [100, 105, 120, 125, 130] }),
      feeRate: FEES,
      sessionsPlayed: 0,
    });
    expect(result.stoppedBy).toBe('margin_call');
    expect(result.finalDate).toBe('2024-01-04');
    expect(result.sessions).toBe(3);
    expect(result.forcedOrders.length).toBeGreaterThan(0);
    expect(result.forcedOrders.every((order) => order.date === '2024-01-04' && order.type === 'cover')).toBe(true);
    // Marge rétablie après les rachats
    const after = marginStatus(result.cash, result.positions.map((p) => ({ ...p, price: 120 })));
    expect(after.ratio!).toBeGreaterThan(MAINTENANCE_MARGIN_RATIO);
  });

  it('appel de marge sur la dernière séance visée : la date est atteinte', () => {
    const result = simulateFastForward({
      cash: 30_000,
      initialBalance: 10_000,
      positions: [short('s', 200, 100)],
      dates: DATES.slice(0, 3),
      quotes: series({ S: [100, 105, 120] }, DATES.slice(0, 3)),
      feeRate: FEES,
      sessionsPlayed: 0,
    });
    expect(result.stoppedBy).toBeNull();
    expect(result.forcedOrders.length).toBeGreaterThan(0);
    expect(result.finalDate).toBe('2024-01-04');
  });

  it('faillite : tout est soldé, l’avance s’arrête', () => {
    // Le titre shorté triple : la valeur nette devient négative
    const result = simulateFastForward({
      cash: 30_000,
      initialBalance: 10_000,
      positions: [short('s', 200, 100)],
      dates: DATES,
      quotes: series({ S: [100, 300, 300, 300, 300] }),
      feeRate: FEES,
      sessionsPlayed: 0,
    });
    expect(result.stoppedBy).toBe('bankrupt');
    expect(result.finalDate).toBe('2024-01-03');
    expect(result.positions).toEqual([]);
    expect(result.closedIds).toEqual(['s']);
  });

  it('course de groupe : s’arrête dès l’objectif atteint', () => {
    const result = simulateFastForward({
      cash: 0,
      initialBalance: 10_000,
      positions: [long('a', 100, 100)],
      dates: DATES,
      quotes: series({ A: [100, 105, 116, 120, 125] }),
      feeRate: FEES,
      sessionsPlayed: 10,
      group: { mode: 'course', sessionsTarget: 250, targetReturn: 15 },
    });
    expect(result.stoppedBy).toBe('group');
    expect(result.finalDate).toBe('2024-01-04');
  });

  it('sprint de groupe : s’arrête au nombre de séances prévu', () => {
    const result = simulateFastForward({
      cash: 10_000,
      initialBalance: 10_000,
      positions: [],
      dates: DATES,
      quotes: new Map(),
      feeRate: FEES,
      sessionsPlayed: 58,
      group: { mode: 'sprint', sessionsTarget: 60, targetReturn: null },
    });
    expect(result.stoppedBy).toBe('group');
    expect(result.sessions).toBe(2);
  });

  it('actif sans cours un jour : position laissée en place, sans appel de marge', () => {
    const quotes = series({ S: [100, 100, 100, 100, 100] });
    quotes.get('2024-01-03')!.delete('S');
    const result = simulateFastForward({
      cash: 30_000,
      initialBalance: 10_000,
      positions: [short('s', 200, 100)],
      dates: DATES,
      quotes,
      feeRate: FEES,
      sessionsPlayed: 0,
    });
    expect(result.stoppedBy).toBeNull();
    expect(result.positions).toEqual([short('s', 200, 100)]);
  });
});

describe('presetDate', () => {
  const calendar = ['2024-01-02', '2024-01-03', '2024-01-05', '2024-01-08', '2024-01-09', '2024-02-01', '2024-12-31'];

  it('dernière séance au plus tard N jours après la date en jeu', () => {
    // 1er janvier + 7 jours = 8 janvier, séance ce jour-là
    expect(presetDate('2024-01-01', calendar, 7)).toBe('2024-01-08');
    // 3 janvier + 7 = 10 janvier : dernière séance le 9
    expect(presetDate('2024-01-03', calendar, 7)).toBe('2024-01-09');
  });

  it('au-delà de la dernière séance possible : indisponible', () => {
    expect(presetDate('2024-01-02', calendar, 365)).toBeNull();
  });

  it('addDays traverse mois et années', () => {
    expect(addDays('2024-12-30', 3)).toBe('2025-01-02');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
  });
});
