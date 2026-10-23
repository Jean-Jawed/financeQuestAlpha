/**
 * FINANCEQUEST - PARTIES DE GROUPE : SERVEUR
 * Création, adhésion, vue du groupe à la date du joueur, tempo synchronisé
 * (séance commune, délai de secours, élimination) et messagerie
 */

import { randomInt } from 'node:crypto';
import { and, asc, desc, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  gameSnapshots,
  games,
  groupMembers,
  groupMessages,
  groups,
  users,
  type Game,
  type Group,
} from '@/lib/db/schema';
import { STARTING_CAPITAL } from './currency';
import { endGame } from './end';
import { compareStandings, INVITE_ALPHABET, MESSAGE_COOLDOWN_MS, type StandingInput } from './groups';
import { advanceToNextDay, type NextDayResult } from './next-day';
import { recordSnapshot } from './snapshots';
import type { GroupView, GroupStanding } from '@/types/groups';

// ==========================================
// ERREURS
// ==========================================

/** Erreur métier : la route la traduit (clé du dictionnaire api) */
export class GroupError extends Error {
  constructor(
    public readonly key:
      | 'groupNotFound'
      | 'groupNotMember'
      | 'groupNotOwner'
      | 'groupClosed'
      | 'groupFull'
      | 'groupAlreadyMember'
      | 'groupNotStarted'
      | 'groupNeedPlayers'
      | 'messageTooFast',
    public readonly status = 400
  ) {
    super(key);
  }
}

const DEFAULT_SETTINGS = { transaction_fees: 0.25, allow_shorting: true, allow_leverage: false };

/** Séances synchronisées avancées en parallèle (le pool de connexions en compte 5) */
const ADVANCE_CONCURRENCY = 4;

// ==========================================
// CRÉATION ET ADHÉSION
// ==========================================

export function generateInviteCode(): string {
  return Array.from({ length: 8 }, () => INVITE_ALPHABET[randomInt(INVITE_ALPHABET.length)]).join('');
}

/**
 * Créer la partie individuelle d'un joueur dans le groupe (réglages communs),
 * son adhésion et son premier instantané
 */
async function createMemberGame(group: Group, userId: string): Promise<Game> {
  const capital = STARTING_CAPITAL[group.currency].toFixed(2);

  return db.transaction(async (tx) => {
    const [game] = await tx
      .insert(games)
      .values({
        userId,
        startDate: group.startDate,
        currentDate: group.startDate,
        initialBalance: capital,
        currentBalance: capital,
        currency: group.currency,
        scenario: group.scenario,
        status: 'active',
        settings: DEFAULT_SETTINGS,
        groupId: group.id,
      })
      .returning();

    await tx.insert(groupMembers).values({ groupId: group.id, userId, gameId: game.id });
    await recordSnapshot(game, parseFloat(capital), tx);
    return game;
  });
}

export type NewGroupInput = Pick<
  Group,
  | 'name'
  | 'mode'
  | 'tempo'
  | 'scenario'
  | 'currency'
  | 'startDate'
  | 'sessionsTarget'
  | 'targetReturn'
  | 'eliminationEvery'
  | 'syncTimeoutHours'
  | 'maxPlayers'
>;

/** Créer le groupe (code d'invitation unique) et la partie de son créateur */
export async function createGroup(ownerId: string, input: NewGroupInput): Promise<{ group: Group; game: Game }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const [group] = await db
      .insert(groups)
      .values({
        ...input,
        code: generateInviteCode(),
        ownerId,
        // Tempo libre : on joue tout de suite ; synchro : salle d'attente jusqu'au lancement
        status: input.tempo === 'libre' ? 'running' : 'open',
        startedAt: input.tempo === 'libre' ? new Date() : null,
      })
      .onConflictDoNothing({ target: groups.code })
      .returning();

    if (group) {
      const game = await createMemberGame(group, ownerId);
      return { group, game };
    }
  }
  throw new Error('Code d’invitation : collisions répétées');
}

/** Groupe par code d'invitation (page d'invitation, adhésion) */
export async function findGroupByCode(code: string): Promise<Group | null> {
  return (await db.query.groups.findFirst({ where: eq(groups.code, code.toUpperCase()) })) ?? null;
}

/** Rejoindre un groupe : crée la partie du joueur aux réglages du groupe */
export async function joinGroup(userId: string, group: Group): Promise<Game> {
  // Tempo libre : tant que le groupe n'est pas terminé ; synchro : avant le lancement
  const joinable = group.tempo === 'libre' ? group.status !== 'completed' : group.status === 'open';
  if (!joinable) throw new GroupError('groupClosed');

  const members = await db.select({ userId: groupMembers.userId }).from(groupMembers).where(eq(groupMembers.groupId, group.id));
  if (members.some((member) => member.userId === userId)) throw new GroupError('groupAlreadyMember', 409);
  if (members.length >= group.maxPlayers) throw new GroupError('groupFull');

  return createMemberGame(group, userId);
}

// ==========================================
// ACCÈS
// ==========================================

export async function loadGroup(groupId: string): Promise<Group> {
  const group = await db.query.groups.findFirst({ where: eq(groups.id, groupId) });
  if (!group) throw new GroupError('groupNotFound', 404);
  return group;
}

/** Partie du joueur dans le groupe ; refuse un non-membre */
async function memberGame(groupId: string, userId: string): Promise<Game> {
  const [row] = await db
    .select({ game: games })
    .from(groupMembers)
    .innerJoin(games, eq(games.id, groupMembers.gameId))
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
  if (!row) throw new GroupError('groupNotMember', 403);
  return row.game;
}

/** Parties encore en cours du groupe */
async function activeGames(groupId: string): Promise<Game[]> {
  return db.select().from(games).where(and(eq(games.groupId, groupId), eq(games.status, 'active')));
}

/** Le groupe est terminé quand plus aucune partie n'est en cours */
export async function refreshGroupCompletion(groupId: string): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(games)
    .where(and(eq(games.groupId, groupId), eq(games.status, 'active')));

  if (Number(count) === 0) {
    await db
      .update(groups)
      .set({ status: 'completed', endedAt: new Date() })
      .where(and(eq(groups.id, groupId), sql`${groups.status} <> 'completed'`));
  }
}

// ==========================================
// TEMPO SYNCHRONISÉ
// ==========================================

/** Lancer la partie synchronisée (organisateur, au moins deux joueurs) */
export async function startGroup(group: Group, userId: string): Promise<void> {
  if (group.ownerId !== userId) throw new GroupError('groupNotOwner', 403);
  if (group.tempo !== 'synchro' || group.status !== 'open') throw new GroupError('groupClosed');

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, group.id));
  if (Number(count) < 2) throw new GroupError('groupNeedPlayers');

  await db
    .update(groups)
    .set({ status: 'running', startedAt: new Date(), syncDate: group.startDate, lastAdvancedAt: new Date() })
    .where(and(eq(groups.id, group.id), eq(groups.status, 'open')));
}

/** Heure limite de la séance synchronisée en cours (le délai de secours) */
export function syncDeadline(group: Group): Date | null {
  if (group.tempo !== 'synchro' || group.status !== 'running' || !group.lastAdvancedAt || !group.syncTimeoutHours) {
    return null;
  }
  return new Date(group.lastAdvancedAt.getTime() + group.syncTimeoutHours * 3_600_000);
}

async function inChunks<T, R>(items: T[], size: number, run: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    results.push(...(await Promise.all(items.slice(i, i + size).map(run))));
  }
  return results;
}

/**
 * Faire avancer la séance pour tout le groupe
 * Un seul appel l'emporte (mise à jour conditionnelle sur last_advanced_at) :
 * deux joueurs prêts au même instant ne font pas sauter deux séances.
 * Puis, en mode élimination, le dernier sort toutes les K séances.
 *
 * @returns Les résultats de séance par partie, ou null si un autre appel s'en est chargé
 */
export async function advanceGroup(group: Group): Promise<Map<string, NextDayResult> | null> {
  const [claimed] = await db
    .update(groups)
    .set({ lastAdvancedAt: new Date() })
    .where(
      and(
        eq(groups.id, group.id),
        eq(groups.status, 'running'),
        group.lastAdvancedAt ? eq(groups.lastAdvancedAt, group.lastAdvancedAt) : isNull(groups.lastAdvancedAt)
      )
    )
    .returning();
  if (!claimed) return null;

  const playing = await activeGames(group.id);
  const results = new Map<string, NextDayResult>();
  await inChunks(playing, ADVANCE_CONCURRENCY, async (game) => {
    results.set(game.id, await advanceToNextDay(game));
  });

  const newDate = [...results.values()].find((result) => result.success && result.newDate)?.newDate ?? group.syncDate;

  if (group.mode === 'elimination' && group.eliminationEvery) {
    await eliminate(group, results);
  }

  await Promise.all([
    db.update(groups).set({ syncDate: newDate }).where(eq(groups.id, group.id)),
    db.update(groupMembers).set({ ready: false }).where(eq(groupMembers.groupId, group.id)),
  ]);
  await refreshGroupCompletion(group.id);
  return results;
}

/** Élimination : toutes les K séances, le joueur en lice le moins riche sort ; le dernier gagne */
async function eliminate(group: Group, results: Map<string, NextDayResult>): Promise<void> {
  const remaining = await activeGames(group.id);
  if (remaining.length === 0) return;

  const sessions = remaining[0].sessionsPlayed;
  if (remaining.length > 1 && sessions > 0 && sessions % (group.eliminationEvery ?? 1) === 0) {
    const value = (game: Game) => results.get(game.id)?.state?.portfolio.totalValue ?? parseFloat(game.currentBalance);
    const last = [...remaining].sort((a, b) => value(a) - value(b))[0];
    await endGame(last.id, 'eliminated');
  }

  const survivors = await activeGames(group.id);
  if (survivors.length === 1) {
    await endGame(survivors[0].id, 'group_end');
  }
}

/** Délai de secours dépassé : la séance avance sans les retardataires */
export async function advanceIfOverdue(group: Group): Promise<boolean> {
  const deadline = syncDeadline(group);
  if (!deadline || deadline.getTime() > Date.now()) return false;
  return (await advanceGroup(group)) !== null;
}

export interface ReadyOutcome {
  /** La séance a avancé (ce joueur était le dernier attendu) */
  advanced: boolean;
  result: NextDayResult | null;
  readyCount: number;
  total: number;
}

/** Le joueur se déclare prêt ; si tous les joueurs en lice le sont, la séance avance */
export async function markReady(group: Group, game: Game): Promise<ReadyOutcome> {
  if (group.status !== 'running') throw new GroupError('groupNotStarted');

  await db
    .update(groupMembers)
    .set({ ready: true })
    .where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.gameId, game.id)));

  const rows = await db
    .select({ ready: groupMembers.ready })
    .from(groupMembers)
    .innerJoin(games, eq(games.id, groupMembers.gameId))
    .where(and(eq(groupMembers.groupId, group.id), eq(games.status, 'active')));
  const readyCount = rows.filter((row) => row.ready).length;

  if (readyCount < rows.length) {
    return { advanced: false, result: null, readyCount, total: rows.length };
  }

  const results = await advanceGroup(group);
  return { advanced: results !== null, result: results?.get(game.id) ?? null, readyCount, total: rows.length };
}

// ==========================================
// MESSAGERIE
// ==========================================

export async function postMessage(group: Group, userId: string, body: string): Promise<void> {
  await memberGame(group.id, userId);

  const [last] = await db
    .select({ createdAt: groupMessages.createdAt })
    .from(groupMessages)
    .where(and(eq(groupMessages.groupId, group.id), eq(groupMessages.userId, userId)))
    .orderBy(desc(groupMessages.id))
    .limit(1);
  if (last && Date.now() - last.createdAt.getTime() < MESSAGE_COOLDOWN_MS) {
    throw new GroupError('messageTooFast', 429);
  }

  await db.insert(groupMessages).values({ groupId: group.id, userId, body });
}

/** Modération : l'organisateur peut retirer un message */
export async function deleteMessage(group: Group, userId: string, messageId: number): Promise<void> {
  if (group.ownerId !== userId) throw new GroupError('groupNotOwner', 403);
  await db.delete(groupMessages).where(and(eq(groupMessages.groupId, group.id), eq(groupMessages.id, messageId)));
}

// ==========================================
// VUE DU GROUPE
// ==========================================

/** Date « infinie » : un joueur dont la partie est terminée voit tout */
const END_OF_TIME = '9999-12-31';

/**
 * Le groupe vu par un joueur : classement à SA date, messages, état de la séance commune
 * Les concurrents n'apparaissent que par trois chiffres (valeur, ordres, positions),
 * pris au plus tard à la date du joueur qui regarde.
 *
 * @param afterMessageId - Ne renvoyer que les messages plus récents (rafraîchissement)
 */
export async function loadGroupView(groupId: string, userId: string, afterMessageId?: number): Promise<GroupView> {
  let group = await loadGroup(groupId);

  // Rafraîchissement : la séance synchronisée avance si le délai de secours est dépassé
  if (await advanceIfOverdue(group)) {
    group = await loadGroup(groupId);
  }

  const viewerGame = await memberGame(groupId, userId);
  const viewerDate = viewerGame.status === 'completed' ? END_OF_TIME : viewerGame.currentDate;

  const memberRows = await db
    .select({ member: groupMembers, game: games, name: users.name })
    .from(groupMembers)
    .innerJoin(games, eq(games.id, groupMembers.gameId))
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(asc(groupMembers.joinedAt));

  const gameIds = memberRows.map((row) => row.game.id);
  const snapshots =
    gameIds.length === 0
      ? []
      : await db
          .selectDistinctOn([gameSnapshots.gameId])
          .from(gameSnapshots)
          .where(and(inArray(gameSnapshots.gameId, gameIds), sql`${gameSnapshots.date} <= ${viewerDate}`))
          .orderBy(gameSnapshots.gameId, desc(gameSnapshots.date));
  const snapshotOf = new Map(snapshots.map((snapshot) => [snapshot.gameId, snapshot]));

  const inputs = memberRows.map(({ member, game, name }) => {
    const snapshot = snapshotOf.get(game.id);
    const initial = parseFloat(game.initialBalance);
    // Partie terminée, et fin déjà atteinte à la date de celui qui regarde : valeur finale
    const endedForViewer = game.status === 'completed' && game.currentDate <= viewerDate;
    const totalValue = endedForViewer
      ? parseFloat(game.finalValue ?? game.currentBalance)
      : parseFloat(snapshot?.totalValue ?? game.initialBalance);

    const status: GroupStanding['status'] = !endedForViewer
      ? 'playing'
      : game.endReason === 'eliminated'
        ? 'eliminated'
        : game.endReason === 'abandoned'
          ? 'abandoned'
          : 'finished';

    const standing: StandingInput & Omit<GroupStanding, 'rank'> = {
      userId: member.userId,
      name,
      isYou: member.userId === userId,
      date: endedForViewer ? game.currentDate : (snapshot?.date ?? game.startDate),
      ahead: game.currentDate > viewerDate,
      totalValue,
      returnPercentage: initial > 0 ? ((totalValue - initial) / initial) * 100 : 0,
      ordersCount: snapshot?.ordersCount ?? 0,
      openPositions: endedForViewer ? 0 : (snapshot?.openPositions ?? 0),
      status,
      reachedIn: endedForViewer && game.endReason === 'target_reached' ? game.sessionsPlayed : null,
      eliminated: status === 'eliminated' || status === 'abandoned',
      finishedAt: game.endedAt?.toISOString() ?? null,
      ready: member.ready,
    };
    return standing;
  });

  const standings: GroupStanding[] = [...inputs]
    .sort((a, b) => compareStandings(group.mode, a, b))
    .map(({ eliminated: _eliminated, finishedAt: _finishedAt, ...standing }, index) => ({ ...standing, rank: index + 1 }));

  const messageRows = await db
    .select({ message: groupMessages, name: users.name })
    .from(groupMessages)
    .innerJoin(users, eq(users.id, groupMessages.userId))
    .where(
      afterMessageId
        ? and(eq(groupMessages.groupId, groupId), gt(groupMessages.id, afterMessageId))
        : eq(groupMessages.groupId, groupId)
    )
    .orderBy(desc(groupMessages.id))
    .limit(afterMessageId ? 100 : 50);

  const playingRows = memberRows.filter((row) => row.game.status === 'active');
  const deadline = syncDeadline(group);

  return {
    group: {
      id: group.id,
      code: group.code,
      name: group.name,
      mode: group.mode,
      tempo: group.tempo,
      scenario: group.scenario,
      currency: group.currency,
      startDate: group.startDate,
      sessionsTarget: group.sessionsTarget,
      targetReturn: group.targetReturn === null ? null : parseFloat(group.targetReturn),
      eliminationEvery: group.eliminationEvery,
      syncTimeoutHours: group.syncTimeoutHours,
      maxPlayers: group.maxPlayers,
      status: group.status,
      syncDate: group.syncDate,
      isOwner: group.ownerId === userId,
      playersCount: memberRows.length,
    },
    viewer: {
      gameId: viewerGame.id,
      date: viewerGame.currentDate,
      sessionsPlayed: viewerGame.sessionsPlayed,
      status: viewerGame.status,
      ready: memberRows.find((row) => row.member.userId === userId)?.member.ready ?? false,
    },
    standings,
    messages: messageRows.reverse().map(({ message, name }) => ({
      id: message.id,
      name,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      isYou: message.userId === userId,
    })),
    sync:
      group.tempo === 'synchro'
        ? {
            readyCount: playingRows.filter((row) => row.member.ready).length,
            total: playingRows.length,
            deadline: deadline?.toISOString() ?? null,
          }
        : null,
  };
}

/** Groupes du joueur, pour le tableau de bord : nom, mode, tempo, par partie */
export async function groupsByGame(userId: string): Promise<Map<string, Pick<Group, 'id' | 'name' | 'mode' | 'tempo' | 'status'>>> {
  const rows = await db
    .select({ gameId: groupMembers.gameId, id: groups.id, name: groups.name, mode: groups.mode, tempo: groups.tempo, status: groups.status })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId));
  return new Map(rows.map(({ gameId, ...group }) => [gameId, group]));
}
