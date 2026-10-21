/**
 * FINANCEQUEST - API ROUTE: COVER
 * POST /api/trades/cover
 * Couvrir une position short (fermer vente à découvert)
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { requireOwnership } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games, holdings, transactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateCover } from '@/lib/game/validations';
import { calculateTransactionPreview, calculatePortfolio } from '@/lib/game/calculations';
import { checkAndUnlockAchievements } from '@/lib/game/achievements';
import { getPrice } from '@/lib/market/prices';
import { coverSchema, validateTradeInputSafe } from '@/lib/game/trade-schemas';
import { ValidationError } from '@/lib/utils/errors';

// ==========================================
// API HANDLER
// ==========================================

export const POST = withAuth(async (req, { userId }) => {
  try {
    // 1. Parser et valider le body
    const body = await req.json();
    const validation = validateTradeInputSafe(coverSchema, body);

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

    // 4 à 10 : dans une transaction SQL. Le verrou FOR UPDATE sur la partie
    // sérialise les ordres concurrents : impossible de couvrir deux fois
    // la même position.
    const transactionFees = game.settings.transaction_fees;

    const { newBalance, updatedHolding, transaction, pnl } = await db.transaction(async (tx) => {
      const [lockedGame] = await tx
        .select()
        .from(games)
        .where(eq(games.id, gameId))
        .for('update');

      // 4. Valider l'ordre cover (après obtention du verrou)
      const validationResult = await validateCover(
        gameId,
        symbol,
        quantity,
        currentPrice,
        transactionFees
      );

      if (!validationResult.valid) {
        throw new ValidationError(validationResult.error ?? 'Ordre invalide');
      }

      // 5. Récupérer le holding short
      const shortHolding = await tx.query.holdings.findFirst({
        where: and(eq(holdings.gameId, gameId), eq(holdings.symbol, symbol), eq(holdings.isShort, true)),
      });

      if (!shortHolding) {
        throw new ValidationError('Position short non trouvée');
      }

      // 6. Calculer les montants
      const preview = calculateTransactionPreview('cover', quantity, currentPrice, transactionFees);

      // 7. Calculer le P&L
      const averageCost = parseFloat(shortHolding.averageCost);
      const pnl = (averageCost - currentPrice) * quantity;

      console.log(
        `[API] Cover P&L: (${averageCost} - ${currentPrice}) × ${quantity} = ${pnl.toFixed(2)}`
      );

      // 8. Mettre à jour le solde
      const newBalance = parseFloat(lockedGame.currentBalance) + preview.balanceChange;

      await tx
        .update(games)
        .set({
          currentBalance: newBalance.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(games.id, gameId));

      // 9. Mettre à jour ou supprimer le holding short
      const remainingQuantity = parseFloat(shortHolding.quantity) - quantity;
      let updatedHolding;

      if (remainingQuantity <= 0.00000001) {
        // Supprimer le holding si quantité = 0
        await tx.delete(holdings).where(eq(holdings.id, shortHolding.id));
        updatedHolding = null;
      } else {
        // Réduire la quantité
        [updatedHolding] = await tx
          .update(holdings)
          .set({
            quantity: remainingQuantity.toFixed(8),
            updatedAt: new Date(),
          })
          .where(eq(holdings.id, shortHolding.id))
          .returning();
      }

      // 10. Enregistrer la transaction
      const [transaction] = await tx
        .insert(transactions)
        .values({
          gameId,
          symbol,
          type: 'cover',
          quantity: quantity.toFixed(8),
          price: currentPrice.toFixed(6),
          fee: preview.feeAmount.toFixed(2),
          total: preview.total.toFixed(2),
          transactionDate: lockedGame.currentDate,
        })
        .returning();

      return { newBalance, updatedHolding, transaction, pnl };
    });

    console.log(`[API] Cover executed: ${quantity} ${symbol} @ ${currentPrice}, P&L: ${pnl.toFixed(2)}`);

    // 11. Vérifier achievements
    const achievementsUnlocked = await checkAndUnlockAchievements(gameId);

    // 12. Recalculer portfolio
    const portfolio = await calculatePortfolio(gameId, game.currentDate);

    // 13. Retourner le résultat
    return NextResponse.json(
      {
        success: true,
        data: {
          transaction,
          holding: updatedHolding,
          newBalance,
          pnl: pnl.toFixed(2),
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
        message: `Position short couverte: ${quantity} ${symbol} (P&L: ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}€)`,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('[API] Cover error:', error);

    if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
});
