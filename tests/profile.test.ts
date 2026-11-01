import { describe, expect, it } from 'vitest';
import {
  cleanName,
  containsBannedWord,
  initials,
  isCountryCode,
  mottoIssue,
  nameIssue,
  nextNameChange,
} from '@/lib/profile/rules';
import { AVATARS, getAvatar, isAvatarId, randomAvatarId } from '@/lib/profile/avatars';

describe('pseudo', () => {
  it('nettoie les espaces', () => {
    expect(cleanName('  Zoé    la   Trader ')).toBe('Zoé la Trader');
  });

  it('accepte lettres accentuées, chiffres et . _ -', () => {
    expect(nameIssue('Zoé_la-Trader.75')).toBeNull();
    expect(nameIssue('Jawed Tahir')).toBeNull();
  });

  it('refuse les longueurs hors limites et les caractères spéciaux', () => {
    expect(nameIssue('ab')).toBe('length');
    expect(nameIssue('a'.repeat(25))).toBe('length');
    expect(nameIssue('Zoé!')).toBe('chars');
    expect(nameIssue('._-')).toBe('chars');
  });

  it('refuse les noms réservés et les insultes, même déguisés', () => {
    expect(nameIssue('Admin du jeu')).toBe('banned');
    expect(nameIssue('PastFolio Team')).toBe('banned');
    expect(nameIssue('c0nnard')).toBe('banned');
    expect(nameIssue('gros pd')).toBe('banned');
  });

  it('ne refuse pas les mots innocents qui en contiennent un', () => {
    expect(containsBannedWord('Le député de la réputation')).toBe(false);
    expect(nameIssue('Supporter75')).toBeNull();
    expect(nameIssue('Ptdr la tg')).toBe('banned');
  });

  it('limite les changements à un tous les 30 jours, le premier étant libre', () => {
    const now = new Date('2026-11-01T12:00:00Z');
    expect(nextNameChange(null, now)).toBeNull();
    expect(nextNameChange('2026-10-20T12:00:00Z', now)?.toISOString()).toBe('2026-11-19T12:00:00.000Z');
    expect(nextNameChange('2026-09-01T12:00:00Z', now)).toBeNull();
  });
});

describe('devise et pays', () => {
  it('limite la devise à 80 caractères et filtre les insultes', () => {
    expect(mottoIssue('Acheter au son du canon')).toBeNull();
    expect(mottoIssue('x'.repeat(81))).toBe('length');
    expect(mottoIssue('fuck the market')).toBe('banned');
  });

  it('valide les codes pays', () => {
    expect(isCountryCode('FR')).toBe(true);
    expect(isCountryCode('fr')).toBe(false);
    expect(isCountryCode('XX')).toBe(false);
  });
});

describe('avatars', () => {
  it('a 108 avatars aux identifiants uniques et au format de la base', () => {
    expect(AVATARS).toHaveLength(108);
    expect(new Set(AVATARS.map((avatar) => avatar.id)).size).toBe(108);
    for (const avatar of AVATARS) expect(avatar.id).toMatch(/^[a-z0-9-]{3,60}$/);
  });

  it('reconnaît les identifiants et en tire un au hasard', () => {
    expect(isAvatarId('pixel-couronne')).toBe(true);
    expect(getAvatar('inconnu')).toBeNull();
    expect(randomAvatarId('pixel-couronne')).not.toBe('pixel-couronne');
  });

  it('donne des initiales de secours', () => {
    expect(initials('Jawed Tahir')).toBe('JT');
    expect(initials('Zoé')).toBe('ZO');
    expect(initials('la_trader')).toBe('LT');
  });
});
