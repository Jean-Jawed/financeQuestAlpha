/**
 * FINANCEQUEST - PAGE: Game
 * /[locale]/game/[id]
 */

import type { Metadata } from 'next';
import { GameView } from '@/components/game/game-view';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { id } = await params;
  const { site } = getI18n(locale);
  return pageMetadata({ locale, path: `/game/${id}`, title: site.seo.gameTitle, noindex: true });
}

export default async function GamePage({ params }: { params: Params }) {
  const { id } = await params;
  return <GameView gameId={id} />;
}
