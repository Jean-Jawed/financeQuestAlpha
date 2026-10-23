/**
 * FINANCEQUEST - PARTIES DE GROUPE : RÉPONSES D'ERREUR DES ROUTES
 */

import { NextResponse } from 'next/server';
import { GroupError } from './group-server';

type ApiMessages = Record<GroupError['key'] | 'internal', string>;

/** Erreur métier : message traduit et statut ; sinon erreur serveur journalisée */
export function groupErrorResponse(error: unknown, api: ApiMessages, context: string): NextResponse {
  if (error instanceof GroupError) {
    return NextResponse.json({ error: api[error.key] }, { status: error.status });
  }
  console.error(`[API] ${context}:`, error);
  return NextResponse.json({ error: api.internal }, { status: 500 });
}
