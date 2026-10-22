/**
 * FINANCEQUEST - API ROUTE: Leaderboard
 * GET /api/leaderboard?scenario=libre&period=all_time&limit=50
 *
 * La meilleure partie terminée de chaque joueur dans le scénario, au rendement.
 * Les abandons et les parties de moins de MIN_SESSIONS_TO_RETIRE séances n'y
 * figurent pas. Une seule requête : les valeurs finales sont enregistrées en fin de partie.
 */

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { DEFAULT_SCENARIO, isScenarioId, MIN_SESSIONS_TO_RETIRE } from '@/lib/game/scenarios';
import { getApiI18n } from '@/lib/i18n/server';

// ==========================================
// TYPES
// ==========================================

type Period = 'all_time' | 'monthly' | 'weekly';

const PERIOD_DAYS: Record<Period, number | null> = {
  all_time: null,
  monthly: 30,
  weekly: 7,
};

type Row = {
  game_id: string;
  user_name: string;
  final_value: string;
  final_return: string;
  currency: string;
  sessions_played: number;
  ended_at: string;
};

// ==========================================
// API HANDLER
// ==========================================

export async function GET(req: Request) {
  const { api } = await getApiI18n();

  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || 'all_time') as Period;
    const scenario = searchParams.get('scenario') || DEFAULT_SCENARIO;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validation
    if (!(period in PERIOD_DAYS)) {
      return NextResponse.json({ error: api.invalidPeriod }, { status: 400 });
    }

    if (!isScenarioId(scenario)) {
      return NextResponse.json({ error: api.invalidScenario }, { status: 400 });
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ error: api.invalidLimit }, { status: 400 });
    }

    // Parties terminées sur la période (date de fin), meilleure par joueur
    const days = PERIOD_DAYS[period];
    const since = days === null ? sql`` : sql`AND g.ended_at >= now() - make_interval(days => ${days})`;

    const rows = await db.execute<Row>(sql`
      SELECT * FROM (
        SELECT DISTINCT ON (g.user_id)
          g.id AS game_id, u.name AS user_name, g.final_value, g.final_return,
          g.currency, g.sessions_played, g.ended_at
        FROM games g
        JOIN users u ON u.id = g.user_id
        WHERE g.status = 'completed'
          AND g.end_reason <> 'abandoned'
          AND g.sessions_played >= ${MIN_SESSIONS_TO_RETIRE}
          AND g.scenario = ${scenario}
          ${since}
        ORDER BY g.user_id, g.final_return DESC, g.ended_at ASC
      ) best
      ORDER BY best.final_return DESC, best.ended_at ASC
      LIMIT ${limit}
    `);

    const entries = [...rows].map((row, index) => {
      const returnPercentage = parseFloat(row.final_return);
      return {
        rank: index + 1,
        gameId: row.game_id,
        userName: row.user_name,
        totalValue: parseFloat(row.final_value),
        currency: row.currency,
        returnPercentage,
        score: Math.floor(returnPercentage * 10),
        sessionsPlayed: Number(row.sessions_played),
        endedAt: row.ended_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        period,
        scenario,
        entries,
        total: entries.length,
      },
    });
  } catch (error) {
    console.error('[API] Leaderboard error:', error);
    return NextResponse.json({ error: api.internal }, { status: 500 });
  }
}
