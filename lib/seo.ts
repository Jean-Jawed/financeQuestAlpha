/**
 * FINANCEQUEST - SEO
 * Adresse du site, alternatives de langue (hreflang) et métadonnées de page
 */

import type { Metadata } from 'next';
import { FALLBACK_LOCALE, LOCALES, OG_LOCALE, type Locale } from '@/lib/i18n/config';
import { localizePath } from '@/lib/i18n/paths';
import { getSiteMessages } from '@/lib/i18n/messages';

/**
 * Adresse publique du site, sans barre finale
 * NEXT_PUBLIC_SITE_URL (domaine définitif), sinon le domaine de production Vercel
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}

/** Adresse absolue d'un chemin */
export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path}`;
}

/**
 * Alternatives de langue d'une page : fr, en et x-default (l'anglais)
 *
 * @param paths - Chemin sans langue, identique dans les deux langues (« /faq »),
 *   ou un chemin par langue (articles du magazine, aux adresses traduites)
 */
export function languageAlternates(paths: string | Record<Locale, string>): Record<string, string> {
  const pathFor = (locale: Locale) => (typeof paths === 'string' ? paths : paths[locale]);
  const languages: Record<string, string> = {};

  for (const locale of LOCALES) {
    languages[locale] = absoluteUrl(localizePath(locale, pathFor(locale)));
  }
  languages['x-default'] = absoluteUrl(localizePath(FALLBACK_LOCALE, pathFor(FALLBACK_LOCALE)));

  return languages;
}

interface PageMetadataOptions {
  locale: Locale;
  /** Chemin sans langue (ou un par langue) */
  path: string | Record<Locale, string>;
  title: string;
  description?: string;
  /** Pages privées et formulaires : hors index */
  noindex?: boolean;
  /** Titre complet, sans le suffixe « · FinanceQuest » */
  absoluteTitle?: boolean;
  type?: 'website' | 'article';
  /** Article : dates de publication et de mise à jour (YYYY-MM-DD) */
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Métadonnées complètes d'une page : titre, description, canonique, hreflang,
 * Open Graph et carte Twitter. L'image de partage vient des fichiers
 * opengraph-image du segment.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  noindex = false,
  absoluteTitle = false,
  type = 'website',
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const site = getSiteMessages(locale);
  const localPath = typeof path === 'string' ? path : path[locale];
  const canonical = absoluteUrl(localizePath(locale, localPath));
  const resolvedDescription = description ?? site.seo.defaultDescription;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: resolvedDescription,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type,
      url: canonical,
      siteName: site.seo.siteName,
      title,
      description: resolvedDescription,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((other) => other !== locale).map((other) => OG_LOCALE[other]),
      ...(type === 'article' ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: resolvedDescription,
    },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
