/**
 * FINANCEQUEST - API ROUTE: CREATE GAME
 * POST /api/games/create
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { games } from '@/lib/db/schema';
import { validateGameCreation } from '@/lib/game/validations';
import { getPriceCoverage, getTradingDateOnOrAfter } from '@/lib/market/calendar';
import { DEFAULT_GAME_CURRENCY, GAME_CURRENCIES, STARTING_CAPITAL } from '@/lib/game/currency';
import { DEFAULT_SCENARIO, SCENARIO_IDS, getScenario, latestStartDate } from '@/lib/game/scenarios';
import { z } from 'zod';
import type { CreateGameRequest } from '@/types/api';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const createGameSchema = z.object({
  // Ignorée pour un scénario à période imposée (départ fixe)
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD').optional(),
  currency: z.enum(GAME_CURRENCIES).default(DEFAULT_GAME_CURRENCY),
  scenario: z.enum(SCENARIO_IDS).default(DEFAULT_SCENARIO),
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
  const { api, fmt, f } = await getApiI18n();

  try {
    // 1. Parser et valider le body
    const body: CreateGameRequest = await req.json();
    const validation = createGameSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => err.message);
      return NextResponse.json(
        { error: api.validationFailed, details: errors },
        { status: 400 }
      );
    }

    const { currency, scenario, settings } = validation.data;
    const { period } = getScenario(scenario).rules;
    const requestedStartDate = period?.start ?? validation.data.startDate;

    if (!requestedStartDate) {
      return NextResponse.json({ error: api.validationFailed }, { status: 400 });
    }

    // 2. Vérifier que la date est dans la plage couverte par la base prix,
    //    puis l'ajuster au premier jour de bourse disponible (week-ends et
    //    fériés sautés d'après les données)
    const coverage = await getPriceCoverage();
    const adjustedStartDate =
      requestedStartDate >= coverage.start
        ? await getTradingDateOnOrAfter(requestedStartDate)
        : null;

    // Hors période imposée, il faut pouvoir jouer assez de séances pour prendre sa retraite
    const lastStart = period ? coverage.end : latestStartDate(coverage.end);

    if (!adjustedStartDate || adjustedStartDate >= coverage.end || (!period && adjustedStartDate > lastStart)) {
      return NextResponse.json(
        {
          error: fmt(api.startDateRange, { start: f.date(coverage.start), end: f.date(lastStart) }),
        },
        { status: 400 }
      );
    }

    const wasAdjusted = adjustedStartDate !== requestedStartDate;

    let adjustmentMessage = '';
    if (wasAdjusted) {
      adjustmentMessage = fmt(api.dateAdjusted, { requested: f.date(requestedStartDate), start: f.date(adjustedStartDate) });
    }

    // 3. Valider la création du game (plage de données, limite 5 games)
    const validationResult = await validateGameCreation(userId, adjustedStartDate);
    if (!validationResult.valid) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    // 4. Créer le game avec la date ajustée
    const defaultSettings = {
      transaction_fees: 0.25,
      allow_shorting: true,
      allow_leverage: false,
      ...settings,
    };

    const startingCapital = STARTING_CAPITAL[currency].toFixed(2);

    const [newGame] = await db
      .insert(games)
      .values({
        userId,
        startDate: adjustedStartDate,
        currentDate: adjustedStartDate,
        initialBalance: startingCapital,
        currentBalance: startingCapital,
        currency,
        scenario,
        status: 'active',
        settings: defaultSettings,
      })
      .returning();

    // Retourner le game créé avec message d'ajustement si nécessaire
    return NextResponse.json(
      {
        success: true,
        data: {
          game: newGame,
          // Prefetch info removed as we use direct DB
          prefetchResult: {
            recordsStored: 0,
            strategy: 'db_direct',
          },
          adjustmentMessage: wasAdjusted ? adjustmentMessage : undefined,
        },
        message: wasAdjusted
          ? adjustmentMessage
          : api.gameOpened,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Create game error:', error);
    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
});