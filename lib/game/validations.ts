/**
 * FINANCEQUEST - GAME VALIDATIONS
 * Validation des ordres de trading (buy/sell/short/cover)
 */

import { db, type DbExecutor } from '@/lib/db';
import { games, holdings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { isValidSymbol } from '@/lib/market/assets';
import { getPriceCoverage } from '@/lib/market/calendar';
import { getApiI18n } from '@/lib/i18n/server';
import { checkShortMargin } from './portfolio-math';
import type { PortfolioCalculation } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Parties en cours simultanées par joueur */
export const MAX_ACTIVE_GAMES = 5;

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

/**
 * Valider un ordre d'ACHAT (buy)
 *
 * @param portfolio - Portfolio courant : l'achat est limité au cash disponible
 *   (le produit des shorts est bloqué en garantie)
 */
export async function validateBuy(
  gameId: string,
  symbol: string,
  quantity: number,
  price: number,
  transactionFees: number,
  portfolio: Pick<PortfolioCalculation, 'availableCash'>,
  executor: DbExecutor = db
): Promise<ValidationResult> {
  const { api, fmt, f } = await getApiI18n();

  try {
    // 1. Vérifier que quantity > 0
    if (quantity <= 0) {
      return { valid: false, error: api.quantityPositive };
    }

    // 2. Symbole, partie et position (lectures indépendantes, en parallèle)
    const [symbolValid, game, existingShortPosition] = await Promise.all([
      isValidSymbol(symbol, true),
      executor.query.games.findFirst({
        where: eq(games.id, gameId),
      }),
      executor.query.holdings.findFirst({
        where: and(
          eq(holdings.gameId, gameId),
          eq(holdings.symbol, symbol),
          eq(holdings.isShort, true)
        ),
      }),
    ]);

    if (!symbolValid) {
      return { valid: false, error: api.invalidSymbol };
    }

    if (!game) {
      return { valid: false, error: api.gameNotFound };
    }

    // 4. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { valid: false, error: api.gameInactive };
    }

    // 5. Vérifier qu'il n'y a pas de position short sur ce symbole
    if (existingShortPosition) {
      return {
        valid: false,
        error: api.buyBlockedByShort,
      };
    }

    // 6. Calculer le coût total (prix × quantité + frais)
    const subtotal = price * quantity;
    const feeAmount = subtotal * (transactionFees / 100);
    const totalCost = subtotal + feeAmount;

    // 7. Vérifier que le cash disponible est suffisant
    if (portfolio.availableCash < totalCost) {
      return {
        valid: false,
        error: fmt(api.insufficientCash, { required: f.currency(totalCost, game.currency), available: f.currency(Math.max(portfolio.availableCash, 0), game.currency) }),
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Validations] Error validating buy:', error);
    return { valid: false, error: api.validationError };
  }
}

/**
 * Valider un ordre de VENTE (sell)
 */
export async function validateSell(
  gameId: string,
  symbol: string,
  quantity: number,
  executor: DbExecutor = db
): Promise<ValidationResult> {
  const { api, fmt, f } = await getApiI18n();

  try {
    // 1. Vérifier que quantity > 0
    if (quantity <= 0) {
      return { valid: false, error: api.quantityPositive };
    }

    // 2. Symbole, partie et position (lectures indépendantes, en parallèle)
    const [symbolValid, game, holding] = await Promise.all([
      isValidSymbol(symbol),
      executor.query.games.findFirst({
        where: eq(games.id, gameId),
      }),
      executor.query.holdings.findFirst({
        where: and(
          eq(holdings.gameId, gameId),
          eq(holdings.symbol, symbol),
          eq(holdings.isShort, false)
        ),
      }),
    ]);

    if (!symbolValid) {
      return { valid: false, error: api.invalidSymbol };
    }

    if (!game) {
      return { valid: false, error: api.gameNotFound };
    }

    // 4. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { valid: false, error: api.gameInactive };
    }

    // 5. Vérifier qu'il y a une position long sur ce symbole
    if (!holding) {
      return {
        valid: false,
        error: api.notHeld,
      };
    }

    // 6. Vérifier que la quantité détenue est suffisante
    const ownedQuantity = parseFloat(holding.quantity);
    if (ownedQuantity < quantity) {
      return {
        valid: false,
        error: fmt(api.insufficientQuantity, { held: f.quantity(ownedQuantity), requested: f.quantity(quantity) }),
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Validations] Error validating sell:', error);
    return { valid: false, error: api.validationError };
  }
}

/**
 * Valider un ordre de SHORT (vente à découvert)
 *
 * @param portfolio - Portfolio courant : la valeur nette doit couvrir la marge
 *   sur l'ensemble des shorts (voir checkShortMargin)
 */
export async function validateShort(
  gameId: string,
  symbol: string,
  quantity: number,
  price: number,
  allowShorting: boolean,
  transactionFees: number,
  portfolio: Pick<PortfolioCalculation, 'totalValue' | 'shortLiability' | 'availableCash'>,
  executor: DbExecutor = db
): Promise<ValidationResult> {
  const { api, fmt, f } = await getApiI18n();

  try {
    // 1. Vérifier que le short selling est activé
    if (!allowShorting) {
      return {
        valid: false,
        error: api.shortDisabled,
      };
    }

    // 2. Vérifier que quantity > 0
    if (quantity <= 0) {
      return { valid: false, error: api.quantityPositive };
    }

    // 3. Symbole, partie et position (lectures indépendantes, en parallèle)
    const [symbolValid, game, existingLongPosition] = await Promise.all([
      isValidSymbol(symbol, true),
      executor.query.games.findFirst({
        where: eq(games.id, gameId),
      }),
      executor.query.holdings.findFirst({
        where: and(
          eq(holdings.gameId, gameId),
          eq(holdings.symbol, symbol),
          eq(holdings.isShort, false)
        ),
      }),
    ]);

    if (!symbolValid) {
      return { valid: false, error: api.invalidSymbol };
    }

    if (!game) {
      return { valid: false, error: api.gameNotFound };
    }

    // 5. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { valid: false, error: api.gameInactive };
    }

    // 6. Vérifier qu'il n'y a pas de position long sur ce symbole
    if (existingLongPosition) {
      return {
        valid: false,
        error: api.shortBlockedByLong,
      };
    }

    // 7. Les frais sont prélevés sur le cash disponible
    const notional = price * quantity;
    const feeAmount = notional * (transactionFees / 100);

    if (portfolio.availableCash < feeAmount) {
      return {
        valid: false,
        error: fmt(api.insufficientCashForFees, { required: f.currency(feeAmount, game.currency), available: f.currency(Math.max(portfolio.availableCash, 0), game.currency) }),
      };
    }

    // 8. Vérifier la marge : valeur nette ≥ 50 % de la dette totale des shorts
    const marginShortfall = checkShortMargin(portfolio, notional, feeAmount);

    if (marginShortfall) {
      return {
        valid: false,
        error: fmt(api.insufficientMargin, { required: f.currency(marginShortfall.required, game.currency), available: f.currency(Math.max(marginShortfall.equity, 0), game.currency) }),
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Validations] Error validating short:', error);
    return { valid: false, error: api.validationError };
  }
}

/**
 * Valider un ordre de COVER (fermeture position short)
 */
export async function validateCover(
  gameId: string,
  symbol: string,
  quantity: number,
  price: number,
  transactionFees: number,
  executor: DbExecutor = db
): Promise<ValidationResult> {
  const { api, fmt, f } = await getApiI18n();

  try {
    // 1. Vérifier que quantity > 0
    if (quantity <= 0) {
      return { valid: false, error: api.quantityPositive };
    }

    // 2. Symbole, partie et position (lectures indépendantes, en parallèle)
    const [symbolValid, game, shortPosition] = await Promise.all([
      isValidSymbol(symbol),
      executor.query.games.findFirst({
        where: eq(games.id, gameId),
      }),
      executor.query.holdings.findFirst({
        where: and(
          eq(holdings.gameId, gameId),
          eq(holdings.symbol, symbol),
          eq(holdings.isShort, true)
        ),
      }),
    ]);

    if (!symbolValid) {
      return { valid: false, error: api.invalidSymbol };
    }

    if (!game) {
      return { valid: false, error: api.gameNotFound };
    }

    // 4. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { valid: false, error: api.gameInactive };
    }

    // 5. Vérifier qu'il y a une position short sur ce symbole
    if (!shortPosition) {
      return {
        valid: false,
        error: api.noShortPosition,
      };
    }

    // 6. Vérifier que la quantité à couvrir est suffisante
    const shortQuantity = parseFloat(shortPosition.quantity);
    if (shortQuantity < quantity) {
      return {
        valid: false,
        error: fmt(api.insufficientShortQuantity, { held: f.quantity(shortQuantity), requested: f.quantity(quantity) }),
      };
    }

    // 7. Calculer le coût total pour racheter
    const subtotal = price * quantity;
    const feeAmount = subtotal * (transactionFees / 100);
    const totalCost = subtotal + feeAmount;

    // 8. Vérifier que le solde est suffisant
    const currentBalance = parseFloat(game.currentBalance);
    if (currentBalance < totalCost) {
      return {
        valid: false,
        error: fmt(api.insufficientCashToCover, { required: f.currency(totalCost, game.currency), available: f.currency(currentBalance, game.currency) }),
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Validations] Error validating cover:', error);
    return { valid: false, error: api.validationError };
  }
}

/**
 * Valider la création d'un game
 */
export async function validateGameCreation(
  userId: string,
  startDate: string
): Promise<ValidationResult> {
  const { api, fmt, f } = await getApiI18n();

  try {
    // 1. Vérifier format de date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return { valid: false, error: api.invalidDate };
    }

    // 2. Vérifier que la date est dans la plage couverte par la base de prix
    //    (comparaison de chaînes YYYY-MM-DD : pas de problème de fuseau horaire)
    const coverage = await getPriceCoverage();

    if (startDate < coverage.start || startDate >= coverage.end) {
      return {
        valid: false,
        error: fmt(api.startDateRange, { start: f.date(coverage.start), end: f.date(coverage.end) }),
      };
    }

    // 3. Vérifier le nombre de games actives de l'utilisateur (limite 5)
    const activeGames = await db.query.games.findMany({
      where: and(eq(games.userId, userId), eq(games.status, 'active')),
    });

    if (activeGames.length >= MAX_ACTIVE_GAMES) {
      return {
        valid: false,
        error: fmt(api.activeGamesLimit, { max: MAX_ACTIVE_GAMES }),
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Validations] Error validating game creation:', error);
    return { valid: false, error: api.validationError };
  }
}
