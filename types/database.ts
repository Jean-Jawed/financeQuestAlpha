/**
 * FINANCEQUEST - DATABASE TYPES
 * Types TypeScript générés depuis le schema Drizzle
 */

import type { User, Game, Achievement, Holding, Transaction } from '@/lib/db/schema';

// Re-export des types depuis schema
export type {
  User,
  NewUser,
  Game,
  NewGame,
  Holding,
  NewHolding,
  Transaction,
  NewTransaction,
  Achievement,
  NewAchievement,
  UserAchievement,
  NewUserAchievement,
  MarketDataCache,
  NewMarketDataCache,
  LeaderboardSnapshot,
  NewLeaderboardSnapshot,
} from '@/lib/db/schema';

// Types additionnels utiles

/**
 * Game avec relations chargées
 */
export interface GameWithRelations {
  id: string;
  userId: string;
  startDate: string;
  currentDate: string;
  initialBalance: string;
  currentBalance: string;
  status: 'active' | 'paused' | 'completed';
  settings: {
    transaction_fees: number;
    allow_shorting: boolean;
    allow_leverage: boolean;
  };
  holdings?: Holding[];
  transactions?: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Holding avec métadonnées calculées
 */
export interface HoldingWithMetadata extends Holding {
  currentPrice?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

/**
 * Game avec statistiques calculées
 */
export interface GameWithStats extends Game {
  portfolioValue: number;
  shortPositionsPnl: number;
  totalValue: number;
  returnPercentage: number;
  score: number;
  achievementsUnlocked: number;
}

/**
 * Transaction avec métadonnées
 */
export interface TransactionWithMetadata extends Transaction {
  currentPrice?: number;
  profitLoss?: number;
}

/**
 * User avec statistiques
 */
export interface UserWithStats extends User {
  gamesPlayed: number;
  gamesActive: number;
  achievementsUnlocked: number;
  totalScore: number;
  bestReturn: number;
}