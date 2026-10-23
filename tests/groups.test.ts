import { describe, expect, it } from 'vitest';
import { compareStandings, groupEndReason, INVITE_ALPHABET, type StandingInput } from '@/lib/game/groups';

const standing = (overrides: Partial<StandingInput>): StandingInput => ({
  userId: 'u',
  totalValue: 10_000,
  reachedIn: null,
  eliminated: false,
  finishedAt: null,
  ...overrides,
});

describe('groupEndReason', () => {
  it('termine un sprint au nombre de séances', () => {
    const rules = { mode: 'sprint' as const, sessionsTarget: 60, targetReturn: null };
    expect(groupEndReason(rules, 59, 50)).toBeNull();
    expect(groupEndReason(rules, 60, -10)).toBe('group_end');
  });

  it('termine une course à l’objectif, avant le plafond', () => {
    const rules = { mode: 'course' as const, sessionsTarget: 250, targetReturn: 15 };
    expect(groupEndReason(rules, 12, 14.99)).toBeNull();
    expect(groupEndReason(rules, 12, 15)).toBe('target_reached');
    expect(groupEndReason(rules, 250, 3)).toBe('group_end');
  });
});

describe('compareStandings', () => {
  it('classe à la valeur hors course', () => {
    const list = [standing({ userId: 'a', totalValue: 9_000 }), standing({ userId: 'b', totalValue: 11_000 })];
    expect(list.sort((x, y) => compareStandings('sprint', x, y)).map((s) => s.userId)).toEqual(['b', 'a']);
  });

  it('place les éliminés après les joueurs en lice', () => {
    const list = [standing({ userId: 'out', totalValue: 20_000, eliminated: true }), standing({ userId: 'in', totalValue: 5_000 })];
    expect(list.sort((x, y) => compareStandings('elimination', x, y)).map((s) => s.userId)).toEqual(['in', 'out']);
  });

  it('en course, le moins de séances l’emporte, puis l’heure d’arrivée, puis la valeur', () => {
    const list = [
      standing({ userId: 'rich', totalValue: 11_400 }),
      standing({ userId: 'slow', totalValue: 12_000, reachedIn: 30, finishedAt: '2026-10-24T10:00:00Z' }),
      standing({ userId: 'late', totalValue: 11_600, reachedIn: 12, finishedAt: '2026-10-24T12:00:00Z' }),
      standing({ userId: 'fast', totalValue: 11_500, reachedIn: 12, finishedAt: '2026-10-24T09:00:00Z' }),
    ];
    expect(list.sort((x, y) => compareStandings('course', x, y)).map((s) => s.userId)).toEqual([
      'fast',
      'late',
      'slow',
      'rich',
    ]);
  });
});

describe('code d’invitation', () => {
  it('évite les caractères ambigus', () => {
    expect(INVITE_ALPHABET).not.toMatch(/[01IO]/);
  });
});
