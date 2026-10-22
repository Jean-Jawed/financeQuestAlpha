/**
 * FINANCEQUEST - API ROUTE: GET MARKET FILTERS
 * GET /api/market/filters
 */

import { NextResponse } from 'next/server';
import { getAssetTypes, getMarkets, getScenarioFilterIds } from '@/lib/market/assets';
import { getScenario } from '@/lib/game/scenarios';
import { getApiI18n } from '@/lib/i18n/server';

export async function GET(req: Request) {
    const { api, server } = await getApiI18n();

    try {
        // Scénario de la partie : ne proposer que les types et places qu'il autorise
        const rules = getScenario(new URL(req.url).searchParams.get('scenario') ?? 'libre').rules;
        const restricted = Boolean(rules.assetTypes || rules.markets);

        const [allTypes, allMarkets, allowed] = await Promise.all([
            getAssetTypes(),
            getMarkets(),
            restricted ? getScenarioFilterIds(rules.assetTypes, rules.markets) : null,
        ]);
        const types = allowed ? allTypes.filter((t) => allowed.typeIds.has(t.id)) : allTypes;
        const markets = allowed ? allMarkets.filter((m) => allowed.marketIds.has(m.id)) : allMarkets;

        return NextResponse.json({
            success: true,
            data: {
                types: types.map(t => ({
                    id: t.id,
                    code: t.code,
                    label: server.assetTypes[t.code] ?? t.label
                })),
                markets: markets.map(m => ({
                    id: m.id,
                    code: m.code,
                    name: server.markets[m.code] ?? m.name,
                    is_major: m.is_major
                }))
            }
        });

    } catch (error) {
        console.error('[API] Get filters error:', error);
        return NextResponse.json({ error: api.internal }, { status: 500 });
    }
}
