/**
 * FINANCEQUEST - API ROUTE: GET ASSETS
 * GET /api/market/assets?type=stock (optionnel)
 */

import { NextResponse } from 'next/server';
import { ALL_ASSETS, getAssetsByType } from '@/lib/market/assets';
import type { AssetType } from '@/lib/market/assets';

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as AssetType | null;

    // Si type spécifié, filtrer
    let assets = ALL_ASSETS;
    if (type) {
      if (!['stock', 'crypto', 'bond', 'index'].includes(type)) {
        return NextResponse.json(
          { error: 'Type invalide. Types valides: stock, crypto, bond, index' },
          { status: 400 }
        );
      }
      assets = getAssetsByType(type);
    }

    return NextResponse.json({
      success: true,
      data: {
        assets: assets.map((asset) => ({
          symbol: asset.symbol,
          name: asset.name,
          type: asset.type,
          category: asset.category,
        })),
        total: assets.length,
      },
    });
  } catch (error) {
    console.error('[API] Get assets error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
