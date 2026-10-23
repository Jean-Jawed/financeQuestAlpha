/**
 * FINANCEQUEST - INSTANTANÉS DE SÉANCE
 * Pour les parties de groupe : à chaque ordre et chaque séance, la valeur du
 * portefeuille, le nombre d'ordres et de positions ouvertes à la date de jeu.
 * C'est tout ce que voient les concurrents, au plus tard à leur propre date.
 */

import { sql } from 'drizzle-orm';
import { db, type DbExecutor } from '@/lib/db';
import { gameSnapshots, type Game } from '@/lib/db/schema';

/**
 * Enregistrer (ou mettre à jour) l'instantané de la partie à sa date de jeu
 * Sans effet pour une partie individuelle
 */
export async function recordSnapshot(
  game: Pick<Game, 'id' | 'groupId' | 'currentDate'>,
  totalValue: number,
  executor: DbExecutor = db
): Promise<void> {
  if (!game.groupId) return;

  const value = totalValue.toFixed(2);
  await executor
    .insert(gameSnapshots)
    .values({
      gameId: game.id,
      date: game.currentDate,
      totalValue: value,
      ordersCount: sql`(SELECT COUNT(*)::int FROM transactions WHERE game_id = ${game.id})`,
      openPositions: sql`(SELECT COUNT(*)::int FROM holdings WHERE game_id = ${game.id})`,
    })
    .onConflictDoUpdate({
      target: [gameSnapshots.gameId, gameSnapshots.date],
      set: {
        totalValue: value,
        ordersCount: sql`excluded.orders_count`,
        openPositions: sql`excluded.open_positions`,
      },
    });
}
