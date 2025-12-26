/**
 * FINANCEQUEST - API TYPES
 * Types pour les requêtes et réponses des API routes
 */

import type { Game, User, Achievement } from './database';
import type { GameWithStats, TransactionType, PortfolioSummary } from './game';

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
  data?: {
    game: GameWithStats;
    portfolio: PortfolioSummary;
    holdings: any[];
    recentTransactions: any[];
  };
}

export interface NextDayRequest {
  gameId: string;
}

export interface NextDayResponse extends ApiResponse {
  data?: {
    newDate: string;
    portfolio: PortfolioSummary;
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
    portfolio: PortfolioSummary;
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
      type: 'stock' | 'crypto' | 'bond' | 'index';
      category?: string;
    }>;
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
  totalValue: number;
  returnPercentage: number;
  score: number;
  gameId: string;
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
  database: {
    size: number;
    recordCount: number;
    cacheRecords: number;
  };
  users: {
    total: number;
    active: number;
  };
  games: {
    total: number;
    active: number;
  };
  api: {
    marketStackRemaining: number;
  };
}

export interface GetMonitoringResponse extends ApiResponse {
  data?: MonitoringData;
}
