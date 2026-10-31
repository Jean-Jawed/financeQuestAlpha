/**
 * FINANCEQUEST - PAGE: Welcome
 * /[locale]/welcome?redirect=… : accueil après inscription (« Votre carte d'agent »)
 * Vu une seule fois : ensuite, renvoie directement vers la page demandée
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionState } from '@/lib/auth/session';
import { ProfileMissing } from '@/components/dashboard/profile-missing';
import { WelcomeOnboarding } from '@/components/profile/welcome-onboarding';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { isSafeRedirect } from '@/lib/i18n/paths';
import { loadProfile } from '@/lib/profile/server';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({ locale, path: '/welcome', title: site.seo.welcomeTitle, noindex: true });
}

export default async function WelcomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { href } = getI18n(await resolveLocale(params));
  const { redirect: requested } = await searchParams;
  const next = isSafeRedirect(requested) ? requested : href('/dashboard');

  const session = await getSessionState();
  if (session.status === 'anonymous') redirect(href('/login'));
  if (session.status === 'no-profile') return <ProfileMissing />;

  const profile = await loadProfile(session.user.id);
  if (!profile) return <ProfileMissing />;
  if (profile.onboardingDone) redirect(next);

  return <WelcomeOnboarding profile={profile} redirect={next} />;
}
