/**
 * FINANCEQUEST - IMAGE DE PARTAGE D'UN ARTICLE
 */

import { getArticleBySlug, listArticles } from '@/content/mag';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getSiteMessages } from '@/lib/i18n/messages';
import { OG_SIZE, renderOgImage } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'FinanceQuest · La Gazette';

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    listArticles(locale).map((article) => ({ locale, slug: article.paths[locale].split('/').pop()! }))
  );
}

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : 'fr';
  const site = getSiteMessages(locale);
  const article = getArticleBySlug(locale, slug);

  return renderOgImage({
    eyebrow: site.mag.name,
    title: article?.title ?? site.mag.title,
    engraving: article ? article.image.split('/').pop()!.replace('.webp', '.jpg') : 'corbeille.jpg',
  });
}
