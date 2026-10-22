/**
 * FINANCEQUEST - IMAGE DE PARTAGE DU SITE
 * Une par langue ; les articles du magazine ont la leur
 */

import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getSiteMessages } from '@/lib/i18n/messages';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'FinanceQuest';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const site = getSiteMessages(isLocale(locale) ? locale : 'fr');

  return renderOgImage({
    eyebrow: site.home.eyebrow,
    title: site.home.title,
    subtitle: site.home.subtitle,
    engraving: 'corbeille.jpg',
  });
}
