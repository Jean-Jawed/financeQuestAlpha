/**
 * FINANCEQUEST - PAGE: FAQ
 * /[locale]/faq : réponses courtes d'abord, balisage FAQPage
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/json-ld';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({
    locale,
    path: '/faq',
    title: site.seo.faqTitle,
    description: site.seo.faqDescription,
  });
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const { site, href } = getI18n(locale);
  const t = site.faq;

  return (
    <div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          inLanguage: locale,
          mainEntity: t.items.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />

      <section className="container mx-auto max-w-4xl px-4 pb-10 pt-14">
        <p className="label text-brass">{t.eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-paper md:text-6xl">{t.title}</h1>
        <p className="mt-4 text-lg text-paper-dim">{t.intro}</p>
      </section>

      <section className="container mx-auto max-w-4xl px-4 pb-16">
        <div className="panel divide-y divide-line">
          {t.items.map((item, index) => (
            // <details> : réponses lisibles sans JavaScript, et présentes dans le HTML pour les moteurs
            <details key={item.q} className="group" open={index < 2}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 [&::-webkit-details-marker]:hidden">
                <h2 className="font-display text-xl font-semibold text-paper">{item.q}</h2>
                <span
                  aria-hidden="true"
                  className="mt-1 font-display text-2xl leading-none text-brass transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 text-lg leading-relaxed text-paper-dim">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-line">
        <div className="container mx-auto flex flex-col items-center px-4 py-16 text-center">
          <Image src="/gravures/loupe.webp" alt="" width={140} height={140} className="engraving opacity-80" />
          <h2 className="mt-4 font-display text-3xl font-semibold text-paper">{t.ctaTitle}</h2>
          <Link
            href={href('/signup')}
            className="mt-6 inline-flex h-12 items-center rounded border border-brass-bright/60 bg-brass px-7 font-label text-base font-semibold uppercase tracking-[0.14em] text-ink shadow-[0_2px_0_#8E7034] transition-colors hover:bg-brass-bright"
          >
            {t.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
