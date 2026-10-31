/**
 * FINANCEQUEST - API ROUTE: Admin Moderate
 * POST /api/admin/moderate : réinitialiser le pseudo, la devise ou l'avatar d'un joueur
 * Réservé aux comptes ayant le rôle `admin` (app_metadata)
 *
 * Pseudo remplacé par « Agent XXXX », et changement de nouveau libre pour le joueur
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { checkAdmin } from '@/lib/auth/session';
import { randomAvatarId } from '@/lib/profile/avatars';

const moderateSchema = z.object({
  /** Pseudo actuel (sans tenir compte de la casse) */
  name: z.string().trim().min(1).max(50),
  resetName: z.boolean().default(false),
  resetMotto: z.boolean().default(false),
  resetAvatar: z.boolean().default(false),
});

/** « Agent 4F7K » : lettres et chiffres sans ambiguïté */
function placeholderName(): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `Agent ${code}`;
}

export async function POST(req: Request) {
  const access = await checkAdmin();
  if (access === 'unauthenticated') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (access === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const validation = moderateSchema.safeParse(await req.json());
    if (!validation.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 });

    const { name, resetName, resetMotto, resetAvatar } = validation.data;
    const user = await db.query.users.findFirst({ where: sql`lower(${users.name}) = lower(${name})` });
    if (!user) return NextResponse.json({ error: 'Joueur introuvable' }, { status: 404 });

    const changes: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };
    if (resetName) {
      changes.name = placeholderName();
      changes.nameChangedAt = null;
    }
    if (resetMotto) changes.motto = null;
    if (resetAvatar) changes.avatarId = randomAvatarId(user.avatarId);

    // Très rare collision du pseudo de remplacement : un second tirage suffit
    let updated;
    try {
      [updated] = await db.update(users).set(changes).where(eq(users.id, user.id)).returning({ name: users.name });
    } catch {
      if (!resetName) throw new Error('Moderation update failed');
      [updated] = await db
        .update(users)
        .set({ ...changes, name: placeholderName() })
        .where(eq(users.id, user.id))
        .returning({ name: users.name });
    }

    return NextResponse.json({ success: true, message: `Profil modéré : ${updated.name}` });
  } catch (error) {
    console.error('[API] Admin moderate:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
