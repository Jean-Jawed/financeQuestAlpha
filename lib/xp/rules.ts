/**
 * PASTFOLIO - XP : RÈGLES
 * Barème, courbe de niveaux, titres et calculs purs (sans accès base)
 * Conception et calibrage : docs/reviewOct2026/phase3/01_xp.md (et xp_sim.py)
 *
 * Changer une valeur du barème : incrémenter XP_RULE_VERSION (enregistrée sur
 * chaque ligne du journal, pour pouvoir recalculer l'historique)
 */

export const XP_RULE_VERSION = 1;

// ==========================================
// BARÈME
// ==========================================

export const XP = {
  // Flux de base (doublé par l'XP de repos)
  session: 4,
  order: 2,
  closeWin: 3,
  closeLoss: 1,
  // Jour réel
  dayOpening: 15,
  comeback: 50,
  /** Absence (jours réels) qui déclenche le bonus de retour */
  comebackDays: 14,
  // Découvertes (une fois par compte)
  firstOrderType: 20,
  firstAssetType: 25,
  firstMarket: 15,
  newAsset: 4,
  firstCurrency: 15,
  firstScenario: 100,
  firstGroupMode: 75,
  firstCrisis: 50,
  // Partie
  gameCreated: 10,
  bankrupt: 20,
  dataEndBonus: 50,
  positiveReturn: 30,
  beatBenchmark: 60,
  beatBenchmarkPerPoint: 2,
  beatBenchmarkMax: 200,
  // Groupes
  groupJoin: 20,
  groupCreate: 30,
  groupMemberJoined: 10,
  groupMemberJoinedMax: 10,
  groupMessage: 1,
  groupMessagesPerDay: 20,
  groupPunctual: 2,
  eliminationSurvived: 20,
  lastStanding: 150,
  targetReached: 100,
  targetSpeedPerSession: 2,
  targetSpeedMax: 150,
  // Moments historiques
  historicPresent: 40,
  historicStanding: 40,
  historicAll: 300,
} as const;

/** XP de repos : réserve remplie par jour réel sans jouer, plafonnée à une semaine */
export const RESTED = { perDay: 150, max: 1050 } as const;

/** Séries de jours réels consécutifs */
export const STREAK_BONUSES: ReadonlyArray<[days: number, xp: number]> = [
  [3, 30],
  [7, 100],
  [14, 150],
  [30, 400],
];

/** Puis tous les 30 jours au-delà de 30 */
export const STREAK_EVERY = { days: 30, xp: 400 } as const;

export function streakBonus(streak: number): number {
  const fixed = STREAK_BONUSES.find(([days]) => days === streak);
  if (fixed) return fixed[1];
  return streak > 30 && streak % STREAK_EVERY.days === 0 ? STREAK_EVERY.xp : 0;
}

/** Jalons de séances dans une partie */
export const SESSION_MILESTONES: ReadonlyArray<[sessions: number, xp: number]> = [
  [10, 20],
  [20, 40],
  [50, 80],
  [100, 150],
  [250, 300],
  [500, 500],
  [1000, 800],
];

/** Paliers du catalogue (actifs différents négociés) ; « all » = tout le catalogue */
export const CATALOG_MILESTONES: ReadonlyArray<[assets: number, xp: number]> = [
  [10, 25],
  [25, 50],
  [50, 100],
  [100, 150],
  [150, 200],
  [200, 300],
];
export const CATALOG_ALL_XP = 1000;

/** Collections complètes : taille et bonus (le catalogue grandit : tailles relues côté serveur) */
export const COLLECTIONS = {
  'order-type': { size: 4, xp: 60 },
  'asset-type': { size: 8, xp: 100 },
  market: { size: 15, xp: 150 },
  currency: { size: 7, xp: 75 },
  scenario: { size: 6, xp: 250 },
  'group-mode': { size: 5, xp: 200 },
  crisis: { size: 5, xp: 150 },
  historic: { size: 13, xp: XP.historicAll },
} as const;

export type CollectionKind = keyof typeof COLLECTIONS;

/** Paliers de rendement, cumulés */
export const RETURN_TIERS: ReadonlyArray<[minReturn: number, xp: number]> = [
  [10, 40],
  [25, 80],
  [50, 150],
  [100, 300],
];

/** Classement du scénario à la fin de la partie (le meilleur palier seulement) */
export function rankBonus(rank: number): number {
  if (rank === 1) return 400;
  if (rank <= 3) return 200;
  if (rank <= 10) return 100;
  return 0;
}

/** Coefficient de scénario : fin de partie et performance (pas le flux de base) */
export const SCENARIO_COEFFICIENTS: Record<string, number> = {
  libre: 1,
  crypto: 0.9,
  orient: 1.15,
  'ruee-bancaire': 1.3,
  diamant: 1.3,
  ours: 1.5,
};

/** Coefficient du marathon de crise (groupes) */
export const CRISIS_COEFFICIENT = 1.2;

// ==========================================
// FIN DE PARTIE
// ==========================================

export interface GameEndInput {
  endReason: string;
  sessionsPlayed: number;
  finalReturn: number;
  /** Rendement de l'indice du scénario sur la période (null : inconnu) */
  benchmarkReturn: number | null;
  scenario: string;
  /** Marathon de crise (groupe) */
  crisis: boolean;
  /** Rang au classement du scénario (partie classée), sinon null */
  rank: number | null;
}

export interface XpPart {
  kind: string;
  xp: number;
}

/** XP de fin de partie, par poste (avant coefficient), puis total avec coefficient */
export function gameEndXp(input: GameEndInput): { parts: XpPart[]; coefficient: number } {
  const parts: XpPart[] = [];
  const reason = input.endReason;

  if (reason === 'abandoned') return { parts, coefficient: 1 };
  if (reason === 'bankrupt') return { parts: [{ kind: 'end', xp: XP.bankrupt }], coefficient: 1 };

  parts.push({ kind: 'end', xp: Math.min(50 + Math.round(0.5 * input.sessionsPlayed), 300) });
  if (reason === 'data_end') parts.push({ kind: 'end-data', xp: XP.dataEndBonus });

  // Performance
  if (input.finalReturn > 0) parts.push({ kind: 'perf-positive', xp: XP.positiveReturn });
  for (const [min, xp] of RETURN_TIERS) {
    if (input.finalReturn >= min) parts.push({ kind: `perf-return-${min}`, xp });
  }
  if (input.benchmarkReturn !== null && input.finalReturn > input.benchmarkReturn) {
    const gap = input.finalReturn - input.benchmarkReturn;
    parts.push({
      kind: 'perf-benchmark',
      xp: XP.beatBenchmark + Math.min(Math.round(gap * XP.beatBenchmarkPerPoint), XP.beatBenchmarkMax),
    });
  }
  if (input.rank !== null && rankBonus(input.rank) > 0) parts.push({ kind: 'rank', xp: rankBonus(input.rank) });

  const coefficient = input.crisis ? CRISIS_COEFFICIENT : (SCENARIO_COEFFICIENTS[input.scenario] ?? 1);
  return { parts, coefficient };
}

// ==========================================
// GROUPES
// ==========================================

/** XP de place au classement final d'un groupe (n joueurs non-abandonnistes, n ≥ 2) */
export function groupPlacementXp(place: number, players: number): number {
  const base = place === 1 ? 200 : place === 2 ? 120 : place === 3 ? 80 : 40;
  const multiplier = Math.min(1 + 0.15 * (players - 2), 2.5);
  return Math.round(base * multiplier);
}

/** Course : objectif atteint, plus un bonus de vitesse */
export function targetReachedXp(sessionsUsed: number, sessionsCap: number): number {
  const ahead = Math.max(sessionsCap - sessionsUsed, 0);
  return XP.targetReached + Math.min(ahead * XP.targetSpeedPerSession, XP.targetSpeedMax);
}

// ==========================================
// SUCCÈS
// ==========================================

/** Succès : points en base × 1,5 au premier déblocage sur le compte, × 0,4 ensuite */
export function achievementXp(points: number, firstOnAccount: boolean): number {
  return Math.round(points * (firstOnAccount ? 1.5 : 0.4));
}

// ==========================================
// MOMENTS HISTORIQUES
// ==========================================

export const HISTORIC_MOMENTS: ReadonlyArray<{ date: string; id: string }> = [
  { date: '2017-12-17', id: 'bitcoin-2017' },
  { date: '2018-02-05', id: 'volmageddon' },
  { date: '2018-12-24', id: 'reveillon-noir' },
  { date: '2020-03-09', id: 'krach-petrole' },
  { date: '2020-03-16', id: 'covid-16-mars' },
  { date: '2020-03-24', id: 'rebond-24-mars' },
  { date: '2020-11-09', id: 'vaccin' },
  { date: '2022-05-09', id: 'terra-luna' },
  { date: '2022-11-08', id: 'ftx' },
  { date: '2023-03-10', id: 'svb' },
  { date: '2024-08-05', id: 'krach-tokyo' },
  { date: '2025-04-03', id: 'droits-de-douane' },
  { date: '2025-04-09', id: 'rebond-avril-2025' },
];

/** Moments traversés par une séance qui passe de `from` (exclu) à `to` (inclus) */
export function momentsCrossed(from: string, to: string): Array<{ date: string; id: string }> {
  return HISTORIC_MOMENTS.filter((moment) => moment.date > from && moment.date <= to);
}

// ==========================================
// NIVEAUX ET TITRES
// ==========================================

export const MAX_LEVEL = 50;
/** Au-delà du niveau 50 : une étoile par tranche */
export const STAR_XP = 15_000;

/** XP pour passer du niveau n au niveau n+1 (arrondi à la dizaine) */
export function levelStep(level: number): number {
  return Math.round((60 + 40 * level ** 1.45) / 10) * 10;
}

/** XP total pour atteindre chaque niveau : CUMULATIVE[n] (index 1 = 0) */
const CUMULATIVE: number[] = (() => {
  const table = [0, 0];
  for (let level = 1; level < MAX_LEVEL; level++) table.push(table[level] + levelStep(level));
  return table;
})();

export function xpForLevel(level: number): number {
  return CUMULATIVE[Math.min(Math.max(level, 1), MAX_LEVEL)];
}

export interface LevelInfo {
  level: number;
  /** Étoiles au-delà du niveau 50 */
  stars: number;
  /** XP gagnée dans le niveau (ou l'étoile) en cours */
  intoLevel: number;
  /** XP du niveau (ou de l'étoile) en cours */
  levelSize: number;
  /** Progression dans le niveau, de 0 à 1 */
  progress: number;
}

export function levelInfo(xpTotal: number): LevelInfo {
  const xp = Math.max(0, Math.floor(xpTotal));

  if (xp >= CUMULATIVE[MAX_LEVEL]) {
    const beyond = xp - CUMULATIVE[MAX_LEVEL];
    const intoLevel = beyond % STAR_XP;
    return { level: MAX_LEVEL, stars: Math.floor(beyond / STAR_XP), intoLevel, levelSize: STAR_XP, progress: intoLevel / STAR_XP };
  }

  let level = 1;
  while (level < MAX_LEVEL && CUMULATIVE[level + 1] <= xp) level++;
  const intoLevel = xp - CUMULATIVE[level];
  const levelSize = levelStep(level);
  return { level, stars: 0, intoLevel, levelSize, progress: intoLevel / levelSize };
}

/** Titres : un tous les 5 niveaux (clés des dictionnaires ui.xp.titles) */
export const TITLES = [
  'badaud',
  'coursier',
  'commis',
  'remisier',
  'coulissier',
  'fonde',
  'agent',
  'banquier',
  'syndic',
  'regent',
  'argentier',
] as const;

export type TitleKey = (typeof TITLES)[number];

export function titleFor(level: number): TitleKey {
  return TITLES[Math.min(Math.floor(level / 5), TITLES.length - 1)];
}
