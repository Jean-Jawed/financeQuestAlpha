/**
 * FINANCEQUEST - API ROUTE: GET PRICE
 * GET /api/market/price?symbol=AAPL&date=2023-06-15&currency=EUR
 * currency : devise de la partie (optionnelle, défaut : devise de l'actif)
 */

import { NextResponse } from 'next/server';
import { getQuote } from '@/lib/market/prices';
import { isGameCurrency } from '@/lib/game/currency';
import { isValidSymbol } from '@/lib/market/assets';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  const { api, fmt, f } = await getApiI18n();

  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const date = searchParams.get('date');
    const currencyParam = searchParams.get('currency');

    // Validation
    if (!symbol || !date) {
      return NextResponse.json(
        { error: fmt(api.missingParams, { params: 'symbol, date' }) },
        { status: 400 }
      );
    }

    if (!(await isValidSymbol(symbol))) {
      return NextResponse.json({ error: api.invalidSymbol }, { status: 400 });
    }

    // Vérifier format date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: api.invalidDate },
        { status: 400 }
      );
    }

    if (currencyParam !== null && !isGameCurrency(currencyParam)) {
      return NextResponse.json({ error: api.unsupportedCurrency }, { status: 400 });
    }

    // Récupérer le cours (depuis DB), converti si une devise est demandée
    const quote = await getQuote(symbol, date, currencyParam ?? 'USD');

    if (!quote) {
      return NextResponse.json(
        { error: api.priceUnavailableDate },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        date,
        priceDate: quote.date,
        assetCurrency: quote.assetCurrency,
        assetPrice: quote.assetPrice,
        // Sans devise demandée : cours dans la devise de l'actif
        currency: currencyParam ?? quote.assetCurrency,
        price: currencyParam ? quote.price : quote.assetPrice,
        fxRate: currencyParam ? quote.fxRate : 1,
      },
    });
  } catch (error) {
    console.error('[API] Get price error:', error);
    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
}
