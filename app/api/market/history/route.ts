/**
 * FINANCEQUEST - API ROUTE: GET PRICE HISTORY
 * GET /api/market/history?symbol=AAPL&from=2023-01-01&to=2023-12-31
 */

import { NextResponse } from 'next/server';
import { getHistory } from '@/lib/market/prices';
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
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Validation
    if (!symbol || !from || !to) {
      return NextResponse.json(
        { error: fmt(api.missingParams, { params: 'symbol, from, to' }) },
        { status: 400 }
      );
    }

    if (!(await isValidSymbol(symbol))) {
      return NextResponse.json({ error: api.invalidSymbol }, { status: 400 });
    }

    // Vérifier format dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return NextResponse.json(
        { error: api.invalidDate },
        { status: 400 }
      );
    }

    // Récupérer l'historique (depuis DB)
    const history = await getHistory(symbol, from, to);

    if (!history || history.length === 0) {
      return NextResponse.json(
        { error: api.noHistory },
        { status: 404 }
      );
    }

    // Formater la réponse
    const formattedHistory = history.map((item) => ({
      date: item.date,
      open: item.open_price,
      high: item.high_price,
      low: item.low_price,
      close: item.close_price,
      volume: item.volume,
    }));

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        history: formattedHistory,
      },
    });
  } catch (error) {
    console.error('[API] Get price history error:', error);
    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
}
