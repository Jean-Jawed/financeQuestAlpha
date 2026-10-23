/**
 * FINANCEQUEST - PARTIES DE GROUPE : RÈGLES
 * Modes, tempos, valeurs par défaut, fin de partie et classement
 * (fonctions pures, utilisables côté client)
 *
 * Une partie de groupe est un ensemble de parties individuelles aux réglages communs
 * (scénario, départ, devise, capital) : chaque joueur rejoint avec sa propre partie,
 * le moteur de jeu reste le même. Les concurrents ne voient de chacun que trois chiffres
 * (valeur du portefeuille, ordres passés, positions ouvertes), jamais au-delà de leur
 * propre date de jeu. Voir docs/reviewOct2026/phase2/09_groupes.md
 */

// ==========================================
// MODES ET TEMPOS
// ==========================================

/**
 * - sprint : meilleur rendement après N séances
 * - course : premier à +X %, au plus petit nombre de séances
 * - crise : sprint au départ d'un krach célèbre
 * - elimination : le dernier du classement sort toutes les K séances (synchro seulement)
 * - duel : sprint à deux
 */
export const GROUP_MODES = ['sprint', 'course', 'crise', 'elimination', 'duel'] as const;
export type GroupMode = (typeof GROUP_MODES)[number];

/** libre : chacun à son rythme ; synchro : la séance avance pour tous ensemble */
export const GROUP_TEMPOS = ['libre', 'synchro'] as const;
export type GroupTempo = (typeof GROUP_TEMPOS)[number];

export const GROUP_STATUSES = ['open', 'running', 'completed'] as const;
export type GroupStatus = (typeof GROUP_STATUSES)[number];

/** Modes réservés au tempo synchronisé (l'élimination suppose que tous avancent ensemble) */
export const SYNC_ONLY_MODES: readonly GroupMode[] = ['elimination'];

// ==========================================
// LIMITES ET VALEURS PAR DÉFAUT
// ==========================================

export const GROUP_LIMITS = {
  nameMin: 2,
  nameMax: 60,
  sessionsMin: 5,
  sessionsMax: 500,
  targetMin: 1,
  targetMax: 500,
  eliminationEveryMin: 1,
  eliminationEveryMax: 100,
  timeoutHoursMin: 1,
  timeoutHoursMax: 168,
  playersMax: 30,
  messageMax: 500,
} as const;

export const GROUP_DEFAULTS: Record<
  GroupMode,
  { sessions: number; targetReturn?: number; eliminationEvery?: number }
> = {
  sprint: { sessions: 60 },
  // Plafond de séances : la course s'arrête si personne n'atteint l'objectif
  course: { sessions: 250, targetReturn: 15 },
  crise: { sessions: 60 },
  elimination: { sessions: 60, eliminationEvery: 5 },
  duel: { sessions: 60 },
};

/** Délai par défaut avant qu'une séance synchronisée avance sans les retardataires */
export const DEFAULT_SYNC_TIMEOUT_HOURS = 24;

/** Délai minimum entre deux messages d'un même joueur */
export const MESSAGE_COOLDOWN_MS = 2000;

/** Départs de crise : la veille ou le jour d'un sommet, juste avant la chute */
export const CRISIS_PRESETS = [
  // Bitcoin à son sommet (19 141 $ le 17 décembre), puis −80 % en un an
  { id: 'bitcoin-2017', start: '2017-12-15' },
  // Le S&P 500 culmine le 20 septembre, puis perd près de 20 % jusqu'au 24 décembre
  { id: 'automne-2018', start: '2018-09-20' },
  // Sommet du 19 février, krach du Covid
  { id: 'covid-2020', start: '2020-02-19' },
  // Inflation et hausse des taux : l'année noire des actions et des obligations
  { id: 'inflation-2022', start: '2022-01-03' },
  // Faillite de Silicon Valley Bank, sauvetage de Credit Suisse
  { id: 'banques-2023', start: '2023-03-01' },
] as const;

export type CrisisPresetId = (typeof CRISIS_PRESETS)[number]['id'];

// ==========================================
// FIN DE PARTIE
// ==========================================

export interface GroupRules {
  mode: GroupMode;
  sessionsTarget: number;
  /** Course : rendement à atteindre, en % */
  targetReturn: number | null;
}

/**
 * La séance qui vient de passer termine-t-elle la partie du joueur ?
 * - course : objectif atteint (target_reached), ou plafond de séances (group_end)
 * - autres modes : nombre de séances atteint (group_end)
 * L'élimination se décide au niveau du groupe (lib/game/group-server.ts)
 */
export function groupEndReason(
  rules: GroupRules,
  sessionsPlayed: number,
  returnPercentage: number
): 'target_reached' | 'group_end' | null {
  if (rules.mode === 'course' && rules.targetReturn !== null && returnPercentage >= rules.targetReturn) {
    return 'target_reached';
  }
  return sessionsPlayed >= rules.sessionsTarget ? 'group_end' : null;
}

// ==========================================
// CLASSEMENT
// ==========================================

export interface StandingInput {
  userId: string;
  /** Valeur du portefeuille au plus tard à la date de celui qui regarde */
  totalValue: number;
  /** Course : objectif atteint, en combien de séances (null sinon) */
  reachedIn: number | null;
  eliminated: boolean;
  /** Départage d'une égalité de séances en course : heure réelle d'arrivée */
  finishedAt: string | null;
}

/**
 * Ordre du classement
 * - course : ceux qui ont atteint l'objectif d'abord, au moins de séances ; puis à la valeur
 * - autres modes : à la valeur
 * Les éliminés passent après les joueurs encore en lice
 */
export function compareStandings(mode: GroupMode, a: StandingInput, b: StandingInput): number {
  if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
  if (mode === 'course') {
    if ((a.reachedIn === null) !== (b.reachedIn === null)) return a.reachedIn === null ? 1 : -1;
    if (a.reachedIn !== null && b.reachedIn !== null && a.reachedIn !== b.reachedIn) {
      return a.reachedIn - b.reachedIn;
    }
    if (a.reachedIn !== null && a.finishedAt && b.finishedAt) return a.finishedAt.localeCompare(b.finishedAt);
  }
  return b.totalValue - a.totalValue;
}

/** Code d'invitation : 8 caractères sans ambiguïté (pas de 0/O, 1/I) */
export const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const INVITE_CODE_PATTERN = /^[A-Z0-9]{8}$/;
