/**
 * PASTFOLIO - COULEURS DES CATÉGORIES D'ACTIFS
 * Émaux mats, lisibles sur le noyer comme sur l'ivoire (codes asset_types.code)
 */

export const CATEGORY_COLORS: Record<string, string> = {
  STOCK: '#5F7FB8', // bleu acier
  CRYPTO: '#8A6FB8', // améthyste
  COMMODITY: '#C08F3E', // ambre
  INDEX: '#4E9A96', // turquoise
  CURRENCY: '#B06E43', // cuivre
  BOND: '#6F9A6A', // vert-de-gris
  ETF: '#7D8FA3', // étain
  REAL_ESTATE: '#A0785A', // terre cuite
};

/** Couleur d'une catégorie ; ivoire pour les liquidités, gris pour l'inconnu */
export function categoryColor(code: string | null | undefined): string {
  if (code === 'CASH') return '#D9CCAE';
  return (code && CATEGORY_COLORS[code.toUpperCase()]) || '#8C8576';
}
