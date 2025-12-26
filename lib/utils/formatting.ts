/**
 * FINANCEQUEST - FORMATTING UTILITIES
 * Helpers pour formater les nombres, prix, pourcentages
 */

// ==========================================
// CURRENCY FORMATTING
// ==========================================

/**
 * Formater un nombre en devise (EUR par défaut)
 * 
 * @example
 * formatCurrency(1234.56) // "1 234,56 €"
 * formatCurrency(1234.56, 'USD') // "$1,234.56"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Formater un prix compact (sans symbole €)
 * 
 * @example
 * formatPrice(1234.56) // "1 234,56"
 */
export function formatPrice(price: number, decimals: number = 2): string {
  return price.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formater un prix court (K, M, B)
 * 
 * @example
 * formatPriceShort(1234567) // "1,23 M€"
 * formatPriceShort(1234) // "1,23 K€"
 */
export function formatPriceShort(amount: number): string {
  const abs = Math.abs(amount);
  
  if (abs >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)} Md€`;
  }
  
  if (abs >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)} M€`;
  }
  
  if (abs >= 1_000) {
    return `${(amount / 1_000).toFixed(2)} K€`;
  }
  
  return `${amount.toFixed(2)} €`;
}

// ==========================================
// PERCENTAGE FORMATTING
// ==========================================

/**
 * Formater un pourcentage
 * 
 * @example
 * formatPercentage(12.3456) // "+12,35%"
 * formatPercentage(-5.12) // "-5,12%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 2,
  showSign: boolean = true
): string {
  const sign = showSign && value > 0 ? '+' : '';
  const formatted = value.toFixed(decimals);
  return `${sign}${formatted}%`;
}

/**
 * Formater un pourcentage avec couleur (pour UI)
 * Retourne un objet avec text et color
 */
export function formatPercentageWithColor(value: number): {
  text: string;
  color: 'green' | 'red' | 'gray';
} {
  const text = formatPercentage(value);
  
  if (value > 0) return { text, color: 'green' };
  if (value < 0) return { text, color: 'red' };
  return { text, color: 'gray' };
}

// ==========================================
// NUMBER FORMATTING
// ==========================================

/**
 * Formater un nombre avec séparateurs de milliers
 * 
 * @example
 * formatNumber(1234567.89) // "1 234 567,89"
 */
export function formatNumber(
  num: number,
  decimals: number = 2,
  locale: string = 'fr-FR'
): string {
  return num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formater un nombre compact (K, M, B)
 * 
 * @example
 * formatNumberShort(1234567) // "1.23M"
 */
export function formatNumberShort(num: number): string {
  const abs = Math.abs(num);
  
  if (abs >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  
  if (abs >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  
  if (abs >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  
  return num.toFixed(0);
}

// ==========================================
// SCORE FORMATTING
// ==========================================

/**
 * Formater un score
 * 
 * @example
 * formatScore(12345) // "12 345 pts"
 */
export function formatScore(score: number): string {
  return `${formatNumber(score, 0)} pts`;
}

// ==========================================
// CHANGE FORMATTING (Delta)
// ==========================================

/**
 * Formater une variation (delta) avec signe
 * 
 * @example
 * formatChange(123.45) // "+123,45"
 * formatChange(-50.12) // "-50,12"
 */
export function formatChange(change: number, decimals: number = 2): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(decimals)}`;
}

/**
 * Formater une variation avec devise et couleur
 */
export function formatChangeWithCurrency(change: number): {
  text: string;
  color: 'green' | 'red' | 'gray';
} {
  const text = `${formatChange(change)} €`;
  
  if (change > 0) return { text, color: 'green' };
  if (change < 0) return { text, color: 'red' };
  return { text, color: 'gray' };
}

// ==========================================
// QUANTITY FORMATTING
// ==========================================

/**
 * Formater une quantité d'actifs
 * Garde 2 décimales pour les petites quantités, 0 pour les grandes
 * 
 * @example
 * formatQuantity(0.0012) // "0.0012"
 * formatQuantity(100.5) // "100.50"
 * formatQuantity(1000) // "1,000"
 */
export function formatQuantity(quantity: number): string {
  if (quantity < 1) {
    // Garder jusqu'à 8 décimales pour les petites quantités (crypto)
    return quantity.toFixed(8).replace(/\.?0+$/, '');
  }
  
  if (quantity < 100) {
    return formatNumber(quantity, 2);
  }
  
  return formatNumber(quantity, 0);
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Vérifier si un nombre est valide (pas NaN, pas Infinity)
 */
export function isValidNumber(num: any): num is number {
  return typeof num === 'number' && !isNaN(num) && isFinite(num);
}

/**
 * Parser un prix saisi par l'utilisateur (supporte virgule et point)
 * 
 * @example
 * parsePrice("1234.56") // 1234.56
 * parsePrice("1 234,56") // 1234.56
 */
export function parsePrice(value: string): number | null {
  if (!value || value.trim() === '') return null;
  
  // Remplacer virgule par point, retirer espaces
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  
  return isValidNumber(parsed) ? parsed : null;
}
