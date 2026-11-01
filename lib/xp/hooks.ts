/**
 * PASTFOLIO - XP : MOMENTS DU JEU
 * Ce que rapporte chaque moment (ordre, séance, fin de partie, succès, groupes),
 * traduit en lignes du journal pour awardXp. Barème : ./rules.ts
 */

import { and, asc, count, eq, ne, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { games, groupMembers, groups, holdings, xpEvents, type Game, type Group, type Transaction } from '@/lib/db/schema';
import { CRISIS_PRESETS, compareStandings, type StandingInput } from '@/lib/game/groups';
import { calculatePortfolio } from '@/lib/game/calculations';
import { loadGameSummary } from '@/lib/game/summary';
import { getAssetBySymbol } from '@/lib/market/assets';
import {
  SESSION_MILESTONES,
  XP,
  achievementXp,
  gameEndXp,
  groupPlacementXp,
  momentsCrossed,
  targetReachedXp,
} from './rules';
import { awardXp, playDay, type XpGrant, type XpOutcome } from './server';

// ==========================================
// ORDRES
// ==========================================

/**
 * Ordre passé par le joueur (jamais les liquidations de fin de partie)
 * @param closing - Vente ou rachat : gagnant (au-dessus / au-dessous du coût moyen) ou perdant
 */
export async function orderGrants(game: Game, transaction: Transaction, closing: 'win' | 'loss' | null): Promise<XpGrant[]> {
  const gameId = game.id;
  const grants: XpGrant[] = [
    { kind: 'order', ref: transaction.id, xp: XP.order, gameId, base: true },
    { kind: 'discover-order-type', ref: transaction.type, xp: XP.firstOrderType, gameId },
    { kind: 'discover-asset', ref: transaction.symbol, xp: XP.newAsset, gameId },
  ];
  if (closing) {
    grants.push({
      kind: closing === 'win' ? 'close-win' : 'close-loss',
      ref: transaction.id,
      xp: closing === 'win' ? XP.closeWin : XP.closeLoss,
      gameId,
      base: true,
    });
  }

  const asset = await getAssetBySymbol(transaction.symbol).catch(() => null);
  if (asset?.type?.code) grants.push({ kind: 'discover-asset-type', ref: asset.type.code, xp: XP.firstAssetType, gameId });
  if (asset?.market?.code) grants.push({ kind: 'discover-market', ref: asset.market.code, xp: XP.firstMarket, gameId });

  return grants;
}

// ==========================================
// SÉANCES
// ==========================================

/**
 * Séance jouée : 4 XP, jalons de la partie, moments historiques traversés
 * @param previousDate - Date de jeu avant la séance
 */
export async function sessionGrants(game: Game, previousDate: string): Promise<XpGrant[]> {
  const gameId = game.id;
  const grants: XpGrant[] = [{ kind: 'session', ref: `${gameId}:${game.currentDate}`, xp: XP.session, gameId, base: true }];

  for (const [sessions, xp] of SESSION_MILESTONES) {
    if (game.sessionsPlayed === sessions) grants.push({ kind: 'milestone', ref: `${gameId}:${sessions}`, xp, gameId });
  }

  // « J'y étais » : avec au moins une position ouverte ; « debout » : le portefeuille a monté
  const moments = momentsCrossed(previousDate, game.currentDate);
  if (moments.length > 0) {
    const [{ open }] = await db.select({ open: count() }).from(holdings).where(eq(holdings.gameId, gameId));
    if (Number(open) > 0) {
      const [before, after] = await Promise.all([
        calculatePortfolio(gameId, previousDate),
        calculatePortfolio(gameId, game.currentDate),
      ]);
      const standing = before !== null && after !== null && after.totalValue > before.totalValue;
      for (const moment of moments) {
        grants.push({ kind: 'historic', ref: moment.id, xp: XP.historicPresent, gameId });
        if (standing) grants.push({ kind: 'historic-standing', ref: moment.id, xp: XP.historicStanding, gameId });
      }
    }
  }

  return grants;
}

// ==========================================
// PARTIES
// ==========================================

/** Partie créée (solo ou groupe) : 10 XP, première partie dans cette devise */
export function gameCreatedGrants(game: Game): XpGrant[] {
  return [
    { kind: 'game-created', ref: game.id, xp: XP.gameCreated, gameId: game.id },
    { kind: 'discover-currency', ref: game.currency, xp: XP.firstCurrency, gameId: game.id },
  ];
}

/** Partie terminée : fin, performance, rang, scénario découvert ; course : objectif atteint */
export async function gameEndGrants(game: Game): Promise<XpGrant[]> {
  if (game.status !== 'completed' || !game.endReason) return [];

  const group = game.groupId ? await db.query.groups.findFirst({ where: eq(groups.id, game.groupId) }) : null;
  const summary = await loadGameSummary(game).catch(() => null);
  const finalReturn = parseFloat(game.finalReturn ?? '0');
  const { parts, coefficient } = gameEndXp({
    endReason: game.endReason,
    sessionsPlayed: game.sessionsPlayed,
    finalReturn,
    benchmarkReturn: summary?.benchmark?.returnPercentage ?? null,
    scenario: game.scenario,
    crisis: group?.mode === 'crise',
    rank: summary?.rank?.rank ?? null,
  });

  const gameId = game.id;
  const groupId = game.groupId;
  const grants: XpGrant[] = parts.map((part) => ({
    kind: part.kind,
    ref: gameId,
    xp: Math.round(part.xp * coefficient),
    gameId,
    groupId,
  }));

  const finished = game.endReason !== 'abandoned' && game.endReason !== 'bankrupt';
  if (finished) {
    grants.push({ kind: 'discover-scenario', ref: game.scenario, xp: XP.firstScenario, gameId });
    if (group?.mode === 'crise') {
      const preset = CRISIS_PRESETS.find((crisis) => crisis.start === group.startDate);
      if (preset) grants.push({ kind: 'discover-crisis', ref: preset.id, xp: XP.firstCrisis, gameId, groupId });
    }
  }

  if (game.endReason === 'target_reached' && group) {
    grants.push({
      kind: 'target-reached',
      ref: gameId,
      xp: targetReachedXp(game.sessionsPlayed, group.sessionsTarget),
      gameId,
      groupId,
    });
  }

  return grants;
}

// ==========================================
// SUCCÈS
// ==========================================

/** Succès débloqués : points × 1,5 au premier sur le compte, × 0,4 ensuite */
export async function achievementGrants(
  game: Game,
  unlocked: Array<{ id: string; points: number }>
): Promise<XpGrant[]> {
  if (unlocked.length === 0) return [];

  const already = await db
    .select({ ref: xpEvents.ref, gameId: xpEvents.gameId })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, game.userId), eq(xpEvents.kind, 'achievement')));
  // Partie où chaque succès a été débloqué pour la première fois sur le compte
  const firstGame = new Map(already.map((row) => [row.ref, row.gameId]));

  return unlocked.map((achievement) =>
    // Déjà premier ailleurs : répétition ; premier ici (reprise relancée) ou jamais vu : premier
    firstGame.has(achievement.id) && firstGame.get(achievement.id) !== game.id
      ? { kind: 'achievement-repeat', ref: `${achievement.id}:${game.id}`, xp: achievementXp(achievement.points, false), gameId: game.id }
      : { kind: 'achievement', ref: achievement.id, xp: achievementXp(achievement.points, true), gameId: game.id }
  );
}

// ==========================================
// GROUPES
// ==========================================

/** Rejoindre (ou créer) un groupe ; l'organisateur gagne 10 XP par joueur qui le rejoint */
export async function groupJoinedXp(group: Group, userId: string, game: Game): Promise<void> {
  const owner = group.ownerId === userId;
  await awardXp(userId, [
    ...gameCreatedGrants(game),
    owner
      ? { kind: 'group-create', ref: group.id, xp: XP.groupCreate, gameId: game.id, groupId: group.id }
      : { kind: 'group-join', ref: group.id, xp: XP.groupJoin, gameId: game.id, groupId: group.id },
  ]);

  if (!owner) {
    const [{ joined }] = await db
      .select({ joined: count() })
      .from(xpEvents)
      .where(and(eq(xpEvents.userId, group.ownerId), eq(xpEvents.kind, 'group-member'), sql`${xpEvents.ref} LIKE ${`${group.id}:%`}`));
    if (Number(joined) < XP.groupMemberJoinedMax) {
      await awardXp(group.ownerId, [
        { kind: 'group-member', ref: `${group.id}:${userId}`, xp: XP.groupMemberJoined, groupId: group.id },
      ]);
    }
  }
}

/** Message de groupe : 1 XP, au plus 20 par jour réel */
export async function groupMessageXp(group: Group, userId: string, messageId: number): Promise<void> {
  const [{ today }] = await db
    .select({ today: count() })
    .from(xpEvents)
    .where(
      and(
        eq(xpEvents.userId, userId),
        eq(xpEvents.kind, 'group-message'),
        sql`(${xpEvents.createdAt} AT TIME ZONE 'Europe/Paris')::date = ${playDay()}::date`
      )
    );
  if (Number(today) >= XP.groupMessagesPerDay) return;
  await awardXp(userId, [{ kind: 'group-message', ref: String(messageId), xp: XP.groupMessage, groupId: group.id }]);
}

/** Tempo synchronisé : prêt avant le délai de secours */
export async function groupPunctualXp(group: Group, game: Game): Promise<XpOutcome | null> {
  return awardXp(game.userId, [
    { kind: 'group-punctual', ref: `${game.id}:${game.currentDate}`, xp: XP.groupPunctual, gameId: game.id, groupId: group.id },
  ]);
}

/** Élimination : les joueurs encore en lice après un tour gagnent 20 XP */
export async function eliminationSurvivedXp(group: Group, survivors: Game[], sessions: number): Promise<void> {
  await Promise.all(
    survivors.map((game) =>
      awardXp(game.userId, [
        { kind: 'elimination-survived', ref: `${group.id}:${sessions}`, xp: XP.eliminationSurvived, gameId: game.id, groupId: group.id },
      ])
    )
  );
}

/**
 * Groupe terminé : place au classement final (au moins deux joueurs non-abandonnistes),
 * mode découvert, dernier debout en élimination
 */
export async function groupCompletedXp(group: Group): Promise<void> {
  const rows = await db
    .select({ game: games, userId: groupMembers.userId })
    .from(groupMembers)
    .innerJoin(games, eq(games.id, groupMembers.gameId))
    .where(and(eq(groupMembers.groupId, group.id), ne(games.endReason, 'abandoned')))
    .orderBy(asc(groupMembers.joinedAt));
  if (rows.length < 2) return;

  const standings = rows
    .map(({ game, userId }) => ({
      userId,
      game,
      totalValue: parseFloat(game.finalValue ?? game.currentBalance),
      reachedIn: game.endReason === 'target_reached' ? game.sessionsPlayed : null,
      eliminated: game.endReason === 'eliminated',
      finishedAt: game.endedAt?.toISOString() ?? null,
    }))
    .sort((a, b) => compareStandings(group.mode, a as StandingInput, b as StandingInput));

  await Promise.all(
    standings.map((standing, index) => {
      const grants: XpGrant[] = [
        { kind: 'group-place', ref: group.id, xp: groupPlacementXp(index + 1, standings.length), gameId: standing.game.id, groupId: group.id },
        { kind: 'discover-group-mode', ref: group.mode, xp: XP.firstGroupMode, groupId: group.id },
      ];
      if (group.mode === 'elimination' && index === 0) {
        grants.push({ kind: 'last-standing', ref: group.id, xp: XP.lastStanding, gameId: standing.game.id, groupId: group.id });
      }
      return awardXp(standing.userId, grants);
    })
  );
}
