/**
 * FINANCEQUEST - REPRISE DE L'XP
 * Rejoue l'historique de chaque joueur avec les règles de l'XP (lib/xp) :
 * parties ouvertes, ordres (clôtures gagnantes ou perdantes), découvertes,
 * séances et jalons, succès, fins de partie, groupes.
 *
 * Prérequis : docs/reviewOct2026/sql/09_projet_A_xp.sql
 * Usage     : npx tsx --env-file=.env.local scripts/backfill-xp.ts [--dry-run]
 * Rejouable : le journal est idempotent (user, kind, ref) ; rien n'est versé deux fois.
 *
 * Non repris (pas d'historique daté) : ouverture du jour, séries, XP de repos,
 * moments historiques, messages de groupe, ponctualité, tours d'élimination.
 */

import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { games, groupMembers, groups, transactions, userAchievements, users, achievements, type Game } from '@/lib/db/schema';
import { SESSION_MILESTONES, XP } from '@/lib/xp/rules';
import {
  achievementGrants,
  gameCreatedGrants,
  gameEndGrants,
  groupCompletedXp,
  orderGrants,
} from '@/lib/xp/hooks';
import { awardXp, type XpGrant } from '@/lib/xp/server';

const dryRun = process.argv.includes('--dry-run');
const EPSILON = 1e-8;

/** Ordres du joueur, sans les liquidations automatiques de fin de partie */
async function orderGrantsFor(game: Game): Promise<XpGrant[]> {
  const rows = await db.query.transactions.findMany({
    where: eq(transactions.gameId, game.id),
    orderBy: [asc(transactions.createdAt)],
  });

  // Liquidations : écrites par endGame au moment de la clôture
  const endedAt = game.endedAt?.getTime() ?? null;
  const longs = new Map<string, { quantity: number; cost: number }>();
  const shorts = new Map<string, { quantity: number; cost: number }>();
  const grants: XpGrant[] = [];

  for (const tx of rows) {
    const quantity = parseFloat(tx.quantity);
    const price = parseFloat(tx.price);
    const book = tx.type === 'buy' || tx.type === 'sell' ? longs : shorts;
    const position = book.get(tx.symbol) ?? { quantity: 0, cost: 0 };
    let closing: 'win' | 'loss' | null = null;

    if (tx.type === 'buy' || tx.type === 'short') {
      const total = position.quantity + quantity;
      position.cost = total > 0 ? (position.quantity * position.cost + quantity * price) / total : price;
      position.quantity = total;
    } else {
      if (position.quantity > EPSILON) {
        closing = tx.type === 'sell' ? (price > position.cost ? 'win' : 'loss') : price < position.cost ? 'win' : 'loss';
      }
      position.quantity = Math.max(position.quantity - quantity, 0);
    }
    book.set(tx.symbol, position);

    const liquidation = endedAt !== null && Math.abs(tx.createdAt.getTime() - endedAt) < 5_000;
    if (!liquidation) grants.push(...(await orderGrants(game, tx, closing)));
  }
  return grants;
}

/** Séances jouées (dates inconnues : une ligne par séance) et jalons */
function sessionGrantsFor(game: Game): XpGrant[] {
  const grants: XpGrant[] = [];
  for (let i = 1; i <= game.sessionsPlayed; i++) {
    grants.push({ kind: 'session', ref: `${game.id}:#${i}`, xp: XP.session, gameId: game.id, base: true });
  }
  for (const [sessions, xp] of SESSION_MILESTONES) {
    if (game.sessionsPlayed >= sessions) grants.push({ kind: 'milestone', ref: `${game.id}:${sessions}`, xp, gameId: game.id });
  }
  return grants;
}

async function main() {
  const players = await db.select({ id: users.id, name: users.name }).from(users).orderBy(asc(users.createdAt));
  console.log(`${players.length} joueurs${dryRun ? ' (essai à blanc : rien n’est écrit)' : ''}`);

  for (const player of players) {
    const playerGames = await db.query.games.findMany({
      where: eq(games.userId, player.id),
      orderBy: [asc(games.createdAt)],
    });

    let gained = 0;
    let planned = 0;
    const award = async (grants: XpGrant[]) => {
      planned += grants.reduce((sum, grant) => sum + grant.xp, 0);
      if (dryRun) return;
      const outcome = await awardXp(player.id, grants, { live: false });
      gained += outcome?.gained ?? 0;
    };

    for (const game of playerGames) {
      const grants = [...gameCreatedGrants(game), ...(await orderGrantsFor(game)), ...sessionGrantsFor(game)];

      // Groupes : création ou adhésion
      const [membership] = await db
        .select({ group: groups })
        .from(groupMembers)
        .innerJoin(groups, eq(groups.id, groupMembers.groupId))
        .where(eq(groupMembers.gameId, game.id));
      if (membership) {
        const owner = membership.group.ownerId === player.id;
        grants.push({
          kind: owner ? 'group-create' : 'group-join',
          ref: membership.group.id,
          xp: owner ? XP.groupCreate : XP.groupJoin,
          gameId: game.id,
          groupId: membership.group.id,
        });
      }

      // Succès, dans l'ordre de déblocage (premier sur le compte, puis répétitions)
      const unlocked = await db
        .select({ id: achievements.id, points: achievements.points })
        .from(userAchievements)
        .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
        .where(eq(userAchievements.gameId, game.id))
        .orderBy(asc(userAchievements.unlockedAt));

      await award(grants);
      if (!dryRun) await award(await achievementGrants(game, unlocked));
      else planned += unlocked.reduce((sum, a) => sum + Math.round(a.points * 1.5), 0);

      if (game.status === 'completed') await award(await gameEndGrants(game));
    }

    console.log(`  ${player.name} : ${playerGames.length} parties, ${dryRun ? `≈ ${planned} XP prévus` : `+${gained} XP`}`);
  }

  // Groupes terminés : classement final (verse à tous les membres)
  if (!dryRun) {
    const completed = await db.query.groups.findMany({ where: eq(groups.status, 'completed') });
    for (const group of completed) await groupCompletedXp(group);
    console.log(`${completed.length} groupes terminés repris`);
  }

  if (!dryRun) {
    const totals = await db.select({ name: users.name, xp: users.xpTotal, level: users.level }).from(users).orderBy(asc(users.createdAt));
    for (const row of totals) console.log(`  ${row.name} : ${row.xp} XP, niveau ${row.level}`);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
