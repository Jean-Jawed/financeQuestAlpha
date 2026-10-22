/**
 * FINANCEQUEST - FIN DE PARTIE
 * Liquidation des positions au cours de clôture (frais compris), puis
 * clôture de la partie : valeur et rendement finaux, raison de fin
 */

import { db } from '@/lib/db';
import { games, holdings, transactions, type Game } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getQuotes } from '@/lib/market/prices';
import { calculateTransactionPreview } from './portfolio-math';
import type { END_REASONS } from '@/lib/db/schema';

export type EndReason = (typeof END_REASONS)[number];

/**
 * Terminer une partie
 * Toutes les positions sont soldées à la date en jeu : les longues vendues,
 * les courtes rachetées. La partie passe en « completed » avec sa valeur finale.
 *
 * @returns La partie terminée, ou null si elle l'était déjà (double clic, séance concurrente)
 */
export async function endGame(gameId: string, reason: EndReason): Promise<Game | null> {
  return db.transaction(async (tx) => {
    // Verrou : un ordre ou une séance concurrente attend la fin de la clôture
    const [game] = await tx.select().from(games).where(eq(games.id, gameId)).for('update');

    if (!game || game.status === 'completed') {
      return null;
    }

    const positions = await tx.query.holdings.findMany({ where: eq(holdings.gameId, gameId) });
    const quotes = await getQuotes([...new Set(positions.map((h) => h.symbol))], game.currentDate, game.currency);
    const feeRate = game.settings.transaction_fees;

    let balance = parseFloat(game.currentBalance);
    const closingOrders: (typeof transactions.$inferInsert)[] = [];

    for (const position of positions) {
      const quantity = parseFloat(position.quantity);
      const quote = quotes.get(position.symbol);
      // Sans cours ce jour-là (actif suspendu), la position est soldée à son coût moyen
      const price = quote?.price ?? parseFloat(position.averageCost);
      const type = position.isShort ? 'cover' : 'sell';
      const preview = calculateTransactionPreview(type, quantity, price, feeRate);

      balance += preview.balanceChange;
      closingOrders.push({
        gameId,
        symbol: position.symbol,
        type,
        quantity: quantity.toFixed(8),
        price: price.toFixed(6),
        assetCurrency: quote?.assetCurrency ?? game.currency,
        assetPrice: (quote?.assetPrice ?? price).toFixed(6),
        fxRate: (quote?.fxRate ?? 1).toFixed(10),
        fee: preview.feeAmount.toFixed(2),
        total: preview.total.toFixed(2),
        transactionDate: game.currentDate,
      });
    }

    const initial = parseFloat(game.initialBalance);
    const finalReturn = initial > 0 ? ((balance - initial) / initial) * 100 : 0;

    const [ended] = await Promise.all([
      tx
        .update(games)
        .set({
          currentBalance: balance.toFixed(2),
          status: 'completed',
          endedAt: new Date(),
          endReason: reason,
          finalValue: balance.toFixed(2),
          finalReturn: finalReturn.toFixed(4),
          updatedAt: new Date(),
        })
        .where(eq(games.id, gameId))
        .returning(),
      closingOrders.length > 0 ? tx.insert(transactions).values(closingOrders) : Promise.resolve(),
      positions.length > 0 ? tx.delete(holdings).where(eq(holdings.gameId, gameId)) : Promise.resolve(),
    ]);

    return ended[0];
  });
}
