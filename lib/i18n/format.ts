/**
 * FINANCEQUEST - I18N: FORMATS
 * Variables dans les textes, et formats de nombres, devises et dates selon la langue
 */

import { INTL_LOCALE, type Locale } from './config';
import { formatCurrency } from '@/lib/utils/formatting';
import { formatDateDisplay, formatDateShort } from '@/lib/utils/dates';

/**
 * Remplacer les variables {nom} d'un texte
 *
 * @example
 * fmt('Bonjour, {name}', { name: 'Ada' }) // "Bonjour, Ada"
 */
export function fmt(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}

/**
 * Choisir la forme du singulier ou du pluriel
 * (« 1 valeur », « 0 valeur » en français ; « 0 values » en anglais)
 */
export function plural(locale: Locale, count: number, one: string, other: string): string {
  const category = new Intl.PluralRules(INTL_LOCALE[locale]).select(count);
  return fmt(category === 'one' ? one : other, { count: formatNumberFor(locale, count, 0) });
}

function formatNumberFor(locale: Locale, value: number, decimals: number): string {
  return value.toLocaleString(INTL_LOCALE[locale], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formateurs liés à une langue
 */
export function createFormatters(locale: Locale) {
  const intl = INTL_LOCALE[locale];

  return {
    /** 1 234,56 $US (fr) · US$1,234.56 (en) */
    currency: (value: number, currency: string) => formatCurrency(value, currency, intl),
    /** 1 234,5 (fr) · 1,234.5 (en) */
    number: (value: number, decimals = 2) => formatNumberFor(locale, value, decimals),
    /** +12,50 % (fr) · +12.50% (en) ; signe + optionnel */
    percent: (value: number, decimals = 2, showSign = true) => {
      const sign = showSign && value > 0 ? '+' : '';
      const formatted = formatNumberFor(locale, value, decimals);
      // Espace insécable avant % en français
      return locale === 'fr' ? `${sign}${formatted} %` : `${sign}${formatted}%`;
    },
    /** 15 juin 2023 (fr) · June 15, 2023 (en) */
    date: (date: string) => formatDateDisplay(date, intl),
    /** 15/06/2023 (fr) · 6/15/2023 (en) */
    dateShort: (date: string) => formatDateShort(date, intl),
    /** Quantité d'actifs : jusqu'à 8 décimales pour les cryptos */
    quantity: (value: number) =>
      value.toLocaleString(intl, { maximumFractionDigits: value < 1 ? 8 : 4 }),
  };
}

export type Formatters = ReturnType<typeof createFormatters>;
