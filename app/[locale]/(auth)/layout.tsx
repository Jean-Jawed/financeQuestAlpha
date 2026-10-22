/**
 * FINANCEQUEST - LAYOUT: AUTH
 * Connexion et inscription : la façade du palais Brongniart, puis le formulaire
 */

import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Rosette } from '@/components/brand/guilloche';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { getI18n, resolveLocale } from '@/lib/i18n/server';

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { ui, href } = getI18n(await resolveLocale(params));

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Gravure */}
      <aside className="relative hidden overflow-hidden border-r border-line bg-ink-2 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href={href('/')} aria-label={ui.nav.backHome} className="relative z-10 self-start">
          <Logo size="md" />
        </Link>

        <Rosette size={720} strands={22} strokeWidth={0.35} className="absolute -right-64 -top-40 text-brass/[0.08]" />

        <Image
          src="/gravures/palais.webp"
          alt={ui.auth.palaceAlt}
          width={750}
          height={1004}
          priority
          className="engraving relative z-10 mx-auto max-h-[62vh] w-auto opacity-90"
        />

        <figure className="relative z-10 max-w-md">
          <blockquote className="font-display text-xl italic leading-snug text-paper">
            {ui.auth.quote}
          </blockquote>
          <figcaption className="label mt-3">{ui.auth.quoteAuthor}</figcaption>
        </figure>
      </aside>

      {/* Formulaire */}
      <main className="relative flex flex-col items-center justify-center px-4 py-12">
        <LanguageSwitcher className="absolute right-4 top-5 sm:right-8" />
        <Link href={href('/')} aria-label={ui.nav.backHome} className="mb-10 lg:hidden">
          <Logo size="md" />
        </Link>
        {children}
      </main>
    </div>
  );
}
