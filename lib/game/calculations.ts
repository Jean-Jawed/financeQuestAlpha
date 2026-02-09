/**
 * FINANCEQUEST - GAME CALCULATIONS
 * Calculs financiers pour le jeu (portfolio value, P&L, rendement, score)
 */

import { db } from '@/lib/db';
import { games, holdings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getLatestPrices } from '@/lib/market/prices';
import { getAssetsMap } from '@/lib/market/assets';
import type { PortfolioCalculation, HoldingWithValue } from '@/types/game';

// ==========================================
// PORTFOLIO CALCULATIONS
// ==========================================

/**
 * Calculer la valeur totale du portfolio pour un game
 * 
 * @param gameId - ID du game
 * @param currentDate - Date actuelle du game (YYYY-MM-DD)
 * @returns Calcul complet du portfolio
 */
export async function calculatePortfolio(
  gameId: string,
  currentDate: string
): Promise<PortfolioCalculation | null> {
  try {
    // 1. Récupérer le game
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      console.error(`[Calculations] Game not found: ${gameId}`);
      return null;
    }

    // 2. Récupérer tous les holdings
    const allHoldings = await db.query.holdings.findMany({
      where: eq(holdings.gameId, gameId),
    });

    if (allHoldings.length === 0) {
      // Pas de holdings, valeur = balance uniquement
      return {
        currentBalance: parseFloat(game.currentBalance),
        portfolioValueLong: 0,
        shortPositionsPnl: 0,
        totalValue: parseFloat(game.currentBalance),
        returnPercentage: 0,
        score: 0,
      };
    }

    // 3. Récupérer les prix actuels pour tous les symboles (BATCH DB Query)
    const symbols = [...new Set(allHoldings.map((h) => h.symbol))];
    console.log(`next-day : prices update for ${symbols.length} symbols at ${currentDate}`);
    const pricesMap = await getLatestPrices(symbols, currentDate);

    // 4. Calculer la valeur des positions long
    let portfolioValueLong = 0;
    const longHoldings = allHoldings.filter((h) => !h.isShort);

    for (const holding of longHoldings) {
      const priceData = pricesMap.get(holding.symbol);
      const currentPrice = priceData ? priceData.close_price : 0;

      if (currentPrice > 0) {
        const value = parseFloat(holding.quantity) * currentPrice;
        portfolioValueLong += value;
      }
    }

    // 5. Calculer le P&L des positions short
    let shortPositionsPnl = 0;
    const shortHoldings = allHoldings.filter((h) => h.isShort);

    for (const holding of shortHoldings) {
      const priceData = pricesMap.get(holding.symbol);
      const currentPrice = priceData ? priceData.close_price : 0;

      if (currentPrice > 0) {
        // P&L short = (prix d'emprunt - prix actuel) × quantité
        const pnl =
          (parseFloat(holding.averageCost) - currentPrice) *
          parseFloat(holding.quantity);
        shortPositionsPnl += pnl;
      }
    }

    // 6. Calculer la valeur totale
    const currentBalance = parseFloat(game.currentBalance);
    const totalValue = currentBalance + portfolioValueLong + shortPositionsPnl;

    // 7. Calculer le rendement
    const initialBalance = parseFloat(game.initialBalance);
    const returnPercentage = ((totalValue - initialBalance) / initialBalance) * 100;

    // 8. Calculer le score (pour leaderboard)
    const score = Math.floor(returnPercentage * 10);

    return {
      currentBalance,
      portfolioValueLong,
      shortPositionsPnl,
      totalValue,
      returnPercentage,
      score,
    };
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
 * @returns Array de holdings avec valeurs calculées
 */
export async function calculateHoldingsValues(
  gameId: string,
  currentDate: string
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
    const [pricesMap, assetsMap] = await Promise.all([
      getLatestPrices(symbols, currentDate),
      getAssetsMap(symbols)
    ]);

    // 3. Calculer pour chaque holding
    const holdingsWithValues: HoldingWithValue[] = [];

    for (const holding of allHoldings) {
      const priceData = pricesMap.get(holding.symbol);
      const assetData = assetsMap.get(holding.symbol);
      const currentPrice = priceData ? priceData.close_price : 0;
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
        // Si prix actuel est 0 (pas de donnée), P&L est faussé mais on garde 0 pour currentPrice
        profitLoss = (averageCost - currentPrice) * quantity;
        currentValue = profitLoss;
      } else {
        // Position long : valeur = prix actuel × quantité
        currentValue = currentPrice * quantity;
        profitLoss = currentValue - averageCost * quantity;
      }

      const profitLossPercentage =
        averageCost > 0 ? (profitLoss / (averageCost * quantity)) * 100 : 0;

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
 * Calculer le P&L d'une transaction potentielle (preview avant exécution)
 * 
 * @param type - Type de transaction (buy/sell/short/cover)
 * @param quantity - Quantité
 * @param price - Prix actuel
 * @param fees - Frais de transaction (%)
 * @returns Détails du calcul
 */
export function calculateTransactionPreview(
  type: 'buy' | 'sell' | 'short' | 'cover',
  quantity: number,
  price: number,
  fees: number
): {
  subtotal: number;
  feeAmount: number;
  total: number;
  balanceChange: number;
} {
  const subtotal = quantity * price;
  const feeAmount = subtotal * (fees / 100);

  let total: number;
  let balanceChange: number;

  switch (type) {
    case 'buy':
      total = subtotal + feeAmount;
      balanceChange = -total; // Balance diminue
      break;

    case 'sell':
      total = subtotal - feeAmount;
      balanceChange = total; // Balance augmente
      break;

    case 'short':
      total = subtotal - feeAmount;
      balanceChange = total; // Balance augmente temporairement
      break;

    case 'cover':
      total = subtotal + feeAmount;
      balanceChange = -total; // Balance diminue
      break;
  }

  return {
    subtotal,
    feeAmount,
    total,
    balanceChange,
  };
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