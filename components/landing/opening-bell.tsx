/**
 * FINANCEQUEST - LANDING: OpeningBell
 * L'ouverture de la page : un rideau d'encre se lève, la cloche sonne, le tableau
 * d'affichage fait défiler quelques séances célèbres, puis le titre apparaît.
 * La cloche est un bouton : elle sonne (avec le son du jeu) et relance le tableau.
 */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Rosette } from '@/components/brand/guilloche';
import { playSound } from '@/lib/sound';
import { cn } from '@/lib/utils/cn';

/** Séances célèbres affichées par le tableau, puis l'inconnue */
const BOARD_SEQUENCE = ['1929', '1987', '2008', '2020', '????'];
const FIRST_FLIP_MS = 1300;
const FLIP_EVERY_MS = 520;

interface OpeningBellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  signupHref: string;
  loginHref: string;
  bellLabel: string;
  boardQuestion: string;
  scrollCue: string;
}

function BellIcon() {
  return (
    <svg viewBox="0 0 120 130" className="h-full w-full" aria-hidden="true">
      {/* Joug */}
      <rect x="44" y="4" width="32" height="10" rx="3" fill="currentColor" opacity="0.8" />
      <rect x="56" y="12" width="8" height="10" fill="currentColor" opacity="0.8" />
      {/* Robe de la cloche */}
      <path
        d="M60 20 C38 20 30 38 30 62 C30 84 24 96 12 106 L108 106 C96 96 90 84 90 62 C90 38 82 20 60 20 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Gravure : filets parallèles */}
      {[44, 58, 72].map((y) => (
        <path
          key={y}
          d={`M${36 - (y - 44) / 6} ${y} Q60 ${y + 6} ${84 + (y - 44) / 6} ${y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.55"
        />
      ))}
      <path d="M12 106 L108 106 L104 112 L16 112 Z" fill="currentColor" opacity="0.85" />
      {/* Battant */}
      <line x1="60" y1="96" x2="60" y2="116" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="121" r="7" fill="currentColor" />
    </svg>
  );
}

export function OpeningBell(props: OpeningBellProps) {
  // Chaque sonnerie relance les animations (nouvelle clé)
  const [ring, setRing] = useState(0);
  const [boardIndex, setBoardIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBoardIndex(BOARD_SEQUENCE.length - 1);
      return;
    }
    setBoardIndex(0);
    const timers = BOARD_SEQUENCE.slice(1).map((_, index) =>
      window.setTimeout(() => setBoardIndex(index + 1), (ring === 0 ? FIRST_FLIP_MS : 500) + index * FLIP_EVERY_MS)
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [ring]);

  const ringBell = () => {
    playSound('bell');
    window.setTimeout(() => playSound('flaps', 0.6), 450);
    setRing((value) => value + 1);
  };

  const board = BOARD_SEQUENCE[boardIndex];

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-24 pt-28">
      {/* Fond : rosace guillochée qui tourne lentement, halo laiton */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Rosette size={1100} strands={26} strokeWidth={0.3} className="animate-spin-slow text-brass/[0.07]" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgb(201_164_92/0.12),transparent_60%)]" />
      </div>

      {/* Rideau d'encre, levé à l'ouverture */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 animate-curtain bg-black" />

      <div className="container relative mx-auto flex flex-col items-center px-4 text-center">
        {/* La cloche */}
        <button
          type="button"
          onClick={ringBell}
          aria-label={props.bellLabel}
          title={props.bellLabel}
          className="group relative h-24 w-24 text-brass outline-none transition-colors hover:text-brass-bright focus-visible:text-brass-bright md:h-28 md:w-28"
        >
          {[0, 1, 2].map((wave) => (
            <span
              key={`${ring}-${wave}`}
              aria-hidden="true"
              className="absolute inset-0 animate-ring-wave rounded-full border border-brass/50"
              style={{ animationDelay: `${(ring === 0 ? 900 : 0) + wave * 220}ms` }}
            />
          ))}
          <span
            key={ring}
            className="block h-full w-full origin-[50%_8%] animate-bell-swing"
            style={{ animationDelay: ring === 0 ? '850ms' : '0ms' }}
          >
            <BellIcon />
          </span>
        </button>

        {/* Tableau d'affichage */}
        <div aria-hidden="true" className="mt-8 flex gap-1.5 [perspective:400px]">
          {board.split('').map((char, index) => (
            <span
              key={`${board}-${index}`}
              className="relative inline-flex h-14 w-11 animate-flip-in items-center justify-center rounded-sm border border-black/60 bg-[#0A1512] font-label text-4xl font-bold text-paper shadow-[inset_0_-1px_0_rgb(239_230_210/0.06)] [transform-origin:50%_0] md:h-16 md:w-12 md:text-5xl"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              {char}
              <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/70" />
            </span>
          ))}
        </div>
        <p
          className={cn(
            'label mt-3 text-paper-faint transition-opacity duration-500',
            boardIndex === BOARD_SEQUENCE.length - 1 ? 'opacity-100' : 'opacity-0'
          )}
        >
          {props.boardQuestion}
        </p>

        <p className="label mt-10 animate-rise-slow text-brass [animation-delay:300ms]">{props.eyebrow}</p>
        <h1 className="mt-4 animate-rise-slow font-display text-5xl font-semibold leading-[0.95] tracking-tight text-paper [animation-delay:150ms] sm:text-6xl md:text-8xl">
          {props.title}
        </h1>
        <p className="mt-5 animate-rise-slow font-display text-2xl italic text-paper-dim [animation-delay:450ms] md:text-3xl">
          {props.subtitle}
        </p>

        <div className="mt-10 flex animate-rise-slow flex-col items-center gap-5 [animation-delay:600ms] sm:flex-row">
          <Link
            href={props.signupHref}
            className="inline-flex h-14 items-center rounded border border-brass-bright/60 bg-brass px-9 font-label text-lg font-semibold uppercase tracking-[0.14em] text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_3px_0_#8E7034] transition-colors hover:bg-brass-bright active:translate-y-px"
          >
            {props.ctaPrimary}
          </Link>
          <Link
            href={props.loginHref}
            className="text-paper-dim underline decoration-line-strong underline-offset-8 transition-colors hover:text-paper hover:decoration-brass"
          >
            {props.ctaSecondary}
          </Link>
        </div>
      </div>

      {/* Invitation à faire défiler */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-6 flex animate-rise-slow flex-col items-center gap-2 text-paper-faint [animation-delay:2400ms]"
      >
        <span className="label text-[10px]">{props.scrollCue}</span>
        <span className="h-10 w-px bg-gradient-to-b from-brass/70 to-transparent" />
      </div>
    </section>
  );
}
