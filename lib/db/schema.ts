/**
 * FINANCEQUEST - DRIZZLE SCHEMA
 * Définitions TypeScript des tables Supabase PostgreSQL (projet FinanceQuest)
 *
 * Doit refléter la base réelle : les statuts / types sont des colonnes `text`
 * avec contrainte CHECK (pas des enums Postgres), et `users.id` référence
 * `auth.users.id` (profil créé par le trigger `on_auth_user_created`).
 * Voir docs/reviewOct2026/sql/02_projet_A_structure.sql et suivants (06 : groupes)
 */

import {
  pgTable,
  pgSchema,
  uuid,
  text,
  timestamp,
  decimal,
  date,
  boolean,
  integer,
  bigint,
  jsonb,
  primaryKey,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { GAME_CURRENCIES } from '../game/currency';
import { GROUP_MODES, GROUP_STATUSES, GROUP_TEMPOS } from '../game/groups';

// ==========================================
// VALEURS AUTORISÉES (contraintes CHECK en base)
// ==========================================

export const GAME_STATUSES = ['active', 'paused', 'completed'] as const;

/** Raisons de fin de partie (games.end_reason) */
export const END_REASONS = [
  'retired',
  'period_end',
  'data_end',
  'bankrupt',
  'abandoned',
  // Parties de groupe : fin fixée par le groupe, objectif de course atteint, éliminé
  'group_end',
  'target_reached',
  'eliminated',
] as const;


export const TRANSACTION_TYPES = ['buy', 'sell', 'short', 'cover'] as const;

export const CRITERIA_TYPES = [
  'first_transaction',
  'asset_count',
  'portfolio_value',
  'return_percentage',
  'specific_trade',
  'transaction_count',
  'short_profit',
  'hold_duration',
  'swing_trade',
  'balanced_portfolio',
  'sector_focus',
  'profitable_trades',
  'perfect_timing',
  'comeback',
  'days_played',
] as const;

// ==========================================
// TABLE: auth.users (gérée par Supabase Auth, référencée uniquement)
// Non exportée : sinon le client Drizzle la confond avec public.users (même nom)
// ==========================================

const authSchema = pgSchema('auth');

const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

// ==========================================
// TABLE: users
// ==========================================

export const users = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
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
  currentDate: date('current_game_date').notNull(), // ← Correction: current_game_date
  initialBalance: decimal('initial_balance', { precision: 15, scale: 2 })
    .default('10000.00')
    .notNull(),
  currentBalance: decimal('current_balance', { precision: 15, scale: 2 }).notNull(),
  status: text('status', { enum: GAME_STATUSES }).default('active').notNull(),
  /** Devise de jeu (ISO 4217) : solde, coûts moyens et transactions */
  currency: text('currency', { enum: GAME_CURRENCIES }).default('EUR').notNull(),
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
  /** Scénario choisi à la création (règles : lib/game/scenarios.ts) */
  scenario: text('scenario').default('libre').notNull(),
  /** Séances jouées depuis le départ (retraite possible à partir de MIN_SESSIONS_TO_RETIRE) */
  sessionsPlayed: integer('sessions_played').default(0).notNull(),
  /** Fin de partie : renseignés ensemble quand status = 'completed' */
  endedAt: timestamp('ended_at', { withTimezone: true }),
  endReason: text('end_reason', { enum: END_REASONS }),
  finalValue: decimal('final_value', { precision: 15, scale: 2 }),
  finalReturn: decimal('final_return', { precision: 12, scale: 4 }),
  /** Partie de groupe : la partie individuelle du joueur au sein du groupe */
  groupId: uuid('group_id').references((): AnyPgColumn => groups.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
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
  averageCost: decimal('average_cost', { precision: 18, scale: 6 }).notNull(),
  isShort: boolean('is_short').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
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
  type: text('type', { enum: TRANSACTION_TYPES }).notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 8 }).notNull(),
  /** Prix unitaire dans la devise de la partie */
  price: decimal('price', { precision: 18, scale: 6 }).notNull(),
  /** Conversion : devise et cours d'origine de l'actif, taux appliqué (null : transactions antérieures) */
  assetCurrency: text('asset_currency'),
  assetPrice: decimal('asset_price', { precision: 18, scale: 6 }),
  fxRate: decimal('fx_rate', { precision: 20, scale: 10 }),
  fee: decimal('fee', { precision: 15, scale: 2 }).default('0').notNull(),
  total: decimal('total', { precision: 15, scale: 2 }).notNull(),
  /** Identifiant généré par le ticket : un ordre renvoyé après une réponse perdue n'est pas réexécuté */
  clientOrderId: uuid('client_order_id'),
  transactionDate: date('transaction_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// TABLE: achievements
// ==========================================

export const achievements = pgTable('achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  criteriaType: text('criteria_type', { enum: CRITERIA_TYPES }).notNull(),
  criteriaValue: jsonb('criteria_value').notNull(),
  points: integer('points').default(0).notNull(),
  icon: text('icon'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
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
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// TABLE: groups (parties de groupe)
// ==========================================

export const groups = pgTable('groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Code d'invitation (8 caractères, lien /groups/join/<code>) */
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  mode: text('mode', { enum: GROUP_MODES }).notNull(),
  tempo: text('tempo', { enum: GROUP_TEMPOS }).notNull(),
  scenario: text('scenario').default('libre').notNull(),
  currency: text('currency', { enum: GAME_CURRENCIES }).notNull(),
  startDate: date('start_date').notNull(),
  /** Durée en séances (plafond pour la course) */
  sessionsTarget: integer('sessions_target').notNull(),
  /** Course : rendement à atteindre, en % */
  targetReturn: decimal('target_return', { precision: 8, scale: 2 }),
  /** Élimination : une sortie toutes les K séances */
  eliminationEvery: integer('elimination_every'),
  /** Synchro : la séance avance après ce délai même si un joueur n'est pas prêt */
  syncTimeoutHours: integer('sync_timeout_hours'),
  maxPlayers: integer('max_players').default(30).notNull(),
  status: text('status', { enum: GROUP_STATUSES }).default('open').notNull(),
  /** Synchro : date de jeu commune */
  syncDate: date('sync_date'),
  lastAdvancedAt: timestamp('last_advanced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
});

export const groupMembers = pgTable(
  'group_members',
  {
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    gameId: uuid('game_id')
      .notNull()
      .unique()
      .references(() => games.id, { onDelete: 'cascade' }),
    /** Synchro : prêt pour la séance suivante */
    ready: boolean('ready').default(false).notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })]
);

export const groupMessages = pgTable('group_messages', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/** Une ligne par partie et par séance : ce que voient les concurrents */
export const gameSnapshots = pgTable(
  'game_snapshots',
  {
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    totalValue: decimal('total_value', { precision: 15, scale: 2 }).notNull(),
    ordersCount: integer('orders_count').notNull(),
    openPositions: integer('open_positions').notNull(),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.date] })]
);

// ==========================================
// RELATIONS (pour Drizzle queries)
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  games: many(games),
  userAchievements: many(userAchievements),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(users, {
    fields: [games.userId],
    references: [users.id],
  }),
  holdings: many(holdings),
  transactions: many(transactions),
  userAchievements: many(userAchievements),
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

export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type GroupMessage = typeof groupMessages.$inferSelect;
