/**
 * FINANCEQUEST - GAME VALIDATIONS
 * Validation des ordres de trading (buy/sell/short/cover)
 */

import { db } from '@/lib/db';
import { games, holdings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { isValidSymbol } from '@/lib/market/assets';
import type { Game } from '@/types/database';

// ==========================================
// TYPES
// ==========================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================

/**
 * Valider un ordre d'ACHAT (buy)
 */
export async function validateBuy(
  gameId: string,
  symbol: string,
  quantity: number,
  price: number,
  transactionFees: number
): Promise<ValidationResult> {
  try {
    // 1. Vérifier que quantity > 0
    if (quantity <= 0) {
      return { valid: false, error: 'La quantité doit être supérieure à 0' };
    }

    // 2. Vérifier que le symbole est valide
    if (!isValidSymbol(symbol)) {
      return { valid: false, error: 'Symbole invalide' };
    }

    // 3. Récupérer le game
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { valid: false, error: 'Game non trouvé' };
    }

    // 4. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { valid: false, error: 'Le game n\'est pas actif' };
    }

    // 5. Vérifier qu'il n'y a pas de position short sur ce symbole
    const existingShortPosition = await db.query.holdings.findFirst({
      where: and(
        eq(holdings.gameId, gameId),
        eq(holdings.symbol, symbol),
        eq(holdings.isShort, true)
      ),
    });

    if (existingShortPosition) {
      return {
        valid: false,
        error: 'Impossible d\'acheter : vous avez une position short active sur cet actif',
      };
    }

    // 6. Calculer le coût total (prix × quantité + frais)
    const subtotal = price * quantity;
    const feeAmount = subtotal * (transactionFees / 100);
    const totalCost = subtotal + feeAmount;

    // 7. Vérifier que le solde est suffisant
    const currentBalance = parseFloat(game.currentBalance);
    if (currentBalance < totalCost) {
      return {
        valid: false,
        error: `Solde insuffisant. Requis: ${totalCost.toFixed(2)}€, Disponible: ${currentBalance.toFixed(2)}€`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Validations] Error validating buy:', error);
    return { valid: false, error: 'Erreur lors de la validation' };
  }
}

/**
 * Valider un ordre de VENTE (sell)
 */
export async function validateSell(
  gameId: string,
  symbol: string,
  quantity: number
): Promise<ValidationResult> {
  try {
    // 1. Vérifier que quantity > 0
    if (quantity <= 0) {
      return { valid: false, error: 'La quantité doit être supérieure à 0' };
    }

    // 2. Vérifier que le symbole est valide
    if (!isValidSymbol(symbol)) {
      return { valid: false, error: 'Symbole invalide' };
    }

    // 3. Récupérer le game
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { valid: false, error: 'Game non trouvé' };
    }

    // 4. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { valid: false, error: 'Le game n\'est pas actif' };
    }

    // 5. Vérifier qu'il y a une position long sur ce symbole
    const holding = await db.query.holdings.findFirst({
      where: and(
        eq(holdings.gameId, gameId),
        eq(holdings.symbol, symbol),
        eq(holdings.isShort, false)
      ),
    });

    if (!holding) {
      return {
        valid: false,
        error: 'Vous ne détenez pas cet actif',
      };
    }

    // 6. Vérifier que la quantité détenue est suffisante
    const ownedQuantity = parseFloat(holding.quantity);
    if (ownedQuantity < quantity) {
      return {
        valid: false,
        error: `Quantité insuffisante. Détenu: ${ownedQuantity}, Demandé: ${quantity}`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Validations] Error validating sell:', error);
    return { valid: false, error: 'Erreur lors de la validation' };
  }
}

/**
 * Valider un ordre de SHORT (vente à découvert)
 */
export async function validateShort(
  gameId: string,
  symbol: string,
  quantity: number,
  price: number,
  allowShorting: boolean
): Promise<ValidationResult> {
  try {
    // 1. Vérifier que le short selling est activé
    if (!allowShorting) {
      return {
        valid: false,
        error: 'La vente à découvert n\'est pas activée pour ce game',
      };
    }

    // 2. Vérifier que quantity > 0
    if (quantity <= 0) {
      return { valid: false, error: 'La quantité doit être supérieure à 0' };
    }

    // 3. Vérifier que le symbole est valide
    if (!isValidSymbol(symbol)) {
      return { valid: false, error: 'Symbole invalide' };
    }

    // 4. Récupérer le game
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { valid: false, error: 'Game non trouvé' };
    }

    // 5. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { valid: false, error: 'Le game n\'est pas actif' };
    }

    // 6. Vérifier qu'il n'y a pas de position long sur ce symbole
    const existingLongPosition = await db.query.holdings.findFirst({
      where: and(
        eq(holdings.gameId, gameId),
        eq(holdings.symbol, symbol),
        eq(holdings.isShort, false)
      ),
    });

    if (existingLongPosition) {
      return {
        valid: false,
        error: 'Impossible de shorter : vous détenez déjà cet actif',
      };
    }

    // 7. Vérifier le margin requirement (simplifié : 50% de la valeur)
    const totalValue = price * quantity;
    const marginRequired = totalValue * 0.5;
    const currentBalance = parseFloat(game.currentBalance);

    if (currentBalance < marginRequired) {
      return {
        valid: false,
        error: `Marge insuffisante. Requis: ${marginRequired.toFixed(2)}€, Disponible: ${currentBalance.toFixed(2)}€`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Validations] Error validating short:', error);
    return { valid: false, error: 'Erreur lors de la validation' };
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
  transactionFees: number
): Promise<ValidationResult> {
  try {
    // 1. Vérifier que quantity > 0
    if (quantity <= 0) {
      return { valid: false, error: 'La quantité doit être supérieure à 0' };
    }

    // 2. Vérifier que le symbole est valide
    if (!isValidSymbol(symbol)) {
      return { valid: false, error: 'Symbole invalide' };
    }

    // 3. Récupérer le game
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return { valid: false, error: 'Game non trouvé' };
    }

    // 4. Vérifier que le game est actif
    if (game.status !== 'active') {
      return { valid: false, error: 'Le game n\'est pas actif' };
    }

    // 5. Vérifier qu'il y a une position short sur ce symbole
    const shortPosition = await db.query.holdings.findFirst({
      where: and(
        eq(holdings.gameId, gameId),
        eq(holdings.symbol, symbol),
        eq(holdings.isShort, true)
      ),
    });

    if (!shortPosition) {
      return {
        valid: false,
        error: 'Vous n\'avez pas de position short sur cet actif',
      };
    }

    // 6. Vérifier que la quantité à couvrir est suffisante
    const shortQuantity = parseFloat(shortPosition.quantity);
    if (shortQuantity < quantity) {
      return {
        valid: false,
        error: `Quantité insuffisante. Position short: ${shortQuantity}, Demandé: ${quantity}`,
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
        error: `Solde insuffisant pour couvrir. Requis: ${totalCost.toFixed(2)}€, Disponible: ${currentBalance.toFixed(2)}€`,
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Validations] Error validating cover:', error);
    return { valid: false, error: 'Erreur lors de la validation' };
  }
}

/**
 * Valider la création d'un game
 */
export async function validateGameCreation(
  userId: string,
  startDate: string
): Promise<ValidationResult> {
  try {
    // 1. Vérifier format de date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return { valid: false, error: 'Format de date invalide (YYYY-MM-DD)' };
    }

    // 2. Vérifier que la date est entre 2020-01-01 et aujourd'hui
    const start = new Date(startDate);
    const minDate = new Date('2020-01-01');
    const today = new Date();

    if (start < minDate) {
      return { valid: false, error: 'La date de départ doit être après le 1er janvier 2020' };
    }

    if (start > today) {
      return { valid: false, error: 'La date de départ ne peut pas être dans le futur' };
    }

    // 3. Vérifier le nombre de games actives de l'utilisateur (limite 5)
    const activeGames = await db.query.games.findMany({
      where: and(eq(games.userId, userId), eq(games.status, 'active')),
    });

    if (activeGames.length >= 5) {
      return {
        valid: false,
        error: 'Limite de 5 parties actives atteinte. Terminez ou mettez en pause une partie existante.',
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Validations] Error validating game creation:', error);
    return { valid: false, error: 'Erreur lors de la validation' };
  }
}
