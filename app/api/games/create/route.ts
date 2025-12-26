/**
 * FINANCEQUEST - API ROUTE: CREATE GAME
 * POST /api/games/create
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { validateGameCreation } from '@/lib/game/validations';
import { smartPrefetch } from '@/lib/market/prefetch';
import { getTodayDate, ensureBusinessDay, formatDateDisplay } from '@/lib/utils/dates';
import { z } from 'zod';
import type { CreateGameRequest } from '@/types/api';

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const createGameSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  settings: z
    .object({
      transaction_fees: z.number().min(0).max(5).optional(),
      allow_shorting: z.boolean().optional(),
      allow_leverage: z.boolean().optional(),
    })
    .optional(),
});

// ==========================================
// API HANDLER
// ==========================================

export const POST = withAuth(async (req, { userId }) => {
  try {
    // 1. Parser et valider le body
    const body: CreateGameRequest = await req.json();
    const validation = createGameSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { startDate: requestedStartDate, settings } = validation.data;

    // 2. Ajuster au prochain jour ouvré si nécessaire (skip week-ends + fériés)
    const adjustedStartDate = ensureBusinessDay(requestedStartDate);
    const wasAdjusted = adjustedStartDate !== requestedStartDate;
    
    let adjustmentMessage = '';
    if (wasAdjusted) {
      adjustmentMessage = `La date demandée (${formatDateDisplay(requestedStartDate)}) n'est pas un jour ouvré. Votre partie commencera le ${formatDateDisplay(adjustedStartDate)} 📅`;
      console.log(`[API] Start date adjusted: ${requestedStartDate} → ${adjustedStartDate}`);
    }

    // 3. Valider que la date ajustée n'est pas dans le futur
    const today = getTodayDate();
    if (adjustedStartDate > today) {
      return NextResponse.json(
        { error: 'La date de début ne peut pas être dans le futur' },
        { status: 400 }
      );
    }

    // 4. Valider que startDate n'est pas trop ancien (besoin de 30j d'historique)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - 365 * 5); // Max 5 ans dans le passé
    const minDateStr = minDate.toISOString().split('T')[0];
    
    if (adjustedStartDate < minDateStr) {
      return NextResponse.json(
        { error: 'La date de début ne peut pas être antérieure à 5 ans' },
        { status: 400 }
      );
    }

    // 5. Valider la création du game (date valide, limite 5 games)
    const validationResult = await validateGameCreation(userId, adjustedStartDate);
    if (!validationResult.valid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    // 6. Créer le game avec la date ajustée
    const defaultSettings = {
      transaction_fees: 0.25,
      allow_shorting: true,
      allow_leverage: false,
      ...settings,
    };

    const [newGame] = await db
      .insert(games)
      .values({
        userId,
        startDate: adjustedStartDate,
        currentDate: adjustedStartDate,
        initialBalance: '10000.00',
        currentBalance: '10000.00',
        status: 'active',
        settings: defaultSettings,
      })
      .returning();

    console.log(`[API] Game created: ${newGame.id}`);

    // 7. Pre-fetch les données historiques (30j passés)
    console.log('[API] Starting smart prefetch (30 days history)...');
    const prefetchResult = await smartPrefetch(adjustedStartDate);

    console.log(`[API] Prefetch complete: ${prefetchResult.strategy}, ${prefetchResult.recordsStored} records`);

    // 8. Retourner le game créé avec message d'ajustement si nécessaire
    return NextResponse.json(
      {
        success: true,
        data: {
          game: newGame,
          prefetchResult: {
            recordsStored: prefetchResult.recordsStored,
            strategy: prefetchResult.strategy,
          },
          adjustmentMessage: wasAdjusted ? adjustmentMessage : undefined,
        },
        message: wasAdjusted 
          ? adjustmentMessage 
          : 'Partie créée avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Create game error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
});