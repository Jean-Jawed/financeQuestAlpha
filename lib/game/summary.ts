/**
 * FINANCEQUEST - BILAN DE FIN DE PARTIE
 * Ordres, frais, comparaison avec l'indice du scénario et rang au classement
 */

import { db } from '@/lib/db';
import { transactions, type Game } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getAssetBySymbol } from '@/lib/market/assets';
import { getQuotes } from '@/lib/market/prices';
import { getScenario, MIN_SESSIONS_TO_RETIRE } from './scenarios';
import type { GameSummary } from '@/types/game';

/** Une partie terminée figure-t-elle au classement de son scénario ? */
export function isRanked(game: Pick<Game, 'status' | 'endReason' | 'sessionsPlayed'>): boolean {
  return game.status === 'completed' && game.endReason !== 'abandoned' && game.sessionsPlayed >= MIN_SESSIONS_TO_RETIRE;
}

/**
 * Rendement de l'indice du scénario sur la période jouée, en devise d'origine
 * (la comparaison porte sur le marché, pas sur le change)
 */
async function loadBenchmark(game: Game): Promise<GameSummary['benchmark']> {
  const { benchmark } = getScenario(game.scenario);

  const [atStart, atEnd, asset] = await Promise.all([
    getQuotes([benchmark], game.startDate, 'USD'),
    getQuotes([benchmark], game.currentDate, 'USD'),
    getAssetBySymbol(benchmark),
  ]);
  const first = atStart.get(benchmark)?.assetPrice;
  const last = atEnd.get(benchmark)?.assetPrice;

  if (!first || !last || !asset) return null;
  return { symbol: benchmark, name: asset.name, returnPercentage: ((last - first) / first) * 100 };
}

/** Rang de la partie parmi les meilleures parties de chaque joueur du scénario */
async function loadRank(game: Game): Promise<GameSummary['rank']> {
  if (!isRanked(game) || game.finalReturn === null) return null;

  const {
    rows: [row],
  } = await db.execute<{ better: number; total: number }>(sql`
    WITH best AS (
      SELECT DISTINCT ON (user_id) user_id, final_return
      FROM games
      WHERE status = 'completed'
        AND end_reason <> 'abandoned'
        AND sessions_played >= ${MIN_SESSIONS_TO_RETIRE}
        AND scenario = ${game.scenario}
      ORDER BY user_id, final_return DESC
    )
    SELECT
      (SELECT COUNT(*) FROM best WHERE final_return > ${game.finalReturn})::int AS better,
      (SELECT COUNT(*) FROM best)::int AS total
  `);

  return row ? { rank: Number(row.better) + 1, total: Math.max(Number(row.total), 1) } : null;
}

/**
 * Bilan d'une partie terminée (requêtes indépendantes en parallèle)
 */
export async function loadGameSummary(game: Game): Promise<GameSummary> {
  const [[orders], benchmark, rank] = await Promise.all([
    db
      .select({
        count: sql<number>`COUNT(*)::int`,
        fees: sql<string>`COALESCE(SUM(${transactions.fee}), 0)`,
      })
      .from(transactions)
      .where(eq(transactions.gameId, game.id)),
    loadBenchmark(game).catch(() => null),
    loadRank(game),
  ]);

  return {
    ordersCount: Number(orders?.count ?? 0),
    feesPaid: parseFloat(orders?.fees ?? '0'),
    benchmark,
    rank,
    ranked: isRanked(game),
  };
}
