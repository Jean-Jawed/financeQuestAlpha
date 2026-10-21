/**
 * FINANCEQUEST - API ROUTE: SHORT
 * POST /api/trades/short
 * Shorter un actif (ouvrir position short - vente à découvert)
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { requireOwnership } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games, holdings, transactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateShort } from '@/lib/game/validations';
import { calculateTransactionPreview, calculatePortfolio } from '@/lib/game/calculations';
import { checkAndUnlockAchievements } from '@/lib/game/achievements';
import { getPrice } from '@/lib/market/prices';
import { shortSchema, validateTradeInputSafe } from '@/lib/game/trade-schemas';
import { ValidationError } from '@/lib/utils/errors';

// ==========================================
// API HANDLER
// ==========================================

export const POST = withAuth(async (req, { userId }) => {
  try {
    // 1. Parser et valider le body
    const body = await req.json();
    const validation = validateTradeInputSafe(shortSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { gameId, symbol, quantity } = validation.data;

    // 2. Récupérer le game et vérifier ownership
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return NextResponse.json({ error: 'Game non trouvé' }, { status: 404 });
    }

    await requireOwnership(userId, game.userId);

    // 3. Récupérer le prix actuel
    const priceData = await getPrice(symbol, game.currentDate);
    if (!priceData || !priceData.close_price) {
      return NextResponse.json(
        { error: 'Prix non disponible pour cet actif' },
        { status: 404 }
      );
    }
    const currentPrice = priceData.close_price;

    // 4 à 8 : dans une transaction SQL. Le verrou FOR UPDATE sur la partie
    // sérialise les ordres concurrents (double-clic, onglets multiples).
    const allowShorting = game.settings.allow_shorting;
    const transactionFees = game.settings.transaction_fees;

    const { newBalance, updatedHolding, transaction } = await db.transaction(async (tx) => {
      const [lockedGame] = await tx
        .select()
        .from(games)
        .where(eq(games.id, gameId))
        .for('update');

      // 4. Valider l'ordre short (après obtention du verrou)
      const validationResult = await validateShort(gameId, symbol, quantity, currentPrice, allowShorting);

      if (!validationResult.valid) {
        throw new ValidationError(validationResult.error ?? 'Ordre invalide');
      }

      // 5. Calculer les montants
      const preview = calculateTransactionPreview('short', quantity, currentPrice, transactionFees);

      // 6. Mettre à jour le solde (crédité temporairement)
      const newBalance = parseFloat(lockedGame.currentBalance) + preview.balanceChange;

      await tx
        .update(games)
        .set({
          currentBalance: newBalance.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(games.id, gameId));

      // 7. Créer ou mettre à jour le holding short
      const existingShortHolding = await tx.query.holdings.findFirst({
        where: and(eq(holdings.gameId, gameId), eq(holdings.symbol, symbol), eq(holdings.isShort, true)),
      });

      let updatedHolding;

      if (existingShortHolding) {
        // Mettre à jour holding short existant (average cost)
        const totalQuantity = parseFloat(existingShortHolding.quantity) + quantity;
        const totalCost =
          parseFloat(existingShortHolding.quantity) * parseFloat(existingShortHolding.averageCost) +
          quantity * currentPrice;
        const newAverageCost = totalCost / totalQuantity;

        [updatedHolding] = await tx
          .update(holdings)
          .set({
            quantity: totalQuantity.toFixed(8),
            averageCost: newAverageCost.toFixed(6),
            updatedAt: new Date(),
          })
          .where(eq(holdings.id, existingShortHolding.id))
          .returning();
      } else {
        // Créer nouveau holding short
        [updatedHolding] = await tx
          .insert(holdings)
          .values({
            gameId,
            symbol,
            quantity: quantity.toFixed(8),
            averageCost: currentPrice.toFixed(6),
            isShort: true,
          })
          .returning();
      }

      // 8. Enregistrer la transaction
      const [transaction] = await tx
        .insert(transactions)
        .values({
          gameId,
          symbol,
          type: 'short',
          quantity: quantity.toFixed(8),
          price: currentPrice.toFixed(6),
          fee: preview.feeAmount.toFixed(2),
          total: preview.total.toFixed(2),
          transactionDate: lockedGame.currentDate,
        })
        .returning();

      return { newBalance, updatedHolding, transaction };
    });

    console.log(`[API] Short executed: ${quantity} ${symbol} @ ${currentPrice}`);

    // 9. Vérifier achievements
    const achievementsUnlocked = await checkAndUnlockAchievements(gameId);

    // 10. Recalculer portfolio
    const portfolio = await calculatePortfolio(gameId, game.currentDate);

    // 11. Retourner le résultat
    return NextResponse.json(
      {
        success: true,
        data: {
          transaction,
          holding: updatedHolding,
          newBalance,
          portfolio: portfolio
            ? {
              totalValue: portfolio.totalValue,
              returnPercentage: portfolio.returnPercentage,
              portfolioValueLong: portfolio.portfolioValueLong,
              shortPositionsPnl: portfolio.shortPositionsPnl,
            }
            : undefined,
          achievementsUnlocked: achievementsUnlocked.map((a) => ({
            name: a.achievement.name,
            points: a.achievement.points,
          })),
        },
        message: `Short ouvert: ${quantity} ${symbol}`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('[API] Short error:', error);

    if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
});
