/**
 * FINANCEQUEST - API ROUTE: SELL
 * POST /api/trades/sell
 * Vendre un actif (fermer position long)
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { requireOwnership } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games, holdings, transactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateSell } from '@/lib/game/validations';
import { calculateTransactionPreview, calculatePortfolio } from '@/lib/game/calculations';
import { checkAndUnlockAchievements } from '@/lib/game/achievements';
import { getPrice } from '@/lib/market/cache';
import { sellSchema, validateTradeInputSafe } from '@/lib/game/trade-schemas';

// ==========================================
// API HANDLER
// ==========================================

export const POST = withAuth(async (req, { userId }) => {
  try {
    // 1. Parser et valider le body
    const body = await req.json();
    const validation = validateTradeInputSafe(sellSchema, body);

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

    // 3. Valider l'ordre de vente
    const validationResult = await validateSell(gameId, symbol, quantity);

    if (!validationResult.valid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    // 4. Récupérer le prix actuel
    const currentPrice = await getPrice(symbol, game.currentDate);
    if (!currentPrice) {
      return NextResponse.json(
        { error: 'Prix non disponible pour cet actif' },
        { status: 404 }
      );
    }

    // 5. Récupérer le holding
    const holding = await db.query.holdings.findFirst({
      where: and(eq(holdings.gameId, gameId), eq(holdings.symbol, symbol), eq(holdings.isShort, false)),
    });

    if (!holding) {
      return NextResponse.json({ error: 'Position non trouvée' }, { status: 404 });
    }

    // 6. Calculer les montants
    const transactionFees = game.settings.transaction_fees;
    const preview = calculateTransactionPreview('sell', quantity, currentPrice, transactionFees);

    // 7. Mettre à jour le solde
    const newBalance = parseFloat(game.currentBalance) + preview.balanceChange;

    await db
      .update(games)
      .set({
        currentBalance: newBalance.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId));

    // 8. Mettre à jour ou supprimer le holding
    const remainingQuantity = parseFloat(holding.quantity) - quantity;
    let updatedHolding;

    if (remainingQuantity <= 0.00000001) {
      // Supprimer le holding si quantité = 0
      await db.delete(holdings).where(eq(holdings.id, holding.id));
      updatedHolding = null;
    } else {
      // Réduire la quantité
      [updatedHolding] = await db
        .update(holdings)
        .set({
          quantity: remainingQuantity.toFixed(8),
          updatedAt: new Date(),
        })
        .where(eq(holdings.id, holding.id))
        .returning();
    }

    // 9. Enregistrer la transaction
    const [transaction] = await db
      .insert(transactions)
      .values({
        gameId,
        symbol,
        type: 'sell',
        quantity: quantity.toFixed(8),
        price: currentPrice.toFixed(2),
        fee: preview.feeAmount.toFixed(2),
        total: preview.total.toFixed(2),
        transactionDate: game.currentDate,
      })
      .returning();

    console.log(`[API] Sell executed: ${quantity} ${symbol} @ ${currentPrice}`);

    // 10. Vérifier achievements
    const achievementsUnlocked = await checkAndUnlockAchievements(gameId);

    // 11. Recalculer portfolio
    const portfolio = await calculatePortfolio(gameId, game.currentDate);

    // 12. Retourner le résultat
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
        message: `Vente réussie: ${quantity} ${symbol}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Sell error:', error);

    if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
});
