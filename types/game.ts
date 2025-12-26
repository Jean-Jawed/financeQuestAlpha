/**
 * FINANCEQUEST - GAME TYPES
 * Types TypeScript pour la logique de jeu
 */

import type { Game, Holding, Transaction } from './database';

// ==========================================
// GAME TYPES
// ==========================================

export interface GameWithStats extends Game {
  portfolioValue: number;
  shortPositionsPnl: number;
  totalValue: number;
  returnPercentage: number;
  score: number;
  achievementsUnlocked: number;
  remainingDays: number;
}

export interface GameSettings {
  transaction_fees: number;
  allow_shorting: boolean;
  allow_leverage: boolean;
}

// ==========================================
// HOLDING TYPES
// ==========================================

export interface HoldingWithValue extends Holding {
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface HoldingsByType {
  long: HoldingWithValue[];
  short: HoldingWithValue[];
}

// ==========================================
// TRANSACTION TYPES
// ==========================================

export type TransactionType = 'buy' | 'sell' | 'short' | 'cover';

export interface TransactionPreview {
  type: TransactionType;
  symbol: string;
  quantity: number;
  price: number;
  subtotal: number;
  feeAmount: number;
  total: number;
  balanceChange: number;
}

export interface TransactionResult {
  success: boolean;
  transaction?: Transaction;
  holding?: Holding;
  newBalance?: number;
  error?: string;
}

// ==========================================
// PORTFOLIO TYPES
// ==========================================

export interface PortfolioSummary {
  currentBalance: number;
  portfolioValueLong: number;
  shortPositionsPnl: number;
  totalValue: number;
  returnPercentage: number;
  score: number;
  initialBalance: number;
  profitLoss: number;
}

export interface PortfolioHistory {
  date: string;
  totalValue: number;
  returnPercentage: number;
  portfolioValueLong: number;
  shortPositionsPnl: number;
}

// ==========================================
// ACHIEVEMENT TYPES
// ==========================================

export type AchievementCriteriaType =
  | 'first_transaction'
  | 'asset_count'
  | 'portfolio_value'
  | 'return_percentage'
  | 'specific_trade';

export interface AchievementProgress {
  achievementId: string;
  name: string;
  description: string;
  criteriaType: AchievementCriteriaType;
  points: number;
  unlocked: boolean;
  progress?: number; // Progression en % (0-100)
  currentValue?: number;
  targetValue?: number;
}

// ==========================================
// GAME CREATION TYPES
// ==========================================

export interface CreateGameInput {
  startDate: string;
  settings?: Partial<GameSettings>;
}

export interface CreateGameResult {
  success: boolean;
  gameId?: string;
  game?: Game;
  prefetchResult?: {
    recordsStored: number;
    strategy: string;
  };
  error?: string;
}

// ==========================================
// NEXT DAY TYPES
// ==========================================

export interface NextDayResult {
  success: boolean;
  newDate?: string;
  portfolio?: {
    totalValue: number;
    returnPercentage: number;
    portfolioValueLong: number;
    shortPositionsPnl: number;
  };
  achievementsUnlocked?: Array<{
    name: string;
    points: number;
  }>;
  error?: string;
}
