/**
 * PASTFOLIO - ENTITÉS WIKIDATA
 * Les notions dont parle le site, reliées à leur fiche Wikidata dans les données
 * structurées (about, genre). Les moteurs rattachent ainsi les pages à des
 * entités connues plutôt qu'à de simples mots-clés.
 * Identifiants vérifiés sur wikidata.org (API wbsearchentities / wbgetentities).
 */

import type { Locale } from '@/lib/i18n/config';

const ENTITIES = {
  // Le jeu
  Q7617907: { fr: 'Simulateur boursier', en: 'Stock market simulator' },
  Q1610017: { fr: 'Jeu vidéo de simulation', en: 'Simulation video game' },
  Q848991: { fr: 'Jeu par navigateur', en: 'Browser game' },
  Q1140363: { fr: 'Jeu éducatif', en: 'Educational game' },
  Q1506693: { fr: 'Jeu sérieux', en: 'Serious game' },
  // Les marchés
  Q475000: { fr: 'Marché boursier', en: 'Stock market' },
  Q3997173: { fr: 'Trader', en: 'Stock trader' },
  Q1416374: { fr: 'Culture financière', en: 'Financial literacy' },
  Q4290: { fr: 'Investissement', en: 'Investment' },
  Q107885: { fr: 'Spéculation', en: 'Speculation' },
  Q11692: { fr: 'Action', en: 'Share' },
  Q845477: { fr: 'Fonds indiciel coté (ETF)', en: 'Exchange-traded fund' },
  Q223371: { fr: 'Indice boursier', en: 'Stock market index' },
  Q181201: { fr: 'Dividende', en: 'Dividend' },
  Q756115: { fr: 'Volatilité', en: 'Volatility' },
  Q106526: { fr: 'Vente à découvert', en: 'Short selling' },
  Q2032513: { fr: 'Effet de levier', en: 'Financial leverage' },
  Q731453: { fr: 'Diversification', en: 'Diversification' },
  Q66100: { fr: 'Taux de change', en: 'Exchange rate' },
  Q1542397: { fr: 'Risque de change', en: 'Foreign exchange risk' },
  Q1020018: { fr: 'Krach boursier', en: 'Stock market crash' },
  Q201684: { fr: 'Krach de 1929', en: 'Wall Street crash of 1929' },
  Q138372: { fr: 'Trading haute fréquence', en: 'High-frequency trading' },
  Q139445: { fr: 'Trading algorithmique', en: 'Algorithmic trading' },
  Q1064131: { fr: 'Day trading', en: 'Day trading' },
  Q1129769: { fr: 'Contrat sur la différence (CFD)', en: 'Contract for difference' },
  Q1574928: { fr: 'Stratégie de trading', en: 'Trading strategy' },
  Q2609843: { fr: 'Ordre stop', en: 'Stop-loss order' },
  Q1267212: { fr: 'Investissement programmé', en: 'Dollar cost averaging' },
  Q85759142: { fr: 'Épargne de précaution', en: 'Emergency fund' },
  Q959606: { fr: 'Intérêts composés', en: 'Compound interest' },
  // Finance comportementale
  Q11698132: { fr: 'Finance comportementale', en: 'Behavioral finance' },
  Q2874240: { fr: 'Aversion à la perte', en: 'Loss aversion' },
  Q1229229: { fr: 'Effet de disposition', en: 'Disposition effect' },
  Q16503490: { fr: 'Excès de confiance', en: 'Overconfidence effect' },
} as const;

export type WikidataId = keyof typeof ENTITIES;

/** Adresse de la fiche Wikidata */
export function wikidataUrl(id: WikidataId): string {
  return `https://www.wikidata.org/wiki/${id}`;
}

/** Notion schema.org reliée à Wikidata, nommée dans la langue de la page */
export function wikidataThing(id: WikidataId, locale: Locale): Record<string, unknown> {
  return { '@type': 'Thing', name: ENTITIES[id][locale], sameAs: wikidataUrl(id) };
}

/** Plusieurs notions à la fois (propriété « about » d'une page) */
export function wikidataThings(ids: readonly WikidataId[], locale: Locale): Record<string, unknown>[] {
  return ids.map((id) => wikidataThing(id, locale));
}
