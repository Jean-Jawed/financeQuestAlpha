/**
 * FINANCEQUEST - API ROUTE: BUY
 * POST /api/trades/buy
 * Acheter un actif (position long)
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { requireOwnership } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games, holdings, transactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateBuy } from '@/lib/game/validations';
import { calculateTransactionPreview, calculatePortfolio } from '@/lib/game/calculations';
import { settleAction } from '@/lib/game/state';
import { getQuote } from '@/lib/market/prices';
import { checkScenarioOrder } from '@/lib/game/scenario-orders';
import { buySchema, validateTradeInputSafe } from '@/lib/game/trade-schemas';
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
    const validation = validateTradeInputSafe(buySchema, body);

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

    // 3. Règles du scénario (ordres et actifs autorisés) et cours actuel,
    //    converti dans la devise de la partie
    const [scenarioError, quote] = await Promise.all([
      checkScenarioOrder(game.scenario, symbol, 'buy'),
      getQuote(symbol, game.currentDate, game.currency),
    ]);

    if (scenarioError) {
      return NextResponse.json({ error: scenarioError }, { status: 400 });
    }

    if (!quote || !quote.price) {
      return NextResponse.json(
        { error: api.priceUnavailable },
        { status: 404 }
      );
    }
    const currentPrice = quote.price;

    // Dans une transaction SQL. Le verrou FOR UPDATE sur la partie
    // sérialise les ordres concurrents (double-clic, onglets multiples) :
    // le second attend la fin du premier et voit le solde à jour.
    const transactionFees = game.settings.transaction_fees;

    const { newBalance, updatedGame, updatedHolding, transaction } = await db.transaction(async (tx) => {
      const [lockedGame] = await tx
        .select()
        .from(games)
        .where(eq(games.id, gameId))
        .for('update');

      // Le prix a été lu pour game.currentDate : refuser si la partie a avancé entre-temps
      if (lockedGame.currentDate !== game.currentDate) {
        throw new ValidationError(api.dateChanged);
      }

      // 4. Portfolio et position existante, lus sous verrou (en parallèle)
      const [portfolioBefore, existingHolding] = await Promise.all([
        calculatePortfolio(gameId, lockedGame.currentDate, tx),
        tx.query.holdings.findFirst({
          where: and(eq(holdings.gameId, gameId), eq(holdings.symbol, symbol), eq(holdings.isShort, false)),
        }),
      ]);

      if (!portfolioBefore) {
        throw new Error('Portfolio calculation failed');
      }

      // 5. Valider l'ordre
      const validationResult = await validateBuy(gameId, symbol, quantity, currentPrice, transactionFees, portfolioBefore, tx);

      if (!validationResult.valid) {
        throw new ValidationError(validationResult.error ?? api.invalidOrder);
      }

      // 6. Calculer les montants
      const preview = calculateTransactionPreview('buy', quantity, currentPrice, transactionFees);
      const newBalance = parseFloat(lockedGame.currentBalance) + preview.balanceChange;

      // 7. Holding : moyenne pondérée du prix de revient si la position existe déjà
      let holdingWrite;

      if (existingHolding) {
        const totalQuantity = parseFloat(existingHolding.quantity) + quantity;
        const totalCost =
          parseFloat(existingHolding.quantity) * parseFloat(existingHolding.averageCost) +
          quantity * currentPrice;

        holdingWrite = tx
          .update(holdings)
          .set({
            quantity: totalQuantity.toFixed(8),
            averageCost: (totalCost / totalQuantity).toFixed(6),
            updatedAt: new Date(),
          })
          .where(eq(holdings.id, existingHolding.id))
          .returning();
      } else {
        holdingWrite = tx
          .insert(holdings)
          .values({
            gameId,
            symbol,
            quantity: quantity.toFixed(8),
            averageCost: currentPrice.toFixed(6),
            isShort: false,
          })
          .returning();
      }

      // 8. Solde, holding et transaction : écritures indépendantes, envoyées ensemble
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
            type: 'buy',
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

      return { newBalance, updatedGame, updatedHolding, transaction };
    });

    // 9. Succès et état de la partie (la page n'a pas à la relire)
    const { state, achievementsUnlocked } = await settleAction(updatedGame);

    return NextResponse.json(
      {
        success: true,
        data: {
          transaction,
          holding: updatedHolding,
          newBalance,
          state,
          achievementsUnlocked,
        },
        message: fmt(api.buyDone, { quantity: f.quantity(quantity), symbol }),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('[API] Buy error:', error);

    if (error instanceof Error && error.message === 'Forbidden: You do not own this resource') {
      return NextResponse.json({ error: api.forbidden }, { status: 403 });
    }

    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
});
