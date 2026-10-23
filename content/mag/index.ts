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
  /** Fiche : le terme défini, pour les données structurées (DefinedTerm) */
  term?: string;
}

/** Dossier de fond, ou fiche courte pour débutants */
export type ArticleKind = 'article' | 'fiche';

export interface Article {
  id: string;
  kind: ArticleKind;
  /** YYYY-MM-DD */
  published: string;
  updated: string;
  /** Gravure (public/gravures) ou image d'archive (public/mag) */
  image: string;
  imageWidth: number;
  imageHeight: number;
  /** Lectures conseillées en bas de page, par identifiant */
  related: string[];
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
  kind: ArticleKind;
  related: string[];
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
    kind: 'article',
    related: ['krachs', 'vente-a-decouvert', 'etf'],
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
    kind: 'article',
    related: ['avant-de-trader', 'volatilite', 'indice'],
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
  // ---------- Dossiers ----------
  {
    id: 'krachs',
    kind: 'article',
    related: ['volatilite', 'avant-de-trader', 'vente-a-decouvert'],
    published: '2026-10-23',
    updated: '2026-10-23',
    image: '/mag/bulle-mers-du-sud-1721.webp',
    imageWidth: 1360,
    imageHeight: 943,
    locales: {
      fr: {
        slug: 'les-grands-krachs-boursiers',
        title: 'Les grands krachs boursiers, de 1720 à 2020',
        shortTitle: 'Les grands krachs boursiers',
        description:
          'Bulles de 1720, 1929, 1987, 2000, 2008, mars 2020 : comment naissent les krachs, ce qu’ils ont coûté, combien de temps il a fallu pour s’en remettre, et ce qu’ils enseignent.',
        lead: 'Tous les krachs se ressemblent un peu : l’euphorie, le crédit facile, puis la peur qui se propage plus vite que l’information. Trois siècles de paniques, et les leçons qui en restent.',
        readingMinutes: 12,
        keywords: [
          'krach boursier',
          'krach de 1929',
          'krach de 1987',
          'bulle internet',
          'crise de 2008',
          'krach de mars 2020',
          'bulle des mers du Sud',
        ],
        imageAlt: 'Gravure satirique de Hogarth : une foule tourne sur un manège devant une colonne, à Londres, en 1721',
      },
      en: {
        slug: 'great-stock-market-crashes',
        title: 'The great stock market crashes, from 1720 to 2020',
        shortTitle: 'The great stock market crashes',
        description:
          'The 1720 bubbles, 1929, 1987, 2000, 2008, March 2020: how crashes start, what they cost, how long recovery took, and what they teach us.',
        lead: 'Every crash looks a little like the others: euphoria, easy credit, then fear spreading faster than information. Three centuries of panics, and the lessons that remain.',
        readingMinutes: 11,
        keywords: [
          'stock market crash',
          '1929 crash',
          '1987 crash',
          'dot-com bubble',
          '2008 financial crisis',
          'March 2020 crash',
          'South Sea Bubble',
        ],
        imageAlt: 'Satirical engraving by Hogarth: a crowd riding a merry-go-round before a column, London, 1721',
      },
    },
  },
  {
    id: 'change',
    kind: 'article',
    related: ['indice', 'etf', 'avant-de-trader'],
    published: '2026-10-23',
    updated: '2026-10-23',
    image: '/mag/preteur-metsys-1514.webp',
    imageWidth: 1360,
    imageHeight: 1280,
    locales: {
      fr: {
        slug: 'le-change-et-vos-placements',
        title: 'Le change : quand la devise décide de votre performance',
        shortTitle: 'Le change et vos placements',
        description:
          'Pourquoi une action américaine peut monter à New York et baisser dans votre portefeuille en euros : le risque de change expliqué simplement, avec des exemples réels.',
        lead: 'Acheter une action étrangère, c’est faire deux paris à la fois : sur l’entreprise, et sur sa monnaie. Le second passe souvent inaperçu, jusqu’au jour où il efface le premier.',
        readingMinutes: 8,
        keywords: ['risque de change', 'taux de change', 'EUR/USD', 'investir en dollars', 'couverture de change', 'devise'],
        imageAlt: 'Peinture flamande : un changeur pèse des pièces sur une balance, son épouse feuillette un livre à ses côtés',
      },
      en: {
        slug: 'currency-and-your-investments',
        title: 'Currency: when the exchange rate decides your return',
        shortTitle: 'Currency and your investments',
        description:
          'Why a US stock can rise in New York and fall in your euro portfolio: currency risk explained simply, with real examples.',
        lead: 'Buying a foreign stock means making two bets at once: on the company, and on its currency. The second often goes unnoticed, until the day it wipes out the first.',
        readingMinutes: 8,
        keywords: ['currency risk', 'exchange rate', 'EUR/USD', 'investing abroad', 'currency hedging', 'forex'],
        imageAlt: 'Flemish painting: a money changer weighs coins on a scale, his wife leafing through a book beside him',
      },
    },
  },

  // ---------- Fiches ----------
  {
    id: 'action',
    kind: 'fiche',
    related: ['dividende', 'indice', 'avant-de-trader'],
    published: '2026-10-23',
    updated: '2026-10-23',
    image: '/mag/bourse-paris-xixe.webp',
    imageWidth: 1360,
    imageHeight: 785,
    locales: {
      fr: {
        slug: 'c-est-quoi-une-action',
        title: 'C’est quoi une action ?',
        shortTitle: 'C’est quoi une action ?',
        description:
          'Une action est une part du capital d’une entreprise. Ce qu’elle vous donne, comment se forme son prix, ce qu’est la capitalisation et ce que vous risquez, en 3 minutes.',
        lead: 'Une part d’entreprise, un prix qui bouge chaque seconde, des droits et un risque. L’essentiel en trois minutes.',
        readingMinutes: 3,
        keywords: ['action', 'c’est quoi une action', 'action en bourse', 'capitalisation boursière', 'actionnaire'],
        imageAlt: 'Gravure : le palais de la Bourse de Paris, colonnade et place animée',
        term: 'Action',
      },
      en: {
        slug: 'what-is-a-stock',
        title: 'What is a stock?',
        shortTitle: 'What is a stock?',
        description:
          'A stock (or share) is a slice of a company. What it gives you, how its price forms, what market capitalisation is and what you risk, in 3 minutes.',
        lead: 'A slice of a company, a price that moves every second, rights and a risk. The essentials in three minutes.',
        readingMinutes: 3,
        keywords: ['stock', 'share', 'what is a stock', 'market capitalisation', 'shareholder'],
        imageAlt: 'Engraving: the Paris stock exchange palace, its colonnade and a busy square',
        term: 'Stock',
      },
    },
  },
  {
    id: 'etf',
    kind: 'fiche',
    related: ['indice', 'action', 'change'],
    published: '2026-10-23',
    updated: '2026-10-23',
    image: '/gravures/panier.webp',
    imageWidth: 1024,
    imageHeight: 765,
    locales: {
      fr: {
        slug: 'c-est-quoi-un-etf',
        title: 'C’est quoi un ETF ?',
        shortTitle: 'C’est quoi un ETF ?',
        description:
          'Un ETF, ou tracker, est un fonds coté en bourse qui réplique un indice. Comment il fonctionne, ce qu’il coûte, ses avantages et ses limites, expliqués simplement.',
        lead: 'Tout un indice dans une seule part, pour quelques centimes de frais par an. Pourquoi les ETF ont changé la façon d’investir.',
        readingMinutes: 3,
        keywords: ['ETF', 'c’est quoi un ETF', 'tracker', 'fonds indiciel', 'frais de gestion', 'investir en ETF'],
        imageAlt: 'Gravure : un panier d’osier rempli de titres roulés et noués, posé sur une table',
        term: 'ETF',
      },
      en: {
        slug: 'what-is-an-etf',
        title: 'What is an ETF?',
        shortTitle: 'What is an ETF?',
        description:
          'An ETF is a fund listed on the stock exchange that tracks an index. How it works, what it costs, its strengths and its limits, explained simply.',
        lead: 'A whole index in a single share, for a few cents of fees a year. Why ETFs changed the way people invest.',
        readingMinutes: 3,
        keywords: ['ETF', 'what is an ETF', 'exchange-traded fund', 'index fund', 'expense ratio', 'invest in ETFs'],
        imageAlt: 'Engraving: a wicker basket full of rolled, ribbon-tied certificates on a table',
        term: 'Exchange-traded fund (ETF)',
      },
    },
  },
  {
    id: 'indice',
    kind: 'fiche',
    related: ['etf', 'action', 'krachs'],
    published: '2026-10-23',
    updated: '2026-10-23',
    image: '/mag/activite-wall-street-1908.webp',
    imageWidth: 1360,
    imageHeight: 824,
    locales: {
      fr: {
        slug: 'c-est-quoi-un-indice-boursier',
        title: 'C’est quoi un indice boursier ?',
        shortTitle: 'Un indice boursier',
        description:
          'CAC 40, S&P 500, Dow Jones, Nikkei : un indice boursier résume l’évolution d’un groupe d’actions. Comment il est calculé et pourquoi il compte, en 3 minutes.',
        lead: 'Un seul chiffre pour dire comment va un marché. Mais tous les indices ne se calculent pas de la même façon.',
        readingMinutes: 3,
        keywords: ['indice boursier', 'CAC 40', 'S&P 500', 'Dow Jones', 'Nikkei 225', 'pondération'],
        imageAlt: 'Gravure : une foule de courtiers agités dans Wall Street, en 1908',
        term: 'Indice boursier',
      },
      en: {
        slug: 'what-is-a-stock-market-index',
        title: 'What is a stock market index?',
        shortTitle: 'A stock market index',
        description:
          'S&P 500, Dow Jones, CAC 40, Nikkei: a stock index sums up how a group of stocks is doing. How it is calculated and why it matters, in 3 minutes.',
        lead: 'A single number to say how a market is doing. But not all indices are calculated the same way.',
        readingMinutes: 3,
        keywords: ['stock market index', 'S&P 500', 'Dow Jones', 'CAC 40', 'Nikkei 225', 'index weighting'],
        imageAlt: 'Engraving: a crowd of agitated brokers on Wall Street, 1908',
        term: 'Stock market index',
      },
    },
  },
  {
    id: 'vente-a-decouvert',
    kind: 'fiche',
    related: ['avant-de-trader', 'volatilite', 'krachs'],
    published: '2026-10-23',
    updated: '2026-10-23',
    image: '/mag/ours-wall-street-1907.webp',
    imageWidth: 812,
    imageHeight: 498,
    locales: {
      fr: {
        slug: 'la-vente-a-decouvert-en-2-minutes',
        title: 'La vente à découvert en 2 minutes',
        shortTitle: 'La vente à découvert',
        description:
          'Vendre ce qu’on ne possède pas pour gagner à la baisse : le fonctionnement de la vente à découvert, ses coûts, son risque sans plafond et le short squeeze.',
        lead: 'Gagner quand le cours baisse : c’est possible, mais le risque change de forme. Le mécanisme en quatre étapes.',
        readingMinutes: 2,
        keywords: ['vente à découvert', 'short', 'shorter une action', 'short squeeze', 'parier à la baisse'],
        imageAlt: 'Caricature de 1907 : des ours géants lâchés sur Wall Street dispersent une foule',
        term: 'Vente à découvert',
      },
      en: {
        slug: 'short-selling-in-2-minutes',
        title: 'Short selling in 2 minutes',
        shortTitle: 'Short selling',
        description:
          'Selling what you don’t own to profit from a fall: how short selling works, what it costs, its unlimited risk and the short squeeze.',
        lead: 'Making money when the price falls: it is possible, but the risk changes shape. The mechanism in four steps.',
        readingMinutes: 2,
        keywords: ['short selling', 'shorting a stock', 'short squeeze', 'betting against a stock', 'go short'],
        imageAlt: '1907 cartoon: giant bears let loose on Wall Street scatter a crowd',
        term: 'Short selling',
      },
    },
  },
  {
    id: 'volatilite',
    kind: 'fiche',
    related: ['krachs', 'avant-de-trader', 'indice'],
    published: '2026-10-23',
    updated: '2026-10-23',
    image: '/gravures/tempete.webp',
    imageWidth: 1024,
    imageHeight: 765,
    locales: {
      fr: {
        slug: 'c-est-quoi-la-volatilite',
        title: 'C’est quoi la volatilité ?',
        shortTitle: 'La volatilité',
        description:
          'La volatilité mesure l’ampleur des variations d’un prix. Comment la lire, ses ordres de grandeur (indices, actions, bitcoin), le VIX et ce qu’elle dit vraiment du risque.',
        lead: 'Deux placements peuvent rapporter autant et se vivre très différemment. La volatilité mesure la tempête que vous traverserez en route.',
        readingMinutes: 3,
        keywords: ['volatilité', 'c’est quoi la volatilité', 'écart-type', 'VIX', 'indice de la peur', 'risque'],
        imageAlt: 'Gravure : un trois-mâts ballotté par une mer démontée sous les éclairs',
        term: 'Volatilité',
      },
      en: {
        slug: 'what-is-volatility',
        title: 'What is volatility?',
        shortTitle: 'Volatility',
        description:
          'Volatility measures how widely a price swings. How to read it, typical levels (indices, stocks, bitcoin), the VIX and what it really says about risk.',
        lead: 'Two investments can return the same and feel completely different. Volatility measures the storm you will sail through on the way.',
        readingMinutes: 3,
        keywords: ['volatility', 'what is volatility', 'standard deviation', 'VIX', 'fear index', 'investment risk'],
        imageAlt: 'Engraving: a three-masted ship tossed by a raging sea under lightning',
        term: 'Volatility',
      },
    },
  },
  {
    id: 'dividende',
    kind: 'fiche',
    related: ['action', 'etf', 'indice'],
    published: '2026-10-23',
    updated: '2026-10-23',
    image: '/gravures/frappe.webp',
    imageWidth: 1024,
    imageHeight: 1024,
    locales: {
      fr: {
        slug: 'c-est-quoi-un-dividende',
        title: 'C’est quoi un dividende ?',
        shortTitle: 'Le dividende',
        description:
          'Le dividende est la part du bénéfice versée aux actionnaires. Date de détachement, rendement, taux de distribution et réinvestissement, expliqués simplement.',
        lead: 'La part des bénéfices qui revient aux actionnaires. Un revenu, mais pas un cadeau : le cours baisse d’autant le jour du détachement.',
        readingMinutes: 3,
        keywords: [
          'dividende',
          'c’est quoi un dividende',
          'rendement du dividende',
          'détachement du dividende',
          'réinvestir les dividendes',
        ],
        imageAlt: 'Gravure : une presse à monnaie à volant, des pièces fraîchement frappées sur l’établi',
        term: 'Dividende',
      },
      en: {
        slug: 'what-is-a-dividend',
        title: 'What is a dividend?',
        shortTitle: 'The dividend',
        description:
          'A dividend is the share of profits paid to shareholders. Ex-dividend date, yield, payout ratio and reinvestment, explained simply.',
        lead: 'The share of profits that goes back to shareholders. Income, but not a gift: the price drops by about as much on the ex-dividend date.',
        readingMinutes: 3,
        keywords: ['dividend', 'what is a dividend', 'dividend yield', 'ex-dividend date', 'reinvest dividends'],
        imageAlt: 'Engraving: a flywheel coin press, freshly struck coins on the workbench',
        term: 'Dividend',
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
    kind: article.kind,
    related: article.related,
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

/** Articles dans une langue, du plus récent au plus ancien ; `kind` pour n'en garder qu'un genre */
export function listArticles(locale: Locale, kind?: ArticleKind): LocalizedArticle[] {
  return ARTICLES.filter((article) => !kind || article.kind === kind)
    .sort((a, b) => b.published.localeCompare(a.published))
    .map((article) => localize(article, locale));
}

/** Lectures conseillées d'un article, dans l'ordre choisi */
export function listRelated(article: LocalizedArticle, locale: Locale): LocalizedArticle[] {
  return article.related
    .map((id) => ARTICLES.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is Article => Boolean(candidate))
    .map((candidate) => localize(candidate, locale));
}

/** Adresse sans langue d'un article, par identifiant (liens entre articles et depuis le jeu) */
export function articlePath(id: string, locale: Locale): string {
  const article = ARTICLES.find((candidate) => candidate.id === id);
  if (!article) throw new Error(`Article inconnu : ${id}`);
  return `/mag/${article.locales[locale].slug}`;
}

/** Article par son nom d'adresse dans une langue */
export function getArticleBySlug(locale: Locale, slug: string): LocalizedArticle | null {
  const article = ARTICLES.find((candidate) => candidate.locales[locale].slug === slug);
  return article ? localize(article, locale) : null;
}
