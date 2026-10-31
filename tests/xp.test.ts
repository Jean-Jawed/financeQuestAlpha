import { describe, expect, it } from 'vitest';
import {
  achievementXp,
  gameEndXp,
  groupPlacementXp,
  levelInfo,
  levelStep,
  momentsCrossed,
  streakBonus,
  targetReachedXp,
  titleFor,
  xpForLevel,
} from '@/lib/xp/rules';

describe('courbe de niveaux (docs/reviewOct2026/phase3/01_xp.md)', () => {
  it('reprend les étapes et cumuls du rapport', () => {
    expect(levelStep(1)).toBe(100);
    expect(levelStep(10)).toBe(1190);
    expect(xpForLevel(5)).toBe(890);
    expect(xpForLevel(10)).toBe(4600);
    expect(xpForLevel(20)).toBe(24770);
    expect(xpForLevel(50)).toBe(234500);
  });

  it('situe un total d’XP dans son niveau', () => {
    expect(levelInfo(0)).toMatchObject({ level: 1, intoLevel: 0, levelSize: 100, stars: 0 });
    expect(levelInfo(99).level).toBe(1);
    expect(levelInfo(100)).toMatchObject({ level: 2, intoLevel: 0, levelSize: 170 });
    expect(levelInfo(4600).level).toBe(10);
  });

  it('donne des étoiles au-delà du niveau 50', () => {
    expect(levelInfo(234500 + 31_000)).toMatchObject({ level: 50, stars: 2, intoLevel: 1000 });
  });

  it('change de titre tous les 5 niveaux', () => {
    expect(titleFor(1)).toBe('badaud');
    expect(titleFor(4)).toBe('badaud');
    expect(titleFor(5)).toBe('coursier');
    expect(titleFor(30)).toBe('agent');
    expect(titleFor(50)).toBe('argentier');
  });
});

describe('fin de partie', () => {
  const base = { sessionsPlayed: 60, finalReturn: 0, benchmarkReturn: null, scenario: 'libre', crisis: false, rank: null };

  it('ne rapporte rien à l’abandon, 20 XP à la faillite', () => {
    expect(gameEndXp({ ...base, endReason: 'abandoned' }).parts).toEqual([]);
    expect(gameEndXp({ ...base, endReason: 'bankrupt' }).parts).toEqual([{ kind: 'end', xp: 20 }]);
  });

  it('cumule fin, paliers de rendement, indice battu et rang', () => {
    const { parts, coefficient } = gameEndXp({
      ...base,
      endReason: 'retired',
      finalReturn: 60,
      benchmarkReturn: 10,
      rank: 2,
    });
    const byKind = Object.fromEntries(parts.map((part) => [part.kind, part.xp]));
    expect(byKind.end).toBe(80); // 50 + 0,5 × 60
    expect(byKind['perf-positive'] + byKind['perf-return-10'] + byKind['perf-return-25'] + byKind['perf-return-50']).toBe(300);
    expect(byKind['perf-return-100']).toBeUndefined();
    expect(byKind['perf-benchmark']).toBe(160); // 60 + 2 × 50
    expect(byKind.rank).toBe(200);
    expect(coefficient).toBe(1);
  });

  it('applique le coefficient du scénario et du marathon de crise', () => {
    expect(gameEndXp({ ...base, endReason: 'retired', scenario: 'ours' }).coefficient).toBe(1.5);
    expect(gameEndXp({ ...base, endReason: 'group_end', crisis: true }).coefficient).toBe(1.2);
    expect(gameEndXp({ ...base, endReason: 'data_end' }).parts.map((part) => part.kind)).toContain('end-data');
  });
});

describe('groupes, succès, séries, moments', () => {
  it('multiplie la place par la taille du groupe', () => {
    expect(groupPlacementXp(1, 2)).toBe(200);
    expect(groupPlacementXp(1, 12)).toBe(500);
    expect(groupPlacementXp(4, 4)).toBe(52);
  });

  it('récompense la vitesse en course', () => {
    expect(targetReachedXp(30, 250)).toBe(250);
    expect(targetReachedXp(240, 250)).toBe(120);
  });

  it('verse les succès à 1,5 puis 0,4 fois leurs points', () => {
    expect(achievementXp(10, true)).toBe(15);
    expect(achievementXp(150, false)).toBe(60);
  });

  it('donne les bonus de série aux bons jours', () => {
    expect(streakBonus(2)).toBe(0);
    expect(streakBonus(3)).toBe(30);
    expect(streakBonus(30)).toBe(400);
    expect(streakBonus(60)).toBe(400);
    expect(streakBonus(45)).toBe(0);
  });

  it('repère les moments historiques traversés, week-ends compris', () => {
    expect(momentsCrossed('2017-12-15', '2017-12-18').map((m) => m.id)).toEqual(['bitcoin-2017']);
    expect(momentsCrossed('2020-03-16', '2020-03-17')).toEqual([]);
    expect(momentsCrossed('2020-03-13', '2020-03-16').map((m) => m.id)).toEqual(['covid-16-mars']);
  });
});
