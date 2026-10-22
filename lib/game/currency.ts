/**
 * FINANCEQUEST - GAME CURRENCY
 * Devises de jeu et conversion (fonctions pures, utilisables côté client)
 *
 * Les prix restent stockés dans la devise de cotation de chaque actif
 * (base prix : assets.currency_id). Une partie a une devise de jeu
 * (games.currency) : solde, coûts moyens et transactions sont exprimés
 * dans cette devise, au taux de change du jour simulé.
 */

// ==========================================
// DEVISES DE JEU
// ==========================================

export const GAME_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'] as const;

export type GameCurrency = (typeof GAME_CURRENCIES)[number];

export const DEFAULT_GAME_CURRENCY: GameCurrency = 'EUR';

/** Capital de départ : un montant rond, d'ordre de grandeur comparable */
export const STARTING_CAPITAL: Record<GameCurrency, number> = {
  EUR: 10_000,
  USD: 10_000,
  GBP: 10_000,
  CHF: 10_000,
  JPY: 1_500_000,
  CAD: 15_000,
  AUD: 15_000,
};

export function isGameCurrency(value: unknown): value is GameCurrency {
  return typeof value === 'string' && (GAME_CURRENCIES as readonly string[]).includes(value);
}

// ==========================================
// CONVERSION
// ==========================================

/** Unités de chaque devise pour 1 USD (USD = 1), à une date donnée */
export type UsdRates = Record<string, number>;

/**
 * Taux de conversion : unités de `to` pour 1 unité de `from`
 * Pivot par le dollar, seule devise cotée contre toutes les autres en base
 *
 * @returns null si l'une des devises n'a pas de taux
 */
export function fxRate(from: string, to: string, rates: UsdRates): number | null {
  if (from === to) return 1;
  const fromPerUsd = rates[from];
  const toPerUsd = rates[to];
  if (!fromPerUsd || !toPerUsd) return null;
  return toPerUsd / fromPerUsd;
}
