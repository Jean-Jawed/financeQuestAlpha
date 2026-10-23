/**
 * FINANCEQUEST - API ROUTE: CREATE GROUP
 * POST /api/groups/create
 * Crée la partie de groupe (réglages communs, code d'invitation) et la partie de son organisateur
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { GAME_CURRENCIES, DEFAULT_GAME_CURRENCY } from '@/lib/game/currency';
import {
  CRISIS_PRESETS,
  DEFAULT_SYNC_TIMEOUT_HOURS,
  GROUP_DEFAULTS,
  GROUP_LIMITS,
  GROUP_MODES,
  GROUP_TEMPOS,
  SYNC_ONLY_MODES,
} from '@/lib/game/groups';
import { createGroup } from '@/lib/game/group-server';
import { groupErrorResponse } from '@/lib/game/group-api';
import { DEFAULT_SCENARIO, SCENARIO_IDS, getScenario } from '@/lib/game/scenarios';
import { validateGameCreation } from '@/lib/game/validations';
import { getPriceCoverage, getTradingDateOnOrAfter } from '@/lib/market/calendar';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// VALIDATION SCHEMA
// ==========================================

const L = GROUP_LIMITS;

const createGroupSchema = z.object({
  name: z.string().trim().min(L.nameMin).max(L.nameMax),
  mode: z.enum(GROUP_MODES),
  tempo: z.enum(GROUP_TEMPOS),
  scenario: z.enum(SCENARIO_IDS).default(DEFAULT_SCENARIO),
  currency: z.enum(GAME_CURRENCIES).default(DEFAULT_GAME_CURRENCY),
  // Mode crise : départ choisi parmi les krachs proposés ; sinon date libre
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  crisis: z.enum(CRISIS_PRESETS.map((preset) => preset.id) as [string, ...string[]]).optional(),
  sessionsTarget: z.number().int().min(L.sessionsMin).max(L.sessionsMax).optional(),
  targetReturn: z.number().min(L.targetMin).max(L.targetMax).optional(),
  eliminationEvery: z.number().int().min(L.eliminationEveryMin).max(L.eliminationEveryMax).optional(),
  syncTimeoutHours: z.number().int().min(L.timeoutHoursMin).max(L.timeoutHoursMax).optional(),
});

/** Jours calendaires nécessaires pour jouer N séances (week-ends et fériés compris), avec marge */
const calendarDaysFor = (sessions: number) => Math.ceil(sessions * 1.45) + 7;

// ==========================================
// API HANDLER
// ==========================================

export const POST = withAuth(async (req, { userId }) => {
  const { api, fmt, f } = await getApiI18n();

  try {
    const validation = createGroupSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json({ error: api.validationFailed }, { status: 400 });
    }
    const input = validation.data;

    if (SYNC_ONLY_MODES.includes(input.mode) && input.tempo !== 'synchro') {
      return NextResponse.json({ error: api.groupSyncOnly }, { status: 400 });
    }

    // Départ : période imposée du scénario, krach choisi, ou date libre
    const { period } = getScenario(input.scenario).rules;
    const crisis = CRISIS_PRESETS.find((preset) => preset.id === input.crisis);
    const requested = period?.start ?? (input.mode === 'crise' ? crisis?.start : input.startDate);
    if (!requested) {
      return NextResponse.json({ error: api.validationFailed }, { status: 400 });
    }

    const coverage = await getPriceCoverage();
    const startDate = requested >= coverage.start ? await getTradingDateOnOrAfter(requested) : null;
    if (!startDate || startDate >= coverage.end) {
      return NextResponse.json(
        { error: fmt(api.startDateRange, { start: f.date(coverage.start), end: f.date(coverage.end) }) },
        { status: 400 }
      );
    }

    const defaults = GROUP_DEFAULTS[input.mode];
    const sessionsTarget = input.sessionsTarget ?? defaults.sessions;

    // Assez de séances devant soi (la course, plafonnée, peut s'arrêter avant)
    const lastDay = new Date(Date.parse(`${startDate}T00:00:00Z`) + calendarDaysFor(sessionsTarget) * 86_400_000)
      .toISOString()
      .slice(0, 10);
    if (!period && input.mode !== 'course' && lastDay > coverage.end) {
      return NextResponse.json({ error: fmt(api.groupTooFewSessions, { sessions: sessionsTarget }) }, { status: 400 });
    }

    const creation = await validateGameCreation(userId, startDate);
    if (!creation.valid) {
      return NextResponse.json({ error: creation.error }, { status: 400 });
    }

    const { group, game } = await createGroup(userId, {
      name: input.name,
      mode: input.mode,
      tempo: input.tempo,
      scenario: input.scenario,
      currency: input.currency,
      startDate,
      sessionsTarget,
      targetReturn: input.mode === 'course' ? String(input.targetReturn ?? defaults.targetReturn) : null,
      eliminationEvery: input.mode === 'elimination' ? (input.eliminationEvery ?? defaults.eliminationEvery ?? 5) : null,
      syncTimeoutHours: input.tempo === 'synchro' ? (input.syncTimeoutHours ?? DEFAULT_SYNC_TIMEOUT_HOURS) : null,
      maxPlayers: input.mode === 'duel' ? 2 : L.playersMax,
    });

    return NextResponse.json(
      {
        success: true,
        data: { groupId: group.id, code: group.code, gameId: game.id },
        message: fmt(api.groupCreated, { code: group.code }),
      },
      { status: 201 }
    );
  } catch (error) {
    return groupErrorResponse(error, api, 'Create group');
  }
});
