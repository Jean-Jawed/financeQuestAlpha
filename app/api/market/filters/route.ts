/**
 * FINANCEQUEST - API ROUTE: GET MARKET FILTERS
 * GET /api/market/filters
 */

import { NextResponse } from 'next/server';
import { getAssetTypes, getMarkets } from '@/lib/market/assets';

export async function GET() {
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
                    label: t.label
                })),
                markets: markets.map(m => ({
                    id: m.id,
                    code: m.code,
                    name: m.name,
                    is_major: m.is_major
                }))
            }
        });

    } catch (error) {
        console.error('[API] Get filters error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
