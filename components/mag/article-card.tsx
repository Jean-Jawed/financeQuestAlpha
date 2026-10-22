/**
 * FINANCEQUEST - COMPONENT: ArticleCard
 * Carte d'article de La Gazette : gravure, titre, chapô, temps de lecture
 */

import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { getI18n } from '@/lib/i18n/server';
import type { LocalizedArticle } from '@/content/mag';

export function ArticleCard({ article, locale }: { article: LocalizedArticle; locale: Locale }) {
  const { site, fmt, href } = getI18n(locale);

  return (
    <article className="panel group relative flex flex-col overflow-hidden transition-colors hover:border-brass/60">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-paper">
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="engraving object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="label text-brass">{fmt(site.mag.readingTime, { minutes: article.readingMinutes })}</p>
        <h3 className="mt-2 font-display text-2xl font-semibold leading-snug text-paper">
          {/* Lien étendu à toute la carte */}
          <Link href={href(article.paths[locale])} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-paper-dim">{article.lead}</p>
        <span className="mt-5 font-label text-sm font-semibold uppercase tracking-label text-brass transition-colors group-hover:text-brass-bright">
          {site.mag.read} →
        </span>
      </div>
    </article>
  );
}
