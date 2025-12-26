/**
 * FINANCEQUEST - DRIZZLE SCHEMA
 * Définitions TypeScript des 8 tables Supabase PostgreSQL
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  date,
  boolean,
  integer,
  bigint,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==========================================
// ENUMS
// ==========================================

export const gameStatusEnum = pgEnum('game_status', ['active', 'paused', 'completed']);

export const transactionTypeEnum = pgEnum('transaction_type', ['buy', 'sell', 'short', 'cover']);

export const criteriaTypeEnum = pgEnum('criteria_type', [
  'first_transaction',
  'asset_count',
  'portfolio_value',
  'return_percentage',
  'specific_trade',
]);

export const periodTypeEnum = pgEnum('period_type', ['all_time', 'monthly', 'weekly']);

// ==========================================
// TABLE: users
// ==========================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// TABLE: games
// ==========================================

export const games = pgTable('games', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  startDate: date('start_date').notNull(),
  currentDate: date('current_game_date').notNull(),
  initialBalance: decimal('initial_balance', { precision: 15, scale: 2 })
    .default('10000.00')
    .notNull(),
  currentBalance: decimal('current_balance', { precision: 15, scale: 2 }).notNull(),
  status: gameStatusEnum('status').default('active').notNull(),
  settings: jsonb('settings')
    .$type<{
      transaction_fees: number;
      allow_shorting: boolean;
      allow_leverage: boolean;
    }>()
    .default({
      transaction_fees: 0.25,
      allow_shorting: true,
      allow_leverage: false,
    })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// TABLE: holdings
// ==========================================

export const holdings = pgTable('holdings', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 8 }).notNull(),
  averageCost: decimal('average_cost', { precision: 15, scale: 2 }).notNull(),
  isShort: boolean('is_short').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// TABLE: transactions
// ==========================================

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(),
  type: transactionTypeEnum('type').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 8 }).notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  fee: decimal('fee', { precision: 15, scale: 2 }).default('0').notNull(),
  total: decimal('total', { precision: 15, scale: 2 }).notNull(),
  transactionDate: date('transaction_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// TABLE: achievements
// ==========================================

export const achievements = pgTable('achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  criteriaType: criteriaTypeEnum('criteria_type').notNull(),
  criteriaValue: jsonb('criteria_value').notNull(),
  points: integer('points').default(0).notNull(),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// TABLE: user_achievements
// ==========================================

export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  achievementId: uuid('achievement_id')
    .notNull()
    .references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});

// ==========================================
// TABLE: market_data_cache
// ==========================================

export const marketDataCache = pgTable('market_data_cache', {
  symbol: text('symbol').notNull(),
  date: date('date').notNull(),
  open: decimal('open', { precision: 15, scale: 4 }),
  high: decimal('high', { precision: 15, scale: 4 }),
  low: decimal('low', { precision: 15, scale: 4 }),
  close: decimal('close', { precision: 15, scale: 4 }).notNull(),
  volume: bigint('volume', { mode: 'number' }),
  cachedAt: timestamp('cached_at').defaultNow().notNull(),
});

// ==========================================
// TABLE: leaderboard_snapshots
// ==========================================

export const leaderboardSnapshots = pgTable('leaderboard_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  userName: text('user_name').notNull(),
  totalValue: decimal('total_value', { precision: 15, scale: 2 }).notNull(),
  returnPercentage: decimal('return_percentage', { precision: 10, scale: 4 }).notNull(),
  score: integer('score').notNull(),
  periodType: periodTypeEnum('period_type').notNull(),
  periodKey: text('period_key').notNull(),
  rank: integer('rank'),
  snapshotDate: date('snapshot_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// RELATIONS (pour Drizzle queries)
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  games: many(games),
  userAchievements: many(userAchievements),
  leaderboardSnapshots: many(leaderboardSnapshots),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(users, {
    fields: [games.userId],
    references: [users.id],
  }),
  holdings: many(holdings),
  transactions: many(transactions),
  userAchievements: many(userAchievements),
  leaderboardSnapshots: many(leaderboardSnapshots),
}));

export const holdingsRelations = relations(holdings, ({ one }) => ({
  game: one(games, {
    fields: [holdings.gameId],
    references: [games.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  game: one(games, {
    fields: [transactions.gameId],
    references: [games.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [userAchievements.gameId],
    references: [games.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const leaderboardSnapshotsRelations = relations(leaderboardSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [leaderboardSnapshots.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [leaderboardSnapshots.gameId],
    references: [games.id],
  }),
}));

// ==========================================
// TYPES INFÉRÉS
// ==========================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type Holding = typeof holdings.$inferSelect;
export type NewHolding = typeof holdings.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;

export type MarketDataCache = typeof marketDataCache.$inferSelect;
export type NewMarketDataCache = typeof marketDataCache.$inferInsert;

export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;
export type NewLeaderboardSnapshot = typeof leaderboardSnapshots.$inferInsert;
