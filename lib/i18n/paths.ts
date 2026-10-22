/**
 * FINANCEQUEST - I18N: CHEMINS
 * Préfixe de langue dans les adresses (/fr/…, /en/…)
 */

import { isLocale, type Locale } from './config';

/**
 * Ajouter la langue devant un chemin interne
 *
 * @example
 * localizePath('en', '/dashboard') // "/en/dashboard"
 * localizePath('fr', '/') // "/fr"
 */
export function localizePath(locale: Locale, path: string): string {
  if (path === '/' || path === '') return `/${locale}`;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Langue présente en tête du chemin, ou null
 */
export function getPathLocale(pathname: string): Locale | null {
  const segment = pathname.split('/')[1];
  return isLocale(segment) ? segment : null;
}

/**
 * Chemin sans la langue
 *
 * @example
 * stripLocale('/fr/game/abc') // "/game/abc"
 * stripLocale('/en') // "/"
 */
export function stripLocale(pathname: string): string {
  const locale = getPathLocale(pathname);
  if (!locale) return pathname;
  const rest = pathname.slice(locale.length + 1);
  return rest === '' ? '/' : rest;
}

/**
 * Même page dans une autre langue
 */
export function switchLocalePath(pathname: string, locale: Locale): string {
  return localizePath(locale, stripLocale(pathname));
}

/**
 * Le chemin de redirection après connexion est-il interne et sûr ?
 * (évite les redirections ouvertes vers un autre site)
 */
export function isSafeRedirect(path: string | null | undefined): path is string {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');
}

