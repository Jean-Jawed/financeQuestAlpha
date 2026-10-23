/**
 * FINANCEQUEST - LA GAZETTE : CORPS DES ARTICLES
 * Séparé du registre (index.ts), que le jeu importe aussi côté client pour ses liens
 */

import type { Locale } from '@/lib/i18n/config';
import type { ArticleBodyModule } from './index';

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
    krachs: { fr: () => import('./krachs/fr'), en: () => import('./krachs/en') },
    change: { fr: () => import('./change/fr'), en: () => import('./change/en') },
    action: { fr: () => import('./fiches/action.fr'), en: () => import('./fiches/action.en') },
    etf: { fr: () => import('./fiches/etf.fr'), en: () => import('./fiches/etf.en') },
    indice: { fr: () => import('./fiches/indice.fr'), en: () => import('./fiches/indice.en') },
    'vente-a-decouvert': {
      fr: () => import('./fiches/vente-a-decouvert.fr'),
      en: () => import('./fiches/vente-a-decouvert.en'),
    },
    volatilite: { fr: () => import('./fiches/volatilite.fr'), en: () => import('./fiches/volatilite.en') },
    dividende: { fr: () => import('./fiches/dividende.fr'), en: () => import('./fiches/dividende.en') },
  };
  return bodies[id][locale]();
}
