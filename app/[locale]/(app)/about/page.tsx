/**
 * FINANCEQUEST - PAGE: Le jeu
 * Règles, catalogue (lu en base) et devises, dans la direction « La Corbeille »
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Rosette } from '@/components/brand/guilloche';
import { GroupShowcase } from '@/components/landing/group-showcase';
import { getCatalogSummary, type CatalogCategory } from '@/lib/market/assets';
import { GAME_CURRENCIES, STARTING_CAPITAL } from '@/lib/game/currency';
import { SHORT_MARGIN_RATIO } from '@/lib/game/portfolio-math';
import { INTL_LOCALE } from '@/lib/i18n/config';
import { getServerMessages } from '@/lib/i18n/messages';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({
    locale,
    path: '/about',
    title: site.seo.aboutTitle,
    description: site.seo.aboutDescription,
  });
}

// ==========================================
// DONNÉES
// ==========================================

async function loadCatalog(): Promise<CatalogCategory[]> {
  try {
    return await getCatalogSummary();
  } catch (error) {
    console.error('[About] Base prix indisponible:', error);
    return [];
  }
}

const ROMAN = ['I', 'II', 'III', 'IV'];

// ==========================================
// PAGE
// ==========================================

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const { site, f, fmt, href } = getI18n(locale);
  const t = site.about;
  const { assetTypes } = getServerMessages(locale);
  const currencyNames = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: 'currency' });

  const catalog = await loadCatalog();
  const total = catalog.reduce((sum, category) => sum + category.count, 0);

  return (
    <div>
      {/* Héros */}
      <section className="container relative mx-auto overflow-hidden px-4 pb-16 pt-14">
        <Rosette
          size={640}
          strands={22}
          strokeWidth={0.35}
          className="absolute -right-48 -top-40 hidden text-brass/[0.08] md:block"
        />
        <div className="relative grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="label text-brass">{t.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.95] text-paper md:text-7xl">
              {t.titleLine1}
              <br />
              <span className="italic text-brass">{t.titleLine2}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-paper-dim">{t.intro}</p>
          </div>
          <Image
            src="/gravures/telescripteur.webp"
            alt={t.imageAlt}
            width={320}
            height={320}
            priority
            className="engraving mx-auto opacity-90"
          />
        </div>
      </section>

      {/* Règles */}
      <section className="border-y border-line bg-ink-2">
        <div className="container mx-auto px-4 py-16">
          <h2 className="font-display text-3xl font-semibold text-paper md:text-4xl">{t.rulesTitle}</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-2">
            {t.rules.map((rule, index) => (
              <li key={rule.title} className="flex gap-5">
                <span className="w-10 shrink-0 font-display text-4xl font-semibold italic text-brass">
                  {ROMAN[index]}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-paper">{rule.title}</h3>
                  <p className="mt-2 text-paper-dim">
                    {fmt(rule.text, { margin: f.percent(SHORT_MARGIN_RATIO * 100, 0, false) })}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* En groupe */}
      <GroupShowcase locale={locale} />

      {/* Catalogue */}
      {catalog.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label text-brass">{t.catalogEyebrow}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-paper md:text-4xl">
                {fmt(t.catalogTitle, { total, families: catalog.length })}
              </h2>
            </div>
            <p className="max-w-sm text-sm text-paper-dim">{t.catalogText}</p>
          </div>

          <div className="panel mt-8 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {catalog.map((category) => (
                  <tr key={category.code} className="align-top">
                    <th scope="row" className="px-5 py-4 text-left font-display text-lg font-semibold text-paper md:w-56">
                      {assetTypes[category.code] ?? category.label}
                    </th>
                    <td className="num w-16 px-2 py-4 text-right text-2xl text-brass">{category.count}</td>
                    <td className="hidden px-5 py-4 text-paper-dim md:table-cell">
                      {category.examples.join(' · ')}
                      {category.count > category.examples.length && ' …'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Devises */}
      <section className="container mx-auto px-4 pb-16">
        <div className="certificate grid gap-8 p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:p-10">
          <div>
            <p className="label text-brass">{t.currencyEyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-paper">{t.currencyTitle}</h2>
            <p className="mt-3 text-paper-dim">{t.currencyText}</p>
          </div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 self-center sm:grid-cols-3">
            {GAME_CURRENCIES.map((code) => (
              <li key={code}>
                <span className="num block text-paper">{f.currency(STARTING_CAPITAL[code], code)}</span>
                <span className="label text-[10px]">{currencyNames.of(code)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Appel */}
      <section className="border-t border-line">
        <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center">
          <Image src="/gravures/taureau.webp" alt="" width={200} height={200} className="engraving opacity-80" />
          <h2 className="mt-4 font-display text-3xl font-semibold text-paper">{t.finalTitle}</h2>
          <Link
            href={href('/dashboard')}
            className="mt-6 inline-flex h-12 items-center rounded border border-brass-bright/60 bg-brass px-7 font-label text-base font-semibold uppercase tracking-[0.14em] text-ink shadow-[0_2px_0_#8E7034] transition-colors hover:bg-brass-bright"
          >
            {t.finalCta}
          </Link>
        </div>
      </section>
    </div>
  );
}
