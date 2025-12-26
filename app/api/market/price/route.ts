/**
 * FINANCEQUEST - API ROUTE: GET PRICE
 * GET /api/market/price?symbol=AAPL&date=2023-06-15
 */

import { NextResponse } from 'next/server';
import { getPrice } from '@/lib/market/cache';
import { isValidSymbol } from '@/lib/market/assets';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const date = searchParams.get('date');

    // Validation
    if (!symbol || !date) {
      return NextResponse.json(
        { error: 'Paramètres manquants: symbol et date requis' },
        { status: 400 }
      );
    }

    if (!isValidSymbol(symbol)) {
      return NextResponse.json({ error: 'Symbole invalide' }, { status: 400 });
    }

    // Vérifier format date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Format de date invalide (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Récupérer le prix (depuis cache ou API)
    const price = await getPrice(symbol, date);

    if (price === null) {
      return NextResponse.json(
        { error: 'Prix non disponible pour cette date' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        date,
        price,
      },
    });
  } catch (error) {
    console.error('[API] Get price error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
