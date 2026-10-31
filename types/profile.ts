/**
 * FINANCEQUEST - TYPES: profil du joueur (page profil, accueil après inscription)
 */

import type { GameCurrency } from '@/lib/game/currency';
import type { Locale } from '@/lib/i18n/config';
import type { ExperienceLevel } from '@/lib/profile/rules';

export interface ProfileView {
  id: string;
  email: string;
  name: string;
  avatarId: string | null;
  motto: string | null;
  country: string | null;
  experience: ExperienceLevel | null;
  preferredCurrency: GameCurrency | null;
  locale: Locale | null;
  profilePublic: boolean;
  onboardingDone: boolean;
  /** Prochain changement de pseudo possible (ISO), null : libre */
  nextNameChange: string | null;
  createdAt: string;
}

export interface CareerStats {
  games: number;
  completed: number;
  /** Succès différents débloqués, toutes parties confondues */
  achievements: number;
  groups: number;
  /** Meilleur rendement final par scénario (parties terminées hors abandon) */
  bestByScenario: Array<{ scenario: string; returnPercentage: number }>;
  xpTotal: number;
  /** Derniers gains d'XP, du plus récent au plus ancien */
  recentXp: Array<{ kind: string; xp: number; createdAt: string }>;
}

/** Champs modifiables (PATCH /api/profile) : seuls les champs présents changent */
export interface ProfilePatch {
  name?: string;
  avatarId?: string;
  motto?: string | null;
  country?: string | null;
  experience?: ExperienceLevel | null;
  preferredCurrency?: GameCurrency | null;
  locale?: Locale;
  profilePublic?: boolean;
  /** Écran d'accueil vu ou passé */
  onboardingDone?: true;
}
