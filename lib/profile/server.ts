/**
 * PASTFOLIO - PROFIL : SERVEUR
 * Lecture et mise à jour du profil, disponibilité du pseudo, carrière,
 * suppression du compte (voir docs/reviewOct2026/phase3/02_profil.md)
 */

import { createClient } from '@supabase/supabase-js';
import { and, eq, ne, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, type User } from '@/lib/db/schema';
import { isAvatarId } from './avatars';
import { cleanMotto, cleanName, mottoIssue, nameIssue, nextNameChange } from './rules';
import type { CareerStats, ProfilePatch, ProfileView } from '@/types/profile';

// ==========================================
// ERREURS
// ==========================================

export class ProfileError extends Error {
  constructor(
    public readonly key:
      | 'nameTaken'
      | 'nameLength'
      | 'nameChars'
      | 'nameBanned'
      | 'nameLocked'
      | 'mottoInvalid'
      | 'invalidAvatar'
      | 'deleteConfirm',
    public readonly status = 400,
    /** Variables du message (nameLocked : date) */
    public readonly params: Record<string, string> = {}
  ) {
    super(key);
  }
}

const NAME_ISSUE_KEYS = { length: 'nameLength', chars: 'nameChars', banned: 'nameBanned' } as const;

/** Violation de l'index unique sur lower(name) (erreur pg, éventuellement enveloppée par Drizzle) */
function isNameConflict(error: unknown): boolean {
  const pgError = (error as { code?: string; constraint?: string; cause?: { code?: string; constraint?: string } }) ?? {};
  const code = pgError.code ?? pgError.cause?.code;
  const constraint = pgError.constraint ?? pgError.cause?.constraint;
  return code === '23505' && constraint === 'users_name_lower_key';
}

// ==========================================
// LECTURE
// ==========================================

export function toProfileView(user: User): ProfileView {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarId: user.avatarId,
    motto: user.motto,
    country: user.country,
    experience: user.experience,
    preferredCurrency: user.preferredCurrency,
    locale: user.locale,
    profilePublic: user.profilePublic,
    onboardingDone: user.onboardingDoneAt !== null,
    nextNameChange: nextNameChange(user.nameChangedAt)?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function loadProfile(userId: string): Promise<ProfileView | null> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  return user ? toProfileView(user) : null;
}

/** Le pseudo est-il libre (sans tenir compte de la casse) ? Le sien compte comme libre */
export async function isNameAvailable(name: string, userId?: string): Promise<boolean> {
  const sameName = sql`lower(${users.name}) = lower(${cleanName(name)})`;
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(userId ? and(sameName, ne(users.id, userId)) : sameName)
    .limit(1);
  return !row;
}

/** Statistiques de carrière, en une requête */
export async function loadCareer(userId: string): Promise<CareerStats> {
  const { rows } = await db.execute<{
    games: number;
    completed: number;
    achievements: number;
    groups: number;
    best: Array<{ scenario: string; returnPercentage: string }> | null;
    xp_total: number;
    recent: Array<{ kind: string; xp: number; createdAt: string }> | null;
  }>(sql`
    SELECT
      (SELECT xp_total FROM users WHERE id = ${userId}) AS xp_total,
      (
        SELECT json_agg(json_build_object('kind', kind, 'xp', xp, 'createdAt', created_at) ORDER BY id DESC)
        FROM (SELECT id, kind, xp, created_at FROM xp_events WHERE user_id = ${userId} ORDER BY id DESC LIMIT 12) latest
      ) AS recent,
      (SELECT COUNT(*) FROM games WHERE user_id = ${userId})::int AS games,
      (SELECT COUNT(*) FROM games WHERE user_id = ${userId} AND status = 'completed')::int AS completed,
      (SELECT COUNT(DISTINCT achievement_id) FROM user_achievements WHERE user_id = ${userId})::int AS achievements,
      (SELECT COUNT(*) FROM group_members WHERE user_id = ${userId})::int AS groups,
      (
        SELECT json_agg(json_build_object('scenario', scenario, 'returnPercentage', best) ORDER BY best DESC)
        FROM (
          SELECT scenario, MAX(final_return) AS best
          FROM games
          WHERE user_id = ${userId} AND status = 'completed' AND end_reason <> 'abandoned' AND final_return IS NOT NULL
          GROUP BY scenario
        ) per_scenario
      ) AS best
  `);
  const row = rows[0];

  return {
    games: Number(row?.games ?? 0),
    completed: Number(row?.completed ?? 0),
    achievements: Number(row?.achievements ?? 0),
    groups: Number(row?.groups ?? 0),
    bestByScenario: (row?.best ?? []).map((entry) => ({
      scenario: entry.scenario,
      returnPercentage: Number(entry.returnPercentage),
    })),
    xpTotal: Number(row?.xp_total ?? 0),
    recentXp: row?.recent ?? [],
  };
}

// ==========================================
// MISE À JOUR
// ==========================================

/**
 * Appliquer une modification du profil (champs présents seulement)
 * @param formatDate - Date du prochain changement de pseudo, pour le message
 */
export async function updateProfile(
  userId: string,
  patch: ProfilePatch,
  formatDate: (iso: string) => string
): Promise<ProfileView> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new ProfileError('nameTaken', 404);

  const changes: Partial<typeof users.$inferInsert> = {};

  if (patch.name !== undefined) {
    const name = cleanName(patch.name);
    if (name !== user.name) {
      const issue = nameIssue(name);
      if (issue) throw new ProfileError(NAME_ISSUE_KEYS[issue]);

      const lockedUntil = nextNameChange(user.nameChangedAt);
      if (lockedUntil) throw new ProfileError('nameLocked', 400, { date: formatDate(lockedUntil.toISOString()) });

      if (!(await isNameAvailable(name, userId))) throw new ProfileError('nameTaken', 409);
      changes.name = name;
      changes.nameChangedAt = new Date();
    }
  }

  if (patch.avatarId !== undefined) {
    if (!isAvatarId(patch.avatarId)) throw new ProfileError('invalidAvatar');
    changes.avatarId = patch.avatarId;
  }

  if (patch.motto !== undefined) {
    const motto = patch.motto === null ? '' : cleanMotto(patch.motto);
    if (motto && mottoIssue(motto)) throw new ProfileError('mottoInvalid');
    changes.motto = motto || null;
  }

  if (patch.country !== undefined) changes.country = patch.country;
  if (patch.experience !== undefined) changes.experience = patch.experience;
  if (patch.preferredCurrency !== undefined) changes.preferredCurrency = patch.preferredCurrency;
  if (patch.locale !== undefined) changes.locale = patch.locale;
  if (patch.profilePublic !== undefined) changes.profilePublic = patch.profilePublic;
  if (patch.onboardingDone && user.onboardingDoneAt === null) changes.onboardingDoneAt = new Date();

  if (Object.keys(changes).length === 0) return toProfileView(user);

  try {
    const [updated] = await db
      .update(users)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return toProfileView(updated);
  } catch (error) {
    // Deux joueurs ont pris le même pseudo au même instant
    if (isNameConflict(error)) throw new ProfileError('nameTaken', 409);
    throw error;
  }
}

// ==========================================
// SUPPRESSION DU COMPTE
// ==========================================

/**
 * Supprimer le compte : l'utilisateur Auth est supprimé avec la clé service,
 * la cascade emporte profil, parties, positions, ordres, succès, groupes vides
 * et messages ; les groupes organisés passent au plus ancien membre
 * (trigger on_user_deleted, script 08)
 *
 * @param confirmName - Pseudo tapé par le joueur pour confirmer
 */
export async function deleteAccount(userId: string, confirmName: string): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return;

  if (cleanName(confirmName).toLowerCase() !== user.name.toLowerCase()) {
    throw new ProfileError('deleteConfirm');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante');

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
