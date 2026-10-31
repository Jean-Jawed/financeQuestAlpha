/**
 * FINANCEQUEST - XP : ATTRIBUTION
 * Une seule porte d'entrée, awardXp : journal idempotent (user, kind, ref),
 * jour réel (ouverture, série, retour), XP de repos, collections et paliers,
 * puis compteurs du joueur. Règles : ./rules.ts
 */

import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, xpEvents } from '@/lib/db/schema';
import { daysBetween } from '@/lib/game/achievement-rules';
import {
  CATALOG_ALL_XP,
  CATALOG_MILESTONES,
  COLLECTIONS,
  RESTED,
  XP,
  XP_RULE_VERSION,
  levelInfo,
  streakBonus,
  type CollectionKind,
} from './rules';

// ==========================================
// TYPES
// ==========================================

export interface XpGrant {
  kind: string;
  /** Clé métier : un même (kind, ref) n'est versé qu'une fois par joueur */
  ref: string;
  xp: number;
  gameId?: string | null;
  groupId?: string | null;
  /** Flux de base (séance, ordre, clôture) : doublé par l'XP de repos, compte comme jeu du jour */
  base?: boolean;
}

/** Ce que voit le joueur après une action */
export interface XpOutcome {
  gained: number;
  total: number;
  level: number;
  levelBefore: number;
  /** Progression dans le niveau, de 0 à 1 */
  progress: number;
  /** Part doublée par l'XP de repos */
  rested: number;
  lines: Array<{ kind: string; xp: number }>;
}

/** Nombre d'actifs du catalogue (palier « tous ») ; les autres tailles : COLLECTIONS */
const CATALOG_SIZE = 250;

/** Découvertes comptées par collection */
const COLLECTION_OF_KIND: Record<string, CollectionKind> = {
  'discover-order-type': 'order-type',
  'discover-asset-type': 'asset-type',
  'discover-market': 'market',
  'discover-currency': 'currency',
  'discover-scenario': 'scenario',
  'discover-group-mode': 'group-mode',
  'discover-crisis': 'crisis',
  historic: 'historic',
};

/** Date du jour réel (heure de Paris), YYYY-MM-DD */
export function playDay(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(now);
}

// ==========================================
// ATTRIBUTION
// ==========================================

/**
 * Verser de l'XP à un joueur
 * Ne lève jamais : l'XP ne doit pas faire échouer l'action qui la rapporte
 *
 * @param options.live - Jeu en direct (défaut) : ouverture du jour, série, retour et XP de repos.
 *   La reprise de l'historique (scripts/backfill-xp.ts) passe false.
 * @returns Le gain (null si rien de nouveau, ou en cas d'erreur journalisée)
 */
export async function awardXp(
  userId: string,
  grants: XpGrant[],
  { now = new Date(), live = true }: { now?: Date; live?: boolean } = {}
): Promise<XpOutcome | null> {
  const positive = grants.filter((grant) => grant.xp > 0);
  if (positive.length === 0) return null;

  try {
    return await db.transaction(async (tx) => {
      // Verrou sur le joueur : deux actions simultanées ne se marchent pas dessus
      const [user] = await tx
        .select({
          xpTotal: users.xpTotal,
          level: users.level,
          restedReserve: users.restedReserve,
          lastPlayDay: users.lastPlayDay,
          streakDays: users.streakDays,
        })
        .from(users)
        .where(eq(users.id, userId))
        .for('update');
      if (!user) return null;

      const all = [...positive];
      let reserve = user.restedReserve;
      let streak = user.streakDays;
      let lastPlayDay = user.lastPlayDay;

      // 1. Premier jeu de la journée réelle : ouverture, série, retour, réserve de repos
      const today = playDay(now);
      if (live && positive.some((grant) => grant.base) && lastPlayDay !== today) {
        const gap = lastPlayDay ? daysBetween(lastPlayDay, today) : null;
        if (gap !== null && gap > 1) reserve = Math.min(reserve + (gap - 1) * RESTED.perDay, RESTED.max);
        streak = gap === 1 ? streak + 1 : 1;
        lastPlayDay = today;

        all.push({ kind: 'day', ref: today, xp: XP.dayOpening });
        const bonus = streakBonus(streak);
        if (bonus > 0) all.push({ kind: 'streak', ref: today, xp: bonus });
        if (gap !== null && gap >= XP.comebackDays) all.push({ kind: 'comeback', ref: today, xp: XP.comeback });
      }

      // 2. Journal : ce qui a déjà été versé est ignoré
      const inserted = await insertGrants(tx, userId, all);

      // 3. XP de repos : double le flux de base nouvellement versé, tant que la réserve suit
      const baseKeys = new Set(positive.filter((grant) => grant.base).map((grant) => `${grant.kind}|${grant.ref}`));
      const baseGained = inserted.filter((row) => baseKeys.has(`${row.kind}|${row.ref}`)).reduce((sum, row) => sum + row.xp, 0);
      const rested = Math.min(baseGained, reserve);
      if (rested > 0) {
        reserve -= rested;
        const first = inserted.find((row) => baseKeys.has(`${row.kind}|${row.ref}`))!;
        inserted.push(...(await insertGrants(tx, userId, [{ kind: 'rested', ref: String(first.id), xp: rested }])));
      }

      // 4. Collections complètes et paliers du catalogue
      inserted.push(...(await insertGrants(tx, userId, await followUps(tx, userId, inserted))));

      const gained = inserted.reduce((sum, row) => sum + row.xp, 0);
      const total = user.xpTotal + gained;
      const info = levelInfo(total);

      if (gained > 0 || reserve !== user.restedReserve || lastPlayDay !== user.lastPlayDay) {
        await tx
          .update(users)
          .set({ xpTotal: total, level: info.level, restedReserve: reserve, lastPlayDay, streakDays: streak })
          .where(eq(users.id, userId));
      }
      if (gained === 0) return null;

      return {
        gained,
        total,
        level: info.level,
        levelBefore: user.level,
        progress: info.progress,
        rested,
        lines: summarize(inserted),
      };
    });
  } catch (error) {
    console.error('[XP] Attribution impossible :', error);
    return null;
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function insertGrants(tx: Tx, userId: string, grants: XpGrant[]) {
  if (grants.length === 0) return [];
  return tx
    .insert(xpEvents)
    .values(
      grants.map((grant) => ({
        userId,
        gameId: grant.gameId ?? null,
        groupId: grant.groupId ?? null,
        kind: grant.kind,
        ref: grant.ref.slice(0, 200),
        xp: Math.round(grant.xp),
        ruleVersion: XP_RULE_VERSION,
      }))
    )
    .onConflictDoNothing()
    .returning({ id: xpEvents.id, kind: xpEvents.kind, ref: xpEvents.ref, xp: xpEvents.xp });
}

/** Collections complètes et paliers du catalogue déclenchés par les découvertes versées */
async function followUps(tx: Tx, userId: string, inserted: Array<{ kind: string }>): Promise<XpGrant[]> {
  const kinds = [...new Set(inserted.map((row) => row.kind))].filter(
    (kind) => kind in COLLECTION_OF_KIND || kind === 'discover-asset'
  );
  if (kinds.length === 0) return [];

  const counts = await tx
    .select({ kind: xpEvents.kind, count: sql<number>`COUNT(*)::int` })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), inArray(xpEvents.kind, kinds)))
    .groupBy(xpEvents.kind);

  const grants: XpGrant[] = [];
  for (const { kind, count } of counts) {
    if (kind === 'discover-asset') {
      for (const [threshold, xp] of CATALOG_MILESTONES) {
        if (count >= threshold) grants.push({ kind: 'catalog', ref: String(threshold), xp });
      }
      if (count >= CATALOG_SIZE) grants.push({ kind: 'catalog', ref: 'all', xp: CATALOG_ALL_XP });
      continue;
    }
    const collection = COLLECTION_OF_KIND[kind];
    if (count >= COLLECTIONS[collection].size) {
      grants.push({ kind: 'collection', ref: collection, xp: COLLECTIONS[collection].xp });
    }
  }
  return grants;
}

/** Lignes regroupées par nature, pour l'affichage (« +8 séance, +20 découverte ») */
function summarize(rows: Array<{ kind: string; xp: number }>): XpOutcome['lines'] {
  const byKind = new Map<string, number>();
  for (const row of rows) byKind.set(row.kind, (byKind.get(row.kind) ?? 0) + row.xp);
  return [...byKind].map(([kind, xp]) => ({ kind, xp })).sort((a, b) => b.xp - a.xp);
}

/** Additionner deux résultats (ordre + succès, séance + fin de partie) */
export function mergeOutcomes(a: XpOutcome | null, b: XpOutcome | null): XpOutcome | null {
  if (!a) return b;
  if (!b) return a;
  const lines = summarize([...a.lines, ...b.lines]);
  const later = b.total >= a.total ? b : a;
  return {
    ...later,
    gained: a.gained + b.gained,
    levelBefore: Math.min(a.levelBefore, b.levelBefore),
    rested: a.rested + b.rested,
    lines,
  };
}
