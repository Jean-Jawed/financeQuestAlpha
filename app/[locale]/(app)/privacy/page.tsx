/**
 * FINANCEQUEST - PAGE: Privacy
 * /[locale]/privacy : politique de confidentialité
 */

import type { Metadata } from 'next';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { site } = getI18n(locale);
  return pageMetadata({
    locale,
    path: '/privacy',
    title: site.seo.privacyTitle,
    description: site.seo.privacyDescription,
  });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { site } = getI18n(await resolveLocale(params));
  const t = site.privacy;

  return (
    <div className="container mx-auto max-w-3xl px-4 pb-16 pt-14">
      <p className="label text-brass">{t.eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-paper md:text-6xl">{t.title}</h1>
      <p className="label mt-3 text-[10px]">{t.updated}</p>
      <p className="mt-6 text-lg leading-relaxed text-paper-dim">{t.intro}</p>

      <div className="mt-10 space-y-8">
        {t.sections.map((section) => (
          <section key={section.title} className="panel p-6">
            <h2 className="font-display text-2xl font-semibold text-paper">{section.title}</h2>
            <ul className="mt-4 space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-paper-dim">
                  <span aria-hidden="true" className="mt-0.5 text-brass">
                    ◆
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
