/**
 * FINANCEQUEST - LANDING: StampedCertificate
 * L'appel final : un certificat guilloché, frappé d'un tampon « admis » quand il
 * arrive à l'écran
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { GuillocheBand, Rosette } from '@/components/brand/guilloche';
import { cn } from '@/lib/utils/cn';

interface StampedCertificateProps {
  eyebrow: string;
  title: string;
  text: string;
  stamp: string;
  cta: string;
  href: string;
}

export function StampedCertificate({ eyebrow, title, text, stamp, cta, href }: StampedCertificateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStamped(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="certificate relative mx-auto max-w-3xl overflow-hidden px-6 pb-14 pt-10 text-center sm:px-12">
      <GuillocheBand height={14} strands={4} className="absolute inset-x-0 top-0 text-brass/30" />
      <GuillocheBand height={14} strands={4} className="absolute inset-x-0 bottom-0 text-brass/30" />
      <Rosette
        size={520}
        strands={24}
        strokeWidth={0.35}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brass/[0.08]"
      />

      <div className="relative">
        <Image
          src="/gravures/laurier.webp"
          alt=""
          width={320}
          height={320}
          className="engraving mx-auto -mb-1 h-32 w-32 object-contain opacity-80"
        />
        <p className="label text-brass">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-semibold text-paper md:text-5xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-lg text-paper-dim">{text}</p>
        <Link
          href={href}
          className="mt-8 inline-flex h-14 items-center rounded border border-brass-bright/60 bg-brass px-9 font-label text-lg font-semibold uppercase tracking-[0.14em] text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_3px_0_#8E7034] transition-colors hover:bg-brass-bright active:translate-y-px"
        >
          {cta}
        </Link>
      </div>

      {/* Tampon encreur */}
      <span
        aria-hidden="true"
        className={cn(
          'stamp absolute right-4 top-6 border-loss text-loss opacity-0 mix-blend-screen sm:right-10 sm:top-10 sm:text-2xl',
          stamped && 'animate-stamp'
        )}
      >
        {stamp}
      </span>
    </div>
  );
}
