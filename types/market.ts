// types/market.ts
export type AssetType = 'stock' | 'crypto' | 'bond' | 'index';

export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
  category?: string;
  exchange?: string;
}

export interface MarketStackEODData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  adj_high: number | null;
  adj_low: number | null;
  adj_close: number | null;
  adj_open: number | null;
  adj_volume: number | null;
  split_factor: number;
  dividend: number;
  symbol: string;
  exchange: string;
  date: string;
}

export interface MarketStackResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: MarketStackEODData[];
}

export interface CachedPriceData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface CacheStats {
  uniqueSymbols: number;
  totalRecords: number;
  oldestDate: string | null;
  newestDate: string | null;
  estimatedSizeMB: number;
}

export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface PrefetchResult {
  success: boolean;
  recordsStored: number;
  strategy?: 'full' | 'partial' | 'skip';
  message?: string;
  error?: string;
}

export interface CacheAnalysis {
  coverage: number;
  missingDays: number;
  totalDaysNeeded: number;
  missingSymbols: string[];
}