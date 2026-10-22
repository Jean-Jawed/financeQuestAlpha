/**
 * FINANCEQUEST - I18N: CÔTÉ SERVEUR
 * Langue d'une page (segment [locale]) ou d'un appel d'API (cookie NEXT_LOCALE)
 */

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './config';
import { createFormatters, fmt } from './format';
import { getServerMessages, getSiteMessages, getUiMessages } from './messages';
import { localizePath } from './paths';

/**
 * Langue d'une page : le segment [locale] de l'adresse (404 s'il est inconnu)
 */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

/**
 * Langue d'un appel d'API : le dernier choix du joueur (cookie posé par le proxy)
 */
export async function getRequestLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Textes et formats d'une langue, pour les composants serveur
 */
export function getI18n(locale: Locale) {
  return {
    locale,
    ui: getUiMessages(locale),
    site: getSiteMessages(locale),
    f: createFormatters(locale),
    fmt,
    href: (path: string) => localizePath(locale, path),
  };
}

/**
 * Messages de l'API dans la langue de la requête
 */
export async function getApiI18n() {
  const locale = await getRequestLocale();
  const server = getServerMessages(locale);
  return {
    locale,
    api: server.api,
    server,
    f: createFormatters(locale),
    fmt,
  };
}
