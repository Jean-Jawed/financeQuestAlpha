/**
 * FINANCEQUEST - API ROUTE: PROFILE
 * GET    /api/profile : profil du joueur connecté
 * PATCH  /api/profile : modifier des champs du profil (seuls les champs présents)
 * DELETE /api/profile : supprimer le compte (confirmation par le pseudo)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';
import { GAME_CURRENCIES } from '@/lib/game/currency';
import { LOCALES } from '@/lib/i18n/config';
import { getApiI18n } from '@/lib/i18n/server';
import { EXPERIENCE_LEVELS, isCountryCode, PROFILE_LIMITS } from '@/lib/profile/rules';
import { deleteAccount, loadProfile, ProfileError, updateProfile } from '@/lib/profile/server';

const patchSchema = z
  .object({
    name: z.string().max(PROFILE_LIMITS.nameMax * 2),
    avatarId: z.string().max(60),
    motto: z.string().max(PROFILE_LIMITS.mottoMax * 2).nullable(),
    country: z.string().refine(isCountryCode).nullable(),
    experience: z.enum(EXPERIENCE_LEVELS).nullable(),
    preferredCurrency: z.enum(GAME_CURRENCIES).nullable(),
    locale: z.enum(LOCALES),
    profilePublic: z.boolean(),
    onboardingDone: z.literal(true),
  })
  .partial()
  .strict();

const deleteSchema = z.object({ confirmName: z.string().max(100) });

type ApiMessages = Awaited<ReturnType<typeof getApiI18n>>;

function errorResponse(error: unknown, { api, fmt }: ApiMessages, context: string): NextResponse {
  if (error instanceof ProfileError) {
    return NextResponse.json({ error: fmt(api[error.key], error.params) }, { status: error.status });
  }
  console.error(`[API] ${context}:`, error);
  return NextResponse.json({ error: api.internal }, { status: 500 });
}

export const GET = withAuth(async (_req, { userId }) => {
  const i18n = await getApiI18n();

  try {
    const profile = await loadProfile(userId);
    if (!profile) return NextResponse.json({ error: i18n.api.unauthorized }, { status: 404 });
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return errorResponse(error, i18n, 'Profile');
  }
});

export const PATCH = withAuth(async (req, { userId }) => {
  const i18n = await getApiI18n();

  try {
    const validation = patchSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json({ error: i18n.api.validationFailed }, { status: 400 });
    }

    const profile = await updateProfile(userId, validation.data, (iso) => i18n.f.date(iso.slice(0, 10)));
    return NextResponse.json({ success: true, data: profile, message: i18n.api.profileSaved });
  } catch (error) {
    return errorResponse(error, i18n, 'Profile update');
  }
});

export const DELETE = withAuth(async (req, { userId }) => {
  const i18n = await getApiI18n();

  try {
    const validation = deleteSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json({ error: i18n.api.deleteConfirm }, { status: 400 });
    }

    await deleteAccount(userId, validation.data.confirmName);

    // Le compte n'existe plus : effacer les cookies de session de ce navigateur
    const supabase = await createServerClient();
    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);

    return NextResponse.json({ success: true, message: i18n.api.accountDeleted });
  } catch (error) {
    return errorResponse(error, i18n, 'Account deletion');
  }
});
