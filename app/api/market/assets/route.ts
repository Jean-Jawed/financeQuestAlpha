/**
 * FINANCEQUEST - API ROUTE: GET ASSETS
 * GET /api/market/assets?type=stock&market=nyse&search=apple
 */

import { NextResponse } from 'next/server';
import { getAssets, getAssetTypes, getMarkets } from '@/lib/market/assets';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type'); // e.g., 'stock'
    const marketParam = searchParams.get('market'); // e.g., 'nyse' or ID
    const searchParam = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // 1. Resolve Type ID
    let typeId: number | undefined;
    if (typeParam) {
      const types = await getAssetTypes();
      const typeObj = types.find(t =>
        t.code.toLowerCase() === typeParam.toLowerCase() ||
        t.id.toString() === typeParam
      );
      if (typeObj) typeId = typeObj.id;
    }

    // 2. Resolve Market ID
    let marketId: number | undefined;
    if (marketParam) {
      const markets = await getMarkets();
      const marketObj = markets.find(m =>
        m.code.toLowerCase() === marketParam.toLowerCase() ||
        m.id.toString() === marketParam
      );
      if (marketObj) marketId = marketObj.id;
    }

    // 3. Fetch Assets
    const assets = await getAssets({
      type_id: typeId,
      market_id: marketId,
      search: searchParam || undefined,
      limit: limitParam ? parseInt(limitParam) : undefined,
      offset: offsetParam ? parseInt(offsetParam) : undefined,
    });

    // 4. Transform for Frontend
    const mappedAssets = assets.map((asset) => ({
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type?.code.toLowerCase() || 'unknown',
      category: asset.asset_type_id === 1 ? 'Stocks' : 'Other', // Temporary fallback as 'category' column missing
      market: asset.market?.code || '',
      currency: asset.currency?.code || '',
    }));

    return NextResponse.json({
      success: true,
      data: {
        assets: mappedAssets,
        total: mappedAssets.length, // Ideally use a count query for total
      },
    });
  } catch (error) {
    console.error('[API] Get assets error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
