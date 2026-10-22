/**
 * FINANCEQUEST - PAGE: La Gazette
 * /[locale]/mag : la une du magazine
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import { Rosette } from '@/components/brand/guilloche';
import { ArticleCard } from '@/components/mag/article-card';
import { JsonLd } from '@/components/seo/json-ld';
import { listArticles } from '@/content/mag';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({
    locale,
    path: '/mag',
    title: site.seo.magTitle,
    description: site.seo.magDescription,
  });
}

export default async function MagPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const { site, href } = getI18n(locale);
  const t = site.mag;
  const articles = listArticles(locale);

  return (
    <div>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: t.name,
            url: absoluteUrl(href('/mag')),
            inLanguage: locale,
            description: site.seo.magDescription,
            blogPost: articles.map((article) => ({
              '@type': 'BlogPosting',
              headline: article.title,
              url: absoluteUrl(href(article.paths[locale])),
              datePublished: article.published,
              dateModified: article.updated,
              image: absoluteUrl(article.image),
            })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t.breadcrumbHome, item: absoluteUrl(href('/')) },
              { '@type': 'ListItem', position: 2, name: t.name, item: absoluteUrl(href('/mag')) },
            ],
          },
        ]}
      />

      {/* En-tête de la gazette */}
      <section className="container relative mx-auto overflow-hidden px-4 pb-12 pt-14">
        <Rosette
          size={600}
          strands={22}
          strokeWidth={0.35}
          className="absolute -right-48 -top-48 hidden text-brass/[0.08] md:block"
        />
        <div className="relative grid items-center gap-10 border-b-[3px] border-double border-brass/50 pb-10 md:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="label text-brass">{t.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.98] text-paper md:text-6xl">{t.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-paper-dim">{t.intro}</p>
          </div>
          <Image
            src="/gravures/gazette.webp"
            alt=""
            width={280}
            height={280}
            priority
            className="engraving mx-auto hidden opacity-90 md:block"
          />
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}
