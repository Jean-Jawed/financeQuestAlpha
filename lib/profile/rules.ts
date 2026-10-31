/**
 * FINANCEQUEST - PROFIL : RÈGLES
 * Validation du pseudo, de la devise personnelle et des préférences
 * (fonctions pures, utilisables côté client et serveur)
 * Contraintes en base : docs/reviewOct2026/sql/08_projet_A_profil.sql
 */

// ==========================================
// CONSTANTES
// ==========================================

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'expert'] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const PROFILE_LIMITS = {
  nameMin: 3,
  nameMax: 24,
  mottoMax: 80,
  /** Délai entre deux changements de pseudo (le premier est libre) */
  nameChangeDays: 30,
} as const;

/** Codes pays ISO 3166-1 alpha-2 (noms affichés par Intl.DisplayNames) */
export const COUNTRY_CODES = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO ' +
  'JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR ' +
  'MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO ' +
  'RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV ' +
  'TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'
).split(' ');

const COUNTRY_SET = new Set(COUNTRY_CODES);

export function isCountryCode(value: unknown): value is string {
  return typeof value === 'string' && COUNTRY_SET.has(value);
}

// ==========================================
// MOTS INTERDITS
// ==========================================

/** Noms réservés : jamais dans un pseudo */
const RESERVED = ['admin', 'administrateur', 'moderateur', 'moderator', 'financequest', 'support', 'staff', 'systeme', 'system'];

/**
 * Insultes et termes haineux courants (FR, EN), comparés sans accents ni casse,
 * mot par mot (« député », « réputation » passent). Les mots de 5 lettres et plus
 * couvrent aussi leurs dérivés (« connards »)
 */
const BANNED = [
  'connard', 'connasse', 'salope', 'pute', 'putes', 'putain', 'encule', 'enculer', 'batard', 'bougnoul', 'negre', 'nazi',
  'hitler', 'pede', 'tapette', 'fuck', 'fucking', 'shit', 'bitch', 'cunt', 'nigger', 'nigga', 'faggot', 'whore', 'slut',
  'pd', 'fdp', 'ntm', 'tg',
];

/** Assez longs et sans ambiguïté pour être cherchés même collés ou espacés (« c o n n a r d ») */
const BANNED_ANYWHERE = ['connard', 'connasse', 'salope', 'encule', 'nigger', 'faggot', 'hitler', 'fuck'];

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/@/g, 'a');
}

/** Le texte contient-il un mot interdit (ou, pour un pseudo, réservé) ? */
export function containsBannedWord(text: string, { reserved = false } = {}): boolean {
  const flat = normalize(text);
  const squeezed = flat.replace(/[^a-z]/g, '');
  const tokens = flat.split(/[^a-z]+/).filter(Boolean);

  if (BANNED_ANYWHERE.some((word) => squeezed.includes(word))) return true;
  if (tokens.some((token) => BANNED.some((word) => token === word || (word.length >= 5 && token.startsWith(word))))) {
    return true;
  }
  // Noms réservés : mot exact (« Support » refusé, « Supporter75 » accepté), sauf les plus sensibles
  return (
    reserved &&
    (tokens.some((token) => RESERVED.includes(token)) ||
      ['admin', 'moderat', 'financequest'].some((word) => squeezed.includes(word)))
  );
}

// ==========================================
// PSEUDO
// ==========================================

export type NameIssue = 'length' | 'chars' | 'banned';

/** Espaces de début et de fin retirés, espaces multiples réduits */
export function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

/**
 * Problème du pseudo (déjà nettoyé), ou null s'il est valide
 * Lettres (accents compris), chiffres, espace, « - », « _ », « . »
 */
export function nameIssue(name: string): NameIssue | null {
  const length = [...name].length;
  if (length < PROFILE_LIMITS.nameMin || length > PROFILE_LIMITS.nameMax) return 'length';
  if (!/^[\p{L}\p{N} ._-]+$/u.test(name) || (name.match(/[\p{L}\p{N}]/gu)?.length ?? 0) < 2) return 'chars';
  if (containsBannedWord(name, { reserved: true })) return 'banned';
  return null;
}

/** Date à partir de laquelle le pseudo peut de nouveau changer (null : libre) */
export function nextNameChange(nameChangedAt: Date | string | null, now = new Date()): Date | null {
  if (!nameChangedAt) return null;
  const next = new Date(new Date(nameChangedAt).getTime() + PROFILE_LIMITS.nameChangeDays * 86_400_000);
  return next > now ? next : null;
}

// ==========================================
// DEVISE PERSONNELLE
// ==========================================

export type MottoIssue = 'length' | 'banned';

export function cleanMotto(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim();
}

export function mottoIssue(motto: string): MottoIssue | null {
  if ([...motto].length > PROFILE_LIMITS.mottoMax) return 'length';
  if (containsBannedWord(motto)) return 'banned';
  return null;
}

// ==========================================
// AFFICHAGE
// ==========================================

/** Initiales du pseudo (avatar de secours) : « Jawed Tahir » → « JT », « Zoé » → « ZO » */
export function initials(name: string): string {
  const words = name.split(/[\s._-]+/).filter(Boolean);
  const letters = words.length >= 2 ? [words[0][0], words[1][0]] : [...(words[0] ?? '?')].slice(0, 2);
  return letters.join('').toUpperCase();
}
