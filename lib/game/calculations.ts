/**
 * PASTFOLIO - GAME CALCULATIONS
 * Calculs financiers pour le jeu (portfolio value, P&L, rendement, score)
 * Les formules pures sont dans ./portfolio-math (testables sans base)
 */

import { db, type DbExecutor } from '@/lib/db';
import { games, holdings, transactions } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getQuotes } from '@/lib/market/prices';
import { getAssetsMap } from '@/lib/market/assets';
import { valuePortfolio } from './portfolio-math';
import { positionSessionChange } from './session-change';
import { previousBusinessDay } from '@/lib/utils/dates';
import type { PortfolioCalculation, HoldingWithValue } from '@/types/game';

export { calculateTransactionPreview } from './portfolio-math';

// ==========================================
// PORTFOLIO CALCULATIONS
// ==========================================

/**
 * Calculer la valeur totale du portfolio pour un game, dans sa devise de jeu
 * game + holdings (en parallèle), puis cours convertis en batch
 *
 * @param gameId - ID du game
 * @param currentDate - Date actuelle du game (YYYY-MM-DD)
 * @param executor - `db` ou la transaction en cours (lecture sous verrou)
 * @returns Calcul complet du portfolio
 */
export async function calculatePortfolio(
  gameId: string,
  currentDate: string,
  executor: DbExecutor = db
): Promise<PortfolioCalculation | null> {
  try {
    // 1. Récupérer le game et ses holdings
    const [game, allHoldings] = await Promise.all([
      executor.query.games.findFirst({
        where: eq(games.id, gameId),
      }),
      executor.query.holdings.findMany({
        where: eq(holdings.gameId, gameId),
      }),
    ]);

    if (!game) {
      console.error(`[Calculations] Game not found: ${gameId}`);
      return null;
    }

    // 2. Cours actuels convertis dans la devise de la partie (BATCH DB Query)
    const symbols = [...new Set(allHoldings.map((h) => h.symbol))];
    const quotes = await getQuotes(symbols, currentDate, game.currency);

    // 3. Valoriser
    return valuePortfolio(
      parseFloat(game.currentBalance),
      parseFloat(game.initialBalance),
      allHoldings.map((holding) => ({
        quantity: parseFloat(holding.quantity),
        averageCost: parseFloat(holding.averageCost),
        isShort: holding.isShort,
        price: quotes.get(holding.symbol)?.price ?? null,
      }))
    );
  } catch (error) {
    console.error('[Calculations] Error calculating portfolio:', error);
    return null;
  }
}

/**
 * Calculer les valeurs actuelles pour tous les holdings
 *
 * @param gameId - ID du game
 * @param currentDate - Date actuelle
 * @param currency - Devise de la partie (games.currency)
 * @returns Array de holdings avec valeurs calculées (dans la devise de la partie)
 */
export async function calculateHoldingsValues(
  gameId: string,
  currentDate: string,
  currency: string
): Promise<HoldingWithValue[]> {
  try {
    // 1. Récupérer tous les holdings
    const allHoldings = await db.query.holdings.findMany({
      where: eq(holdings.gameId, gameId),
    });

    if (allHoldings.length === 0) {
      return [];
    }

    // 2. Récupérer les prix actuels (BATCH DB Query)
    const symbols = [...new Set(allHoldings.map((h) => h.symbol))];
    // Séance précédente : les sessions avancent de jour ouvré en jour ouvré
    const [quotes, previousQuotes, assetsMap, todayTrades] = await Promise.all([
      getQuotes(symbols, currentDate, currency),
      getQuotes(symbols, previousBusinessDay(currentDate), currency),
      getAssetsMap(symbols),
      db
        .select({ symbol: transactions.symbol, type: transactions.type, quantity: transactions.quantity })
        .from(transactions)
        .where(and(eq(transactions.gameId, gameId), eq(transactions.transactionDate, currentDate))),
    ]);

    // Quantité ouverte à la séance en cours, par symbole et par sens
    const openedToday = new Map<string, number>();
    for (const trade of todayTrades) {
      const short = trade.type === 'short' || trade.type === 'cover';
      const sign = trade.type === 'buy' || trade.type === 'short' ? 1 : -1;
      const key = `${trade.symbol}:${short}`;
      openedToday.set(key, (openedToday.get(key) ?? 0) + sign * parseFloat(trade.quantity));
    }

    // 3. Calculer pour chaque holding
    const holdingsWithValues: HoldingWithValue[] = [];

    for (const holding of allHoldings) {
      const quote = quotes.get(holding.symbol);
      const assetData = assetsMap.get(holding.symbol);
      const currentPrice = quote ? quote.price : 0;
      const assetName = assetData ? assetData.name : holding.symbol;

      if (currentPrice === 0) {
        console.warn(`[Calculations] No price found for ${holding.symbol} at ${currentDate}`);
        // On continue quand même avec prix 0 pour ne pas bloquer l'UI
      }

      const quantity = parseFloat(holding.quantity);
      const averageCost = parseFloat(holding.averageCost);

      let currentValue: number;
      let profitLoss: number;

      if (holding.isShort) {
        // Position short : P&L = (prix d'emprunt - prix actuel) × quantité
        // Sans prix, P&L neutre (même convention que valuePortfolio)
        const priceForPnl = currentPrice > 0 ? currentPrice : averageCost;
        profitLoss = (averageCost - priceForPnl) * quantity;
        currentValue = profitLoss;
      } else {
        // Position long : valeur = prix actuel × quantité
        currentValue = currentPrice * quantity;
        profitLoss = currentValue - averageCost * quantity;
      }

      const profitLossPercentage =
        averageCost > 0 ? (profitLoss / (averageCost * quantity)) * 100 : 0;

      const netTodayQuantity = openedToday.get(`${holding.symbol}:${holding.isShort}`) ?? 0;
      const previousPrice = previousQuotes.get(holding.symbol)?.price ?? null;
      const dayChangePercent = quote?.changePercent ?? null;

      holdingsWithValues.push({
        id: holding.id,
        gameId: holding.gameId,
        symbol: holding.symbol,
        quantity: holding.quantity,
        averageCost: holding.averageCost,
        isShort: holding.isShort,
        createdAt: holding.createdAt,
        updatedAt: holding.updatedAt,
        name: assetName,
        assetType: assetData?.type?.code ?? null,
        assetCurrency: quote?.assetCurrency ?? assetData?.currency?.code ?? currency,
        assetPrice: quote?.assetPrice ?? 0,
        dayChangePercent,
        dayChange: positionSessionChange({
          quantity,
          isShort: holding.isShort,
          price: currentPrice,
          previousPrice,
          netTodayQuantity,
        }),
        openedToday: netTodayQuantity >= quantity - 1e-9,
        sessionPercent:
          previousPrice && currentPrice > 0
            ? (holding.isShort ? -1 : 1) * (currentPrice / previousPrice - 1) * 100
            : null,
        currentPrice,
        currentValue,
        profitLoss,
        profitLossPercentage,
      });
    }

    return holdingsWithValues;
  } catch (error) {
    console.error('[Calculations] Error calculating holdings values:', error);
    return [];
  }
}

/**
 * Calculer le rendement historique d'un game
 * @param gameId - ID du game
 * @returns Historique des valeurs par date
 */
export async function calculateHistoricalReturns(
  gameId: string
): Promise<Array<{ date: string; totalValue: number; returnPercentage: number }>> {
  // TODO: Implémenter si besoin d'un graphique de performance dans le temps
  // Nécessiterait de stocker des snapshots quotidiens ou de recalculer rétroactivement
  return [];
}
