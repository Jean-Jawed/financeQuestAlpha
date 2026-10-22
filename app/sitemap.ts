/**
 * FINANCEQUEST - SITEMAP
 * /sitemap.xml : pages publiques dans les deux langues, avec leurs alternatives hreflang
 */

import type { MetadataRoute } from 'next';
import { listArticles } from '@/content/mag';
import { LOCALES } from '@/lib/i18n/config';
import { localizePath } from '@/lib/i18n/paths';
import { absoluteUrl, languageAlternates } from '@/lib/seo';

/** Pages publiques indexables : chemin sans langue et priorité relative */
const PUBLIC_PAGES: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/mag', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/leaderboard', priority: 0.5, changeFrequency: 'daily' },
  { path: '/signup', priority: 0.6, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = PUBLIC_PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(localizePath(locale, page.path)),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages: languageAlternates(page.path) },
    }))
  );

  const articles = LOCALES.flatMap((locale) =>
    listArticles(locale).map((article) => ({
      url: absoluteUrl(localizePath(locale, article.paths[locale])),
      lastModified: article.updated,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: { languages: languageAlternates(article.paths) },
    }))
  );

  return [...pages, ...articles];
}
