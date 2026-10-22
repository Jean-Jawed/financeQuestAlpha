/**
 * FINANCEQUEST - GAME TYPES
 * Types TypeScript pour la logique de jeu
 */

import type { Game, Holding, Transaction } from './database';

// ==========================================
// GAME TYPES
// ==========================================

export interface PortfolioCalculation {
  /** Cash brut en base (inclut le produit des shorts, bloqué en garantie) */
  currentBalance: number;
  /** Cash utilisable pour acheter : cash − produit des shorts (au coût moyen) */
  availableCash: number;
  portfolioValueLong: number;
  /** Dette des shorts au prix courant : Σ quantité × prix actuel */
  shortLiability: number;
  shortPositionsPnl: number;
  /** cash + longs − dette des shorts */
  totalValue: number;
  returnPercentage: number;
  score: number;
}

export interface GameWithStats extends Game {
  portfolioValue: number;
  shortPositionsPnl: number;
  totalValue: number;
  returnPercentage: number;
  score: number;
  achievementsUnlocked: number;
  remainingDays: number;
  /** Dernière date couverte par la base de prix (fin possible de la partie) */
  dataEndDate?: string;
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
  name: string;
  /** Devise de cotation de l'actif et cours d'origine */
  assetCurrency: string;
  assetPrice: number;
  /** Variation du cours depuis la séance précédente, en % (null : inconnue) */
  dayChangePercent: number | null;
  /** Cours et valeurs ci-dessous : dans la devise de la partie */
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
  availableCash: number;
  portfolioValueLong: number;
  shortLiability: number;
  shortPositionsPnl: number;
  totalValue: number;
  returnPercentage: number;
  score: number;
  initialBalance: number;
  profitLoss: number;
}

/**
 * État complet d'une partie, tel qu'affiché par la page de jeu
 * Renvoyé par GET /api/games/[id], et après un ordre ou une séance
 * (évite au client de relire la partie)
 */
export interface GameState {
  game: GameWithStats;
  portfolio: PortfolioSummary;
  holdings: HoldingWithValue[];
  recentTransactions: Transaction[];
  /** Bilan, pour une partie terminée */
  summary: GameSummary | null;
}

/** Bilan de fin de partie */
export interface GameSummary {
  ordersCount: number;
  feesPaid: number;
  /** Indice du scénario sur la même période (en devise d'origine) */
  benchmark: { symbol: string; name: string; returnPercentage: number } | null;
  /** Rang parmi les meilleures parties de chaque joueur du scénario */
  rank: { rank: number; total: number } | null;
  /** Abandon ou moins de séances que le minimum : hors classement */
  ranked: boolean;
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
  state?: GameState;
  achievementsUnlocked?: Array<{
    name: string;
    points: number;
  }>;
  error?: string;
}
