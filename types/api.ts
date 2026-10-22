/**
 * FINANCEQUEST - API TYPES
 * Types pour les requêtes et réponses des API routes
 */

import type { Game, User, Achievement } from './database';
import type { GameWithStats, GameState, TransactionType, PortfolioSummary } from './game';

// ==========================================
// STANDARD API RESPONSE
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// AUTH API
// ==========================================

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: User | null;
}

// ==========================================
// GAMES API
// ==========================================

export interface CreateGameRequest {
  startDate: string;
  /** Devise de jeu (EUR par défaut) */
  currency?: string;
  settings?: {
    transaction_fees?: number;
    allow_shorting?: boolean;
    allow_leverage?: boolean;
  };
}

export interface CreateGameResponse extends ApiResponse {
  data?: {
    game: Game;
    prefetchResult: {
      recordsStored: number;
      strategy: string;
    };
  };
}

export interface ListGamesResponse extends ApiResponse {
  data?: {
    games: GameWithStats[];
  };
}

export interface GetGameResponse extends ApiResponse {
  data?: GameState;
}

export interface NextDayRequest {
  gameId: string;
}

export interface NextDayResponse extends ApiResponse {
  data?: {
    newDate: string;
    state: GameState;
    achievementsUnlocked: Array<{
      name: string;
      points: number;
    }>;
  };
}

// ==========================================
// TRADES API
// ==========================================

export interface TradeRequest {
  gameId: string;
  symbol: string;
  quantity: number;
}

export interface TradeResponse extends ApiResponse {
  data?: {
    transaction: any;
    holding: any;
    newBalance: number;
    state: GameState;
    achievementsUnlocked: Array<{
      name: string;
      points: number;
    }>;
  };
}

// ==========================================
// MARKET API
// ==========================================

export interface GetPriceRequest {
  symbol: string;
  date: string;
}

export interface GetPriceResponse extends ApiResponse {
  data?: {
    symbol: string;
    date: string;
    price: number;
  };
}

export interface GetHistoryRequest {
  symbol: string;
  from: string;
  to: string;
}

export interface GetHistoryResponse extends ApiResponse {
  data?: {
    symbol: string;
    history: Array<{
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number | null;
    }>;
  };
}

export interface GetAssetsResponse extends ApiResponse {
  data?: {
    assets: Array<{
      symbol: string;
      name: string;
      type: string;
      category?: string;
      market?: string;
      currency?: string;
    }>;
    total: number;
  };
}

// ==========================================
// ACHIEVEMENTS API
// ==========================================

export interface ListAchievementsResponse extends ApiResponse {
  data?: {
    achievements: Achievement[];
  };
}

export interface GetUserAchievementsRequest {
  gameId: string;
}

export interface GetUserAchievementsResponse extends ApiResponse {
  data?: {
    unlocked: Achievement[];
    available: Achievement[];
    totalPoints: number;
  };
}

// ==========================================
// LEADERBOARD API
// ==========================================

export interface GetLeaderboardRequest {
  period: 'all_time' | 'monthly' | 'weekly';
  limit?: number;
  offset?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userName: string;
  /** Valeur dans la devise de la partie (le classement se fait au rendement) */
  totalValue: number;
  currency: string;
  returnPercentage: number;
  score: number;
  gameId: string;
  /** Séances jouées par la partie classée */
  sessionsPlayed: number;
  endedAt: string;
}

export interface GetLeaderboardResponse extends ApiResponse {
  data?: {
    period: 'all_time' | 'monthly' | 'weekly';
    entries: LeaderboardEntry[];
    total: number;
  };
}

// ==========================================
// ADMIN API
// ==========================================

export interface MonitoringData {
  users: {
    total: number;
    active: number;
  };
  games: {
    total: number;
    active: number;
  };
  transactions: {
    total: number;
  };
  prices: {
    oldestDate: string | null;
    newestDate: string | null;
    totalRows: number;
    assetsTotal: number;
    assetsActive: number;
    lastDataUpdate: string | null;
  };
}

export interface GetMonitoringResponse extends ApiResponse {
  data?: MonitoringData;
}