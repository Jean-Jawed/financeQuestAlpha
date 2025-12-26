/**
 * FINANCEQUEST - CRON: Cleanup Inactive Games
 * DELETE /api/cron/cleanup-games
 * 
 * Supprime les games inactives depuis plus de 90 jours
 * Exécuté chaque semaine via Vercel Cron
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { lt, and, eq } from 'drizzle-orm';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  try {
    // Vérifier le header d'authentification Vercel Cron
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting cleanup of inactive games...');

    // Date limite : 90 jours dans le passé
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    // Supprimer les games inactives (status != 'active' ET updatedAt < 90 jours)
    const deletedGames = await db
      .delete(games)
      .where(
        and(
          lt(games.updatedAt, cutoffDate),
          eq(games.status, 'completed') // Supprimer uniquement les completed, garder paused
        )
      )
      .returning();

    console.log(`[Cron] Deleted ${deletedGames.length} inactive games`);

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: deletedGames.length,
        cutoffDate: cutoffDate.toISOString(),
      },
      message: `${deletedGames.length} games inactives supprimées`,
    });
  } catch (error) {
    console.error('[Cron] Cleanup error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
