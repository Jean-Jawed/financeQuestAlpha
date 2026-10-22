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
import { calculateTransactionPreview } from '@/lib/game/calculations';
import { settleAction } from '@/lib/game/state';
import { getQuote } from '@/lib/market/prices';
import { coverSchema, validateTradeInputSafe } from '@/lib/game/trade-schemas';
import { ValidationError } from '@/lib/utils/errors';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// API HANDLER
// ==========================================

export const POST = withAuth(async (req, { userId }) => {
  const { api, fmt, f } = await getApiI18n();

  try {
    // 1. Parser et valider le body
    const body = await req.json();
    const validation = validateTradeInputSafe(coverSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: api.validationFailed, details: validation.errors },
        { status: 400 }
      );
    }

    const { gameId, symbol, quantity } = validation.data;

    // 2. Récupérer le game et vérifier ownership
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return NextResponse.json({ error: api.gameNotFound }, { status: 404 });
    }

    await requireOwnership(userId, game.userId);

    // 3. Récupérer le cours actuel, converti dans la devise de la partie
    const quote = await getQuote(symbol, game.currentDate, game.currency);
    if (!quote || !quote.price) {
      return NextResponse.json(
        { error: api.priceUnavailable },
        { status: 404 }
      );
    }
    const currentPrice = quote.price;

    // Dans une transaction SQL. Le verrou FOR UPDATE sur la partie
    // sérialise les ordres concurrents : impossible de couvrir deux fois
    // la même position.
    const transactionFees = game.settings.transaction_fees;

    const { newBalance, updatedGame, updatedHolding, transaction, pnl } = await db.transaction(async (tx) => {
      const [lockedGame] = await tx
        .select()
        .from(games)
        .where(eq(games.id, gameId))
        .for('update');

      // Le prix a été lu pour game.currentDate : refuser si la partie a avancé entre-temps
      if (lockedGame.currentDate !== game.currentDate) {
        throw new ValidationError(api.dateChanged);
      }

      // 4. Valider l'ordre et lire la position, sous verrou (en parallèle)
      const [validationResult, holding] = await Promise.all([
        validateCover(gameId, symbol, quantity, currentPrice, transactionFees, tx),
        tx.query.holdings.findFirst({
          where: and(eq(holdings.gameId, gameId), eq(holdings.symbol, symbol), eq(holdings.isShort, true)),
        }),
      ]);

      if (!validationResult.valid) {
        throw new ValidationError(validationResult.error ?? api.invalidOrder);
      }

      if (!holding) {
        throw new ValidationError(api.positionNotFound);
      }

      // 5. Calculer les montants
      const preview = calculateTransactionPreview('cover', quantity, currentPrice, transactionFees);
      const newBalance = parseFloat(lockedGame.currentBalance) + preview.balanceChange;

      // P&L réalisé (brut, hors frais)
      const averageCost = parseFloat(holding.averageCost);
      const pnl = (averageCost - currentPrice) * quantity;

      // 6. Réduire le holding, ou le supprimer s'il est soldé
      const remainingQuantity = parseFloat(holding.quantity) - quantity;
      const holdingWrite =
        remainingQuantity <= 0.00000001
          ? tx.delete(holdings).where(eq(holdings.id, holding.id)).then(() => [null])
          : tx
              .update(holdings)
              .set({
                quantity: remainingQuantity.toFixed(8),
                updatedAt: new Date(),
              })
              .where(eq(holdings.id, holding.id))
              .returning();

      // 7. Solde, holding et transaction : écritures indépendantes, envoyées ensemble
      const [[updatedGame], [updatedHolding], [transaction]] = await Promise.all([
        tx
          .update(games)
          .set({
            currentBalance: newBalance.toFixed(2),
            updatedAt: new Date(),
          })
          .where(eq(games.id, gameId))
          .returning(),
        holdingWrite,
        tx
          .insert(transactions)
          .values({
            gameId,
            symbol,
            type: 'cover',
            quantity: quantity.toFixed(8),
            price: currentPrice.toFixed(6),
            assetCurrency: quote.assetCurrency,
            assetPrice: quote.assetPrice.toFixed(6),
            fxRate: quote.fxRate.toFixed(10),
            fee: preview.feeAmount.toFixed(2),
            total: preview.total.toFixed(2),
            transactionDate: lockedGame.currentDate,
          })
          .returning(),
      ]);

      return { newBalance, updatedGame, updatedHolding, transaction, pnl };
    });

    // 8. Succès et état de la partie (la page n'a pas à la relire)
    const { state, achievementsUnlocked } = await settleAction(updatedGame);

    return NextResponse.json(
      {
        success: true,
        data: {
          transaction,
          holding: updatedHolding,
          newBalance,
          pnl: pnl.toFixed(2),
          state,
          achievementsUnlocked,
        },
        message: fmt(api.coverDone, { quantity: f.quantity(quantity), symbol }),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('[API] Cover error:', error);

    if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
      return NextResponse.json({ error: api.forbidden }, { status: 403 });
    }

    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
});
