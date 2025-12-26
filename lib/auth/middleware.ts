/**
 * FINANCEQUEST - AUTH MIDDLEWARE HELPERS
 * Helpers pour vérifier l'authentification dans les API routes
 */

import { NextResponse } from 'next/server';
import { getSessionUser, requireAuth } from './session';

// ==========================================
// TYPES
// ==========================================

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

// ==========================================
// MIDDLEWARE HELPERS
// ==========================================

/**
 * Wrapper pour protéger une API route
 * Vérifie que l'utilisateur est authentifié avant d'exécuter le handler
 * 
 * @param handler - Handler de l'API route
 * @returns Protected handler
 * 
 * @example
 * ```ts
 * export const GET = withAuth(async (req, { userId }) => {
 *   // userId est garanti d'exister ici
 *   return Response.json({ userId });
 * });
 * ```
 */
export function withAuth<T extends any[]>(
  handler: (
    req: Request,
    context: { userId: string },
    ...args: T
  ) => Promise<Response> | Response
) {
  return async (req: Request, ...args: T): Promise<Response> => {
    try {
      console.log('[Auth Middleware] 🚀 Starting auth check...');
      
      // Vérifier l'authentification
      const userId = await requireAuth();
      
      console.log('[Auth Middleware] ✅ Auth successful, userId:', userId);

      // Exécuter le handler avec userId
      return await handler(req, { userId }, ...args);
    } catch (error) {
      console.error('[Auth Middleware] ❌ Unauthorized access attempt, error:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}

/**
 * Wrapper optionnel : ne bloque pas si non authentifié
 * Mais passe userId si disponible
 * 
 * @example
 * ```ts
 * export const GET = withOptionalAuth(async (req, { userId }) => {
 *   if (userId) {
 *     // User is authenticated
 *   } else {
 *     // User is not authenticated
 *   }
 * });
 * ```
 */
export function withOptionalAuth<T extends any[]>(
  handler: (
    req: Request,
    context: { userId: string | null },
    ...args: T
  ) => Promise<Response> | Response
) {
  return async (req: Request, ...args: T): Promise<Response> => {
    try {
      const user = await getSessionUser();
      const userId = user?.id || null;

      return await handler(req, { userId }, ...args);
    } catch (error) {
      console.error('[Auth Middleware] Error:', error);
      return await handler(req, { userId: null }, ...args);
    }
  };
}

/**
 * Vérifier que l'utilisateur a les permissions sur une ressource
 * (par exemple, vérifier que game.user_id === userId)
 */
export async function checkOwnership(
  userId: string,
  resourceUserId: string
): Promise<boolean> {
  return userId === resourceUserId;
}

/**
 * Middleware de vérification ownership pour API routes
 * Bloque si l'utilisateur n'est pas propriétaire de la ressource
 */
export async function requireOwnership(userId: string, resourceUserId: string): Promise<void> {
  if (userId !== resourceUserId) {
    throw new Error('Forbidden: You do not own this resource');
  }
}

/**
 * Helper pour extraire le user ID d'une request (legacy, préférer withAuth)
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    const user = await getSessionUser();
    return user?.id || null;
  } catch (error) {
    console.error('[Auth] Error getting user from request:', error);
    return null;
  }
}
