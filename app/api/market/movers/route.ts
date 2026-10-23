/**
 * FINANCEQUEST - API ROUTE: JOURNAL DE LA SÉANCE
 * GET /api/market/movers?date=2023-06-15&scenario=libre
 * Hausses et baisses de la séance et de la semaine, humeur du marché, indices
 */

import { NextResponse } from 'next/server';
import { getMarketMovers } from '@/lib/market/movers';
import { DEFAULT_SCENARIO, isScenarioId } from '@/lib/game/scenarios';
import { getApiI18n } from '@/lib/i18n/server';

export async function GET(req: Request) {
  const { api } = await getApiI18n();

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? '';
    const scenario = searchParams.get('scenario') ?? DEFAULT_SCENARIO;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: api.invalidDate }, { status: 400 });
    }
    if (!isScenarioId(scenario)) {
      return NextResponse.json({ error: api.invalidScenario }, { status: 400 });
    }

    const movers = await getMarketMovers(date, scenario);

    // Données d'une date passée : identiques pour tous, mises en cache par le navigateur
    return NextResponse.json(
      { success: true, data: movers },
      { headers: { 'Cache-Control': 'private, max-age=3600' } }
    );
  } catch (error) {
    console.error('[API] Market movers error:', error);
    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
}
