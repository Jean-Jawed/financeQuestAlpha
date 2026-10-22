/**
 * FINANCEQUEST - PAGE 404
 * Adresse inconnue sous /fr ou /en (voir [...rest]/page.tsx)
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { useI18n } from '@/lib/i18n/client';

export default function NotFound() {
  const { m, href } = useI18n();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <Link href={href('/')} aria-label={m.notFound.home}>
        <Logo size="md" />
      </Link>
      <Image src="/gravures/loupe.webp" alt="" width={160} height={160} className="engraving mt-12 opacity-80" />
      <p className="label mt-6 text-brass">{m.notFound.label}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-paper md:text-5xl">{m.notFound.title}</h1>
      <p className="mt-4 max-w-md text-paper-dim">{m.notFound.text}</p>
      <Link
        href={href('/')}
        className="mt-8 inline-flex h-12 items-center rounded border border-brass-bright/60 bg-brass px-7 font-label text-base font-semibold uppercase tracking-[0.14em] text-ink shadow-[0_2px_0_#8E7034] transition-colors hover:bg-brass-bright"
      >
        {m.notFound.home}
      </Link>
    </main>
  );
}
