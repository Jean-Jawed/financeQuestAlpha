/**
 * FINANCEQUEST - PAGE: Accueil
 * Direction artistique « La Corbeille » (docs/reviewOct2026/10_direction_artistique.md)
 * « La cloche d'ouverture » : la cloche et le tableau d'affichage, la gravure qui
 * s'imprime au défilement, le krach de 2020 rejoué séance par séance, les chiffres en
 * volets, puis les sections de texte (déroulé, présentation, questions, La Gazette)
 * et le certificat final.
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { CorbeilleScene } from '@/components/landing/corbeille-scene';
import { CrashScene } from '@/components/landing/crash-scene';
import { FlipCounters } from '@/components/landing/flip-counters';
import { OpeningBell } from '@/components/landing/opening-bell';
import { StampedCertificate } from '@/components/landing/stamped-certificate';
import { Footer } from '@/components/layout/footer';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { JsonLd } from '@/components/seo/json-ld';
import { ArticleCard } from '@/components/mag/article-card';
import { GAME_CURRENCIES } from '@/lib/game/currency';
import { getTickerData, type TickerData } from '@/lib/market/ticker';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { LOCALES } from '@/lib/i18n/config';
import { listArticles } from '@/content/mag';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

// Bande de cotations recalculée au plus toutes les heures
export const revalidate = 3600;

// ==========================================
// DONNÉES
// ==========================================

async function loadTicker(): Promise<TickerData | null> {
  try {
    return await getTickerData();
  } catch (error) {
    // L'accueil doit s'afficher même si la base prix est injoignable
    console.error('[Home] Ticker indisponible:', error);
    return null;
  }
}

const STEP_IMAGES = ['/gravures/sablier.webp', '/gravures/taureau.webp', '/gravures/telescripteur.webp'];

/** Questions de la FAQ reprises sur l'accueil */
const HOME_FAQ_COUNT = 4;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({ locale, path: '/', title: site.seo.homeTitle, absoluteTitle: true });
}

// ==========================================
// PAGE
// ==========================================

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const { ui, site, f, href } = getI18n(locale);
  const t = site.home;
  const landing = t.landing;
  const ticker = await loadTicker();
  const articles = listArticles(locale, 'article').slice(0, 2);
  const fiches = listArticles(locale, 'fiche');

  const stats = [
    { value: ticker ? f.number(ticker.assetCount, 0) : '240+', label: t.stats.assets },
    { value: ticker ? f.number(ticker.marketCount, 0) : '15', label: t.stats.markets },
    { value: String(GAME_CURRENCIES.length), label: t.stats.currencies },
    { value: ticker ? f.number(ticker.sessionCount, 0) : '500+', label: t.stats.sessions },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'VideoGame',
          name: site.seo.siteName,
          url: absoluteUrl(href('/')),
          description: site.seo.defaultDescription,
          genre: site.seo.gameGenre,
          gamePlatform: 'Web browser',
          applicationCategory: 'GameApplication',
          operatingSystem: 'Any',
          inLanguage: [...LOCALES],
          image: absoluteUrl('/gravures/corbeille.webp'),
          offers: { '@type': 'Offer', price: 0, priceCurrency: 'EUR' },
          author: { '@type': 'Organization', name: 'Virgule Studio', url: 'https://virgule-studio.fr' },
        }}
      />

      {/* Barre */}
      <header className="container absolute inset-x-0 top-0 z-20 mx-auto flex h-20 items-center justify-between gap-4 px-4">
        <Logo size="md" />
        <nav className="flex items-center gap-5 sm:gap-6">
          <Link
            href={href('/about')}
            className="hidden font-label text-sm font-semibold uppercase tracking-label text-paper-dim transition-colors hover:text-paper md:block"
          >
            {ui.nav.game}
          </Link>
          <Link
            href={href('/mag')}
            className="hidden font-label text-sm font-semibold uppercase tracking-label text-paper-dim transition-colors hover:text-paper md:block"
          >
            {ui.nav.mag}
          </Link>
          <LanguageSwitcher />
          <Link
            href={href('/login')}
            className="hidden whitespace-nowrap font-label text-sm font-semibold uppercase tracking-label text-brass transition-colors hover:text-brass-bright sm:block"
          >
            {t.login}
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <OpeningBell
          eyebrow={t.eyebrow}
          title={t.title}
          subtitle={t.subtitle}
          ctaPrimary={t.ctaPrimary}
          ctaSecondary={t.ctaSecondary}
          signupHref={href('/signup')}
          loginHref={href('/login')}
          bellLabel={landing.bellLabel}
          boardQuestion={landing.boardQuestion}
          scrollCue={landing.scrollCue}
        />

        <CorbeilleScene
          alt={t.heroAlt}
          caption={t.heroCaption}
          lines={landing.corbeilleLines as [string, string, string]}
          tickerTitle={t.tickerTitle}
          ticker={ticker?.items ?? []}
        />

        <CrashScene {...landing.crash} ctaHref={href('/signup')} />

        {/* Chiffres */}
        <section className="border-y border-line bg-ink-2">
          <FlipCounters counters={stats.map((stat) => ({ value: stat.value, label: stat.label }))} />
        </section>

        {/* Déroulé d'une partie */}
        <section className="container mx-auto px-4 py-24">
          <div className="rule-ornament mx-auto mb-4 max-w-md">
            <span className="label text-brass">{t.stepsEyebrow}</span>
          </div>
          <h2 className="mx-auto max-w-2xl text-center font-display text-4xl font-semibold text-paper md:text-5xl">
            {t.stepsTitle}
          </h2>

          <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {t.steps.map((step, index) => (
              <li key={step.title} className="text-center">
                <Image
                  src={STEP_IMAGES[index]}
                  alt=""
                  width={220}
                  height={220}
                  className="engraving mx-auto h-44 w-44 object-contain opacity-90"
                />
                <p className="num mt-6 text-sm text-brass">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-paper">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-paper-dim">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Présentation : ce qu'est le jeu, en texte (pour les joueurs et les moteurs) */}
        <section className="container mx-auto grid gap-12 px-4 py-24 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-16">
          <div>
            <p className="label text-brass">{t.introEyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-paper">{t.introTitle}</h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-paper-dim">
              {t.introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <ul className="certificate self-start space-y-4 p-8">
            {t.introPoints.map((point) => (
              <li key={point} className="flex gap-3 text-paper">
                <span aria-hidden="true" className="mt-0.5 text-brass">
                  ◆
                </span>
                {point}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ (extrait) */}
        <section className="border-y border-line bg-ink-2">
          <div className="container mx-auto px-4 py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label text-brass">{t.faqEyebrow}</p>
                <h2 className="mt-2 font-display text-4xl font-semibold text-paper">{t.faqTitle}</h2>
              </div>
              <Link
                href={href('/faq')}
                className="font-label text-sm font-semibold uppercase tracking-label text-brass transition-colors hover:text-brass-bright"
              >
                {t.faqMore} →
              </Link>
            </div>
            <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
              {site.faq.items.slice(0, HOME_FAQ_COUNT).map((item) => (
                <div key={item.q}>
                  <dt className="font-display text-xl font-semibold text-paper">{item.q}</dt>
                  <dd className="mt-2 text-paper-dim">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* La Gazette */}
        {articles.length > 0 && (
          <section className="container mx-auto px-4 py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label text-brass">{t.magEyebrow}</p>
                <h2 className="mt-2 font-display text-4xl font-semibold text-paper">{t.magTitle}</h2>
              </div>
              <Link
                href={href('/mag')}
                className="font-label text-sm font-semibold uppercase tracking-label text-brass transition-colors hover:text-brass-bright"
              >
                {t.magMore} →
              </Link>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} />
              ))}
            </div>
            {/* Les fiches pour débutants, en liens directs */}
            {fiches.length > 0 && (
              <nav aria-labelledby="home-fiches" className="mt-10 flex flex-wrap items-center gap-3">
                <span id="home-fiches" className="label mr-2 text-brass">
                  {site.mag.fichesTitle}
                </span>
                {fiches.map((fiche) => (
                  <Link
                    key={fiche.id}
                    href={href(fiche.paths[locale])}
                    className="rounded-full border border-line px-4 py-1.5 text-sm text-paper-dim transition-colors hover:border-brass/60 hover:text-paper"
                  >
                    {fiche.shortTitle}
                  </Link>
                ))}
              </nav>
            )}
          </section>
        )}

        {/* Appel final */}
        <section className="container mx-auto px-4 pb-24">
          <StampedCertificate
            eyebrow={landing.certificateEyebrow}
            title={landing.certificateTitle}
            text={landing.certificateText}
            stamp={landing.stamp}
            cta={t.ctaPrimary}
            href={href('/signup')}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
