/**
 * FINANCEQUEST - API ROUTE: GET PRICE HISTORY
 * GET /api/market/history?symbol=AAPL&from=2023-01-01&to=2023-12-31
 */

import { NextResponse } from 'next/server';
import { getHistory } from '@/lib/market/prices';
import { isValidSymbol } from '@/lib/market/assets';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Validation
    if (!symbol || !from || !to) {
      return NextResponse.json(
        { error: 'Paramètres manquants: symbol, from et to requis' },
        { status: 400 }
      );
    }

    if (!(await isValidSymbol(symbol))) {
      return NextResponse.json({ error: 'Symbole invalide' }, { status: 400 });
    }

    // Vérifier format dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return NextResponse.json(
        { error: 'Format de date invalide (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Récupérer l'historique (depuis DB)
    const history = await getHistory(symbol, from, to);

    if (!history || history.length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée disponible pour cette période' },
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
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
