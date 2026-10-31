/**
 * FINANCEQUEST - PAGE: Profile
 * /[locale]/profile : carte d'agent, préférences, compte, carrière
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionState } from '@/lib/auth/session';
import { ProfileMissing } from '@/components/dashboard/profile-missing';
import { ProfilePage } from '@/components/profile/profile-page';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { loadCareer, loadProfile } from '@/lib/profile/server';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({ locale, path: '/profile', title: site.seo.profileTitle, noindex: true });
}

export default async function Profile({ params }: { params: Promise<{ locale: string }> }) {
  const { href } = getI18n(await resolveLocale(params));

  const session = await getSessionState();
  if (session.status === 'anonymous') redirect(href('/login'));
  if (session.status === 'no-profile') return <ProfileMissing />;

  const [profile, career] = await Promise.all([loadProfile(session.user.id), loadCareer(session.user.id)]);
  if (!profile) return <ProfileMissing />;

  return <ProfilePage profile={profile} career={career} />;
}
