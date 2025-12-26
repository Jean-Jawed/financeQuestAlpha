/**
 * FINANCEQUEST - CRON: Daily Cache Update
 * GET /api/cron/update-cache
 * 
 * Met à jour le cache avec les prix d'hier
 * Exécuté chaque jour à 2h du matin via Vercel Cron
 */

import { NextResponse } from 'next/server';
import { dailyPrefetchUpdate } from '@/lib/market/prefetch';

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

    console.log('[Cron] Starting daily cache update...');

    // Exécuter le prefetch quotidien
    const result = await dailyPrefetchUpdate();

    console.log(`[Cron] Cache updated: ${result.recordsStored} records stored`);

    return NextResponse.json({
      success: result.success,
      data: {
        recordsStored: result.recordsStored,
        message: result.message,
      },
      message: `Cache mis à jour: ${result.recordsStored} records`,
    });
  } catch (error) {
    console.error('[Cron] Cache update error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
