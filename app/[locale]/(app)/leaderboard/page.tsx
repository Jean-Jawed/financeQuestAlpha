/**
 * FINANCEQUEST - PAGE: Leaderboard
 * /[locale]/leaderboard
 */

import type { Metadata } from 'next';
import { LeaderboardView } from '@/components/leaderboard/leaderboard-view';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({
    locale,
    path: '/leaderboard',
    title: site.seo.leaderboardTitle,
    description: site.seo.leaderboardDescription,
  });
}

export default function LeaderboardPage() {
  return <LeaderboardView />;
}
