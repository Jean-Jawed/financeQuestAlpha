/**
 * FINANCEQUEST - I18N: DICTIONNAIRES
 */

import type { Locale } from '../config';
import { ui as uiFr } from './fr/ui';
import { ui as uiEn } from './en/ui';
import { site as siteFr } from './fr/site';
import { site as siteEn } from './en/site';
import { server as serverFr } from './fr/server';
import { server as serverEn } from './en/server';
import type { ServerMessages, SiteMessages, UiMessages } from './types';

const UI: Record<Locale, UiMessages> = { fr: uiFr, en: uiEn };
const SITE: Record<Locale, SiteMessages> = { fr: siteFr, en: siteEn };
const SERVER: Record<Locale, ServerMessages> = { fr: serverFr, en: serverEn };

/** Textes de l'interface (envoyés au navigateur par le fournisseur de traductions) */
export function getUiMessages(locale: Locale): UiMessages {
  return UI[locale];
}

/** Textes des pages publiques (rendus côté serveur seulement) */
export function getSiteMessages(locale: Locale): SiteMessages {
  return SITE[locale];
}

/** Messages de l'API et libellés des données */
export function getServerMessages(locale: Locale): ServerMessages {
  return SERVER[locale];
}

export type { ServerMessages, SiteMessages, UiMessages };
