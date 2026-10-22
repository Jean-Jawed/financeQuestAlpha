/**
 * FINANCEQUEST - API ROUTE: GET ASSETS
 * GET /api/market/assets?type=stock&market=nyse&search=apple
 *   &date=2023-06-15&currency=EUR : ajoute le cours converti et la variation du jour
 */

import { NextResponse } from 'next/server';
import { getAssets, getAssetTypes, getMarkets } from '@/lib/market/assets';
import { getQuotes } from '@/lib/market/prices';
import { isGameCurrency } from '@/lib/game/currency';
import { getScenario } from '@/lib/game/scenarios';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  const { api, fmt, f } = await getApiI18n();

  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type'); // e.g., 'stock'
    const marketParam = searchParams.get('market'); // e.g., 'nyse' or ID
    const searchParam = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const dateParam = searchParams.get('date');
    const currencyParam = searchParams.get('currency');
    // Scénario de la partie : seules les valeurs qu'il autorise
    const scenarioRules = getScenario(searchParams.get('scenario') ?? 'libre').rules;
    const withQuotes =
      dateParam !== null && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && isGameCurrency(currencyParam);

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
      type_codes: scenarioRules.assetTypes,
      market_codes: scenarioRules.markets,
      limit: limitParam ? parseInt(limitParam) : undefined,
      offset: offsetParam ? parseInt(offsetParam) : undefined,
    });

    // 4. Cours du jour, convertis dans la devise de la partie (une requête batch)
    const quotes = withQuotes
      ? await getQuotes(assets.map((asset) => asset.symbol), dateParam!, currencyParam!)
      : new Map();

    // 5. Transform for Frontend
    const mappedAssets = assets.map((asset) => ({
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type?.code.toLowerCase() || 'unknown',
      category: asset.asset_type_id === 1 ? 'Stocks' : 'Other', // Temporary fallback as 'category' column missing
      market: asset.market?.code || '',
      currency: asset.currency?.code || '',
      price: quotes.get(asset.symbol)?.price ?? null,
      changePercent: quotes.get(asset.symbol)?.changePercent ?? null,
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
    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
}
