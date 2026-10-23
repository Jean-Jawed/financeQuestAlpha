/**
 * FINANCEQUEST - PAGE: article de La Gazette
 * /[locale]/mag/[slug] : adresses traduites (/fr/mag/avant-de-commencer-a-trader,
 * /en/mag/before-you-start-trading)
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArticleCard } from '@/components/mag/article-card';
import { FinalCta } from '@/components/mag/prose';
import { JsonLd } from '@/components/seo/json-ld';
import { getArticleBySlug, listArticles, listRelated } from '@/content/mag';
import { loadArticleBody } from '@/content/mag/bodies';
import { LOCALES, type Locale } from '@/lib/i18n/config';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { localizePath } from '@/lib/i18n/paths';
import { absoluteUrl, getSiteUrl, pageMetadata } from '@/lib/seo';
import { cn } from '@/lib/utils/cn';

type Params = Promise<{ locale: string; slug: string }>;

/** Tous les articles, dans les deux langues, générés à la construction */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    listArticles(locale).map((article) => ({ locale, slug: article.paths[locale].split('/').pop()! }))
  );
}

async function resolveArticle(params: Params) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const article = getArticleBySlug(locale, slug);

  if (!article) {
    // Adresse de l'autre langue (sélecteur FR · EN, lien partagé) : vers la bonne adresse
    for (const other of LOCALES) {
      const match = getArticleBySlug(other, slug);
      if (match) permanentRedirect(localizePath(locale, match.paths[locale]));
    }
    notFound();
  }

  return { locale, article };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, article } = await resolveArticle(params);

  return {
    ...pageMetadata({
      locale,
      path: article.paths,
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.published,
      modifiedTime: article.updated,
    }),
    keywords: article.keywords,
    authors: [{ name: 'FinanceQuest' }],
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, article } = await resolveArticle(params);
  const { site, f, fmt, href } = getI18n(locale);
  const t = site.mag;
  const { default: Body, toc } = await loadArticleBody(article.id, locale);
  const related = listRelated(article, locale);
  const otherLocale: Locale = locale === 'fr' ? 'en' : 'fr';
  const url = absoluteUrl(href(article.paths[locale]));

  return (
    <article>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.description,
            image: absoluteUrl(article.image),
            datePublished: article.published,
            dateModified: article.updated,
            inLanguage: locale,
            mainEntityOfPage: url,
            keywords: article.keywords.join(', '),
            author: { '@type': 'Organization', name: 'FinanceQuest', url: absoluteUrl(href('/')) },
            publisher: { '@id': `${getSiteUrl()}/#studio` },
            // Fiche : le terme qu'elle définit
            ...(article.term && {
              about: {
                '@type': 'DefinedTerm',
                name: article.term,
                description: article.description,
                url,
                inDefinedTermSet: { '@type': 'DefinedTermSet', name: t.fichesTitle, url: absoluteUrl(href('/mag')) },
              },
            }),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t.breadcrumbHome, item: absoluteUrl(href('/')) },
              { '@type': 'ListItem', position: 2, name: t.name, item: absoluteUrl(href('/mag')) },
              { '@type': 'ListItem', position: 3, name: article.shortTitle, item: url },
            ],
          },
        ]}
      />

      {/* En-tête */}
      <header className="container mx-auto max-w-4xl px-4 pt-10">
        <nav aria-label={t.breadcrumbLabel} className="label flex flex-wrap items-center gap-2 text-[11px]">
          <Link href={href('/')} className="hover:text-paper">
            {t.breadcrumbHome}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={href('/mag')} className="hover:text-paper">
            {t.name}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-paper-faint">{article.shortTitle}</span>
        </nav>

        <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] text-paper md:text-6xl">
          {article.title}
        </h1>
        <p className="mt-6 font-display text-xl italic leading-relaxed text-paper-dim md:text-2xl">{article.lead}</p>

        <div className="label mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]">
          <span>{t.by}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.published}>{fmt(t.publishedOn, { date: f.date(article.published) })}</time>
          <span aria-hidden="true">·</span>
          <span>{fmt(t.readingTime, { minutes: article.readingMinutes })}</span>
          <span aria-hidden="true">·</span>
          <Link
            href={localizePath(otherLocale, article.paths[otherLocale])}
            hrefLang={otherLocale}
            lang={otherLocale}
            className="text-brass hover:text-brass-bright"
          >
            {t.otherLanguage}
          </Link>
        </div>
      </header>

      <figure className="container mx-auto mt-10 max-w-5xl px-4">
        <div className="overflow-hidden rounded border-[6px] border-double border-brass/60 bg-paper p-2 shadow-lift">
          <Image
            src={article.image}
            alt={article.imageAlt}
            width={article.imageWidth}
            height={article.imageHeight}
            priority
            sizes="(min-width: 1024px) 1000px, 100vw"
            className="engraving h-auto max-h-[560px] w-full object-cover"
          />
        </div>
      </figure>

      {/* Corps, sommaire en marge sur grand écran (les fiches n'en ont pas) */}
      <div
        className={cn(
          'container mx-auto grid gap-12 px-4 py-14',
          toc.length > 0 ? 'max-w-6xl lg:grid-cols-[220px_minmax(0,1fr)]' : 'max-w-4xl'
        )}
      >
        {toc.length > 0 && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav aria-labelledby="toc-title" className="rounded border border-line bg-ink-2 p-5">
              <p id="toc-title" className="label text-brass">
                {t.toc}
              </p>
              <ol className="mt-3 space-y-2 text-sm">
                {toc.map((entry, index) => (
                  <li key={entry.id} className="flex gap-2">
                    <span className="num text-paper-faint">{String(index + 1).padStart(2, '0')}</span>
                    <a href={`#${entry.id}`} className="text-paper-dim transition-colors hover:text-paper">
                      {entry.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}

        <div className="max-w-[68ch]">
          <Body />

          <FinalCta
            href={href('/signup')}
            title={t.ctaFinalTitle}
            text={t.ctaFinalText}
            button={t.ctaFinalButton}
            note={t.ctaFinalNote}
          />

          <p className="mt-8 border-t border-line pt-4 text-sm text-paper-faint">{t.disclaimer}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-ink-2">
          <div className="container mx-auto max-w-6xl px-4 py-16">
            <h2 className="font-display text-3xl font-semibold text-paper">{t.related}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((other) => (
                <ArticleCard key={other.id} article={other} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
