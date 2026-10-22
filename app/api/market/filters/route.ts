/**
 * FINANCEQUEST - API ROUTE: GET MARKET FILTERS
 * GET /api/market/filters
 */

import { NextResponse } from 'next/server';
import { getAssetTypes, getMarkets } from '@/lib/market/assets';
import { getApiI18n } from '@/lib/i18n/server';

export async function GET() {
    const { api, server } = await getApiI18n();

    try {
        const [types, markets] = await Promise.all([
            getAssetTypes(),
            getMarkets()
        ]);

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
