/**
 * FINANCEQUEST - LA GAZETTE : REGISTRE DES ARTICLES
 * Métadonnées par langue ; le corps de chaque article est un composant React
 * (content/mag/<id>/<locale>.tsx), chargé à la demande
 */

import type { ComponentType } from 'react';
import type { Locale } from '@/lib/i18n/config';

// ==========================================
// TYPES
// ==========================================

export interface ArticleLocaleMeta {
  /** Nom dans l'adresse : /fr/mag/<slug> */
  slug: string;
  title: string;
  /** Titre court pour les cartes et le fil d'Ariane */
  shortTitle: string;
  /** Description pour les moteurs (≈ 155 caractères) */
  description: string;
  /** Chapô, sous le titre */
  lead: string;
  readingMinutes: number;
  keywords: string[];
  imageAlt: string;
}

export interface Article {
  id: string;
  /** YYYY-MM-DD */
  published: string;
  updated: string;
  /** Gravure (public/gravures), 4:3 */
  image: string;
  imageWidth: number;
  imageHeight: number;
  locales: Record<Locale, ArticleLocaleMeta>;
}

/** Une entrée du sommaire : l'identifiant d'ancre de l'intertitre et son texte */
export interface TocEntry {
  id: string;
  title: string;
}

export interface ArticleBodyModule {
  default: ComponentType;
  toc: TocEntry[];
}

export interface LocalizedArticle extends ArticleLocaleMeta {
  id: string;
  published: string;
  updated: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  /** Adresse sans langue dans chaque langue : /mag/<slug> */
  paths: Record<Locale, string>;
}

// ==========================================
// ARTICLES
// ==========================================

const ARTICLES: Article[] = [
  {
    id: 'avant-de-trader',
    published: '2026-10-22',
    updated: '2026-10-22',
    image: '/gravures/apprenti.webp',
    imageWidth: 1024,
    imageHeight: 765,
    locales: {
      fr: {
        slug: 'avant-de-commencer-a-trader',
        title: 'Ce qu’il faut savoir avant de commencer à trader',
        shortTitle: 'Avant de commencer à trader',
        description:
          'Rendement et risque, volatilité, diversification, frais, vente à découvert, effet de levier, biais : les notions à comprendre avant de trader, expliquées simplement.',
        lead: 'Avant de passer un premier ordre, une dizaine de notions font toute la différence entre apprendre et perdre. Les voici, sans jargon, avec les chiffres qui comptent.',
        readingMinutes: 12,
        keywords: [
          'commencer à trader',
          'apprendre le trading',
          'débuter en bourse',
          'rendement et risque',
          'diversification',
          'vente à découvert',
          'effet de levier',
        ],
        imageAlt: 'Gravure : un jeune commis penché sur un registre, une bande de téléscripteur à la main',
      },
      en: {
        slug: 'before-you-start-trading',
        title: 'What to know before you start trading',
        shortTitle: 'Before you start trading',
        description:
          'Risk and return, volatility, diversification, fees, short selling, leverage, biases: the concepts to understand before you trade, explained simply.',
        lead: 'Before you place your first order, a handful of concepts make all the difference between learning and losing. Here they are, without jargon, with the numbers that matter.',
        readingMinutes: 11,
        keywords: [
          'start trading',
          'learn trading',
          'stock market for beginners',
          'risk and return',
          'diversification',
          'short selling',
          'leverage',
        ],
        imageAlt: 'Engraving: a young clerk leaning over a ledger, holding a strip of ticker tape',
      },
    },
  },
  {
    id: 'micro-trading',
    published: '2026-10-22',
    updated: '2026-10-22',
    image: '/gravures/automate.webp',
    imageWidth: 1024,
    imageHeight: 765,
    locales: {
      fr: {
        slug: 'algorithmes-de-micro-trading',
        title: 'Les algorithmes de micro-trading, expliqués simplement',
        shortTitle: 'Les algorithmes de micro-trading',
        description:
          'Trading haute fréquence, tenue de marché, arbitrage, latence : comment fonctionnent les algorithmes qui tradent en microsecondes, et ce qu’un particulier peut en retenir.',
        lead: 'Une grande partie des ordres passés sur les marchés actions vient d’algorithmes qui décident en quelques microsecondes. Comment gagnent-ils de l’argent, et que changent-ils pour les autres ?',
        readingMinutes: 11,
        keywords: [
          'micro-trading',
          'trading haute fréquence',
          'trading algorithmique',
          'tenue de marché',
          'arbitrage',
          'flash crash',
          'latence',
        ],
        imageAlt: 'Gravure : un automate d’horlogerie lisant une bande de téléscripteur, engrenages apparents',
      },
      en: {
        slug: 'micro-trading-algorithms',
        title: 'Micro-trading algorithms, explained simply',
        shortTitle: 'Micro-trading algorithms',
        description:
          'High-frequency trading, market making, arbitrage, latency: how the algorithms that trade in microseconds work, and what an individual investor can learn from them.',
        lead: 'A large share of orders on stock markets comes from algorithms that decide in a few microseconds. How do they make money, and what do they change for everyone else?',
        readingMinutes: 10,
        keywords: [
          'micro-trading',
          'high-frequency trading',
          'algorithmic trading',
          'market making',
          'arbitrage',
          'flash crash',
          'latency',
        ],
        imageAlt: 'Engraving: a clockwork automaton reading a strip of ticker tape, its gears exposed',
      },
    },
  },
];

// ==========================================
// ACCÈS
// ==========================================

function localize(article: Article, locale: Locale): LocalizedArticle {
  return {
    ...article.locales[locale],
    id: article.id,
    published: article.published,
    updated: article.updated,
    image: article.image,
    imageWidth: article.imageWidth,
    imageHeight: article.imageHeight,
    paths: {
      fr: `/mag/${article.locales.fr.slug}`,
      en: `/mag/${article.locales.en.slug}`,
    },
  };
}

/** Articles dans une langue, du plus récent au plus ancien */
export function listArticles(locale: Locale): LocalizedArticle[] {
  return [...ARTICLES]
    .sort((a, b) => b.published.localeCompare(a.published))
    .map((article) => localize(article, locale));
}

/** Article par son nom d'adresse dans une langue */
export function getArticleBySlug(locale: Locale, slug: string): LocalizedArticle | null {
  const article = ARTICLES.find((candidate) => candidate.locales[locale].slug === slug);
  return article ? localize(article, locale) : null;
}

/** Corps de l'article et son sommaire */
export async function loadArticleBody(id: string, locale: Locale): Promise<ArticleBodyModule> {
  const bodies: Record<string, Record<Locale, () => Promise<ArticleBodyModule>>> = {
    'avant-de-trader': {
      fr: () => import('./avant-de-trader/fr'),
      en: () => import('./avant-de-trader/en'),
    },
    'micro-trading': {
      fr: () => import('./micro-trading/fr'),
      en: () => import('./micro-trading/en'),
    },
  };
  return bodies[id][locale]();
}
