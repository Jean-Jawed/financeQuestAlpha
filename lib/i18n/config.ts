/**
 * FINANCEQUEST - I18N: CONFIGURATION
 * Langues du site et correspondances (Intl, Open Graph)
 */

export const LOCALES = ['fr', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Langue de la marque, utilisée quand rien d'autre n'est connu côté serveur */
export const DEFAULT_LOCALE: Locale = 'fr';

/** Langue proposée aux navigateurs qui ne demandent ni le français ni l'anglais (x-default) */
export const FALLBACK_LOCALE: Locale = 'en';

/** Cookie du dernier choix du joueur, lu par le proxy et par l'API */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

/** Balise Intl pour les nombres, devises et dates */
export const INTL_LOCALE: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-US',
};

/** Balise Open Graph (og:locale) */
export const OG_LOCALE: Record<Locale, string> = {
  fr: 'fr_FR',
  en: 'en_US',
};

/** Libellé du lien vers une langue, écrit dans cette langue (lu par ceux qui la parlent) */
export const LOCALE_SWITCH_LABELS: Record<Locale, string> = {
  fr: 'Version française',
  en: 'English version',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
