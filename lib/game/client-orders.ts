/**
 * FINANCEQUEST - ORDRES REJOUABLES
 * Chaque ordre porte un identifiant généré par le ticket (transactions.client_order_id).
 * Si la réponse se perd et que le navigateur renvoie l'ordre, il n'est pas exécuté
 * une seconde fois : on renvoie la transaction déjà enregistrée et l'état de la partie.
 */

import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, type DbExecutor } from '@/lib/db';
import { games, transactions, type Transaction } from '@/lib/db/schema';
import { loadGameState } from './state';

/** Ordre déjà enregistré, détecté sous le verrou de la partie */
export class DuplicateOrderError extends Error {
  constructor(
    public readonly gameId: string,
    public readonly transaction: Transaction
  ) {
    super('Duplicate order');
  }
}

/** Transaction déjà enregistrée pour cet identifiant d'ordre, ou null */
export async function findClientOrder(
  executor: DbExecutor,
  gameId: string,
  orderId: string | undefined
): Promise<Transaction | null> {
  if (!orderId) return null;
  const existing = await executor.query.transactions.findFirst({
    where: and(eq(transactions.gameId, gameId), eq(transactions.clientOrderId, orderId)),
  });
  return existing ?? null;
}

/** Réponse à un ordre renvoyé : la transaction d'origine et l'état actuel de la partie */
export async function duplicateOrderResponse(gameId: string, transaction: Transaction) {
  const game = await db.query.games.findFirst({ where: eq(games.id, gameId) });
  const state = game ? await loadGameState(game) : null;

  return NextResponse.json({
    success: true,
    data: { transaction, state, achievementsUnlocked: [], duplicate: true },
  });
}
