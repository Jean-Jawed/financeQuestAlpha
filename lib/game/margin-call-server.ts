/**
 * PASTFOLIO - APPEL DE MARGE (exécution)
 * À l'ouverture d'une séance : rachats et ventes d'office au cours du jour,
 * enregistrés comme ordres « forcés » (voir margin-call.ts pour la règle)
 */

import { db } from '@/lib/db';
import { games, holdings, transactions, type Game } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getQuotes } from '@/lib/market/prices';
import { planMarginCall, type ForcedOrder } from './margin-call';

/**
 * Appliquer l'appel de marge à la date en jeu, s'il y a lieu
 *
 * @param gameId - Partie, déjà passée à la nouvelle séance
 * @returns La partie à jour et les ordres d'office (vide : marge suffisante)
 */
export async function applyMarginCall(gameId: string): Promise<{ game: Game; orders: ForcedOrder[] } | null> {
  return db.transaction(async (tx) => {
    // Verrou : un ordre concurrent attend la fin de l'appel de marge
    const [game] = await tx.select().from(games).where(eq(games.id, gameId)).for('update');
    if (!game || game.status !== 'active') return null;

    const positions = await tx.query.holdings.findMany({ where: eq(holdings.gameId, gameId) });
    // Sans short, pas d'appel de marge : rien à lire de plus
    if (!positions.some((position) => position.isShort)) return { game, orders: [] };

    const quotes = await getQuotes([...new Set(positions.map((p) => p.symbol))], game.currentDate, game.currency);
    const plan = planMarginCall(
      parseFloat(game.currentBalance),
      positions.map((position) => ({
        id: position.id,
        symbol: position.symbol,
        quantity: parseFloat(position.quantity),
        averageCost: parseFloat(position.averageCost),
        isShort: position.isShort,
        price: quotes.get(position.symbol)?.price ?? null,
      })),
      game.settings.transaction_fees
    );

    if (plan.orders.length === 0) return { game, orders: [] };

    const now = new Date();
    await Promise.all([
      tx.insert(transactions).values(
        plan.orders.map((order) => {
          const quote = quotes.get(order.symbol);
          return {
            gameId,
            symbol: order.symbol,
            type: order.type,
            quantity: order.quantity.toFixed(8),
            price: order.price.toFixed(6),
            assetCurrency: quote?.assetCurrency ?? game.currency,
            assetPrice: (quote?.assetPrice ?? order.price).toFixed(6),
            fxRate: (quote?.fxRate ?? 1).toFixed(10),
            fee: order.fee.toFixed(2),
            total: order.total.toFixed(2),
            forced: true,
            transactionDate: game.currentDate,
          };
        })
      ),
      ...plan.orders.map((order) =>
        order.remaining > 0
          ? tx
              .update(holdings)
              .set({ quantity: order.remaining.toFixed(8), updatedAt: now })
              .where(eq(holdings.id, order.holdingId))
          : tx.delete(holdings).where(eq(holdings.id, order.holdingId))
      ),
    ]);

    const [updated] = await tx
      .update(games)
      .set({ currentBalance: plan.cashAfter.toFixed(2), updatedAt: now })
      .where(eq(games.id, gameId))
      .returning();

    return { game: updated, orders: plan.orders };
  });
}
