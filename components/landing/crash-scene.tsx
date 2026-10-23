/**
 * FINANCEQUEST - LANDING: CrashScene
 * Le krach du Covid, rejoué au fil du défilement : la courbe réelle du S&P 500
 * (clôtures du 3 février au 31 août 2020) se trace séance après séance, un tableau
 * affiche la date, le niveau et la baisse depuis le sommet, et la question tombe au creux.
 */

'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import curve from '@/content/landing/sp500-2020.json';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';
import { ScrollScene, useSceneValue } from './scroll-scene';
import { sceneFrom } from './scene-style';

const POINTS = curve as [string, number][];
const LAST = POINTS.length - 1;
const Y_MIN = 2100;
const Y_MAX = 3600;

/** Séances commentées : date, clé du texte, position de l'étiquette */
const NOTES = [
  { date: '2020-02-19', key: 'peak', side: 'above' },
  { date: '2020-03-09', key: 'halt', side: 'left' },
  { date: '2020-03-16', key: 'plunge', side: 'left' },
  { date: '2020-03-23', key: 'trough', side: 'below' },
  { date: '2020-08-18', key: 'record', side: 'above' },
] as const;

type NoteKey = (typeof NOTES)[number]['key'];

const indexOf = (date: string) => POINTS.findIndex(([d]) => d === date);
const PEAK = indexOf('2020-02-19');
const TROUGH = indexOf('2020-03-23');
const RECORD = indexOf('2020-08-18');

const x = (index: number) => (index / LAST) * 1000;
const y = (value: number) => ((Y_MAX - value) / (Y_MAX - Y_MIN)) * 500;

/** Séance affichée selon l'avancement : la courbe se trace entre 4 % et 86 % de la scène */
const sessionAt = (progress: number) => Math.round(Math.min(Math.max((progress - 0.04) / 0.82, 0), 1) * LAST);

interface CrashSceneProps {
  eyebrow: string;
  intro: string;
  question: string;
  /** Avec {gain} */
  missed: string;
  index: string;
  fromPeak: string;
  peakLine: string;
  notes: Record<NoteKey, string>;
  conclusion: string;
  cta: string;
  ctaHref: string;
}

export function CrashScene(props: CrashSceneProps) {
  return (
    <ScrollScene screens={4} stageClassName="flex items-center" aria-labelledby="crash-title">
      <CrashStage {...props} />
    </ScrollScene>
  );
}

function CrashStage(props: CrashSceneProps) {
  const { m, f, fmt } = useI18n();
  const session = useSceneValue(sessionAt, 0);
  const [date, close] = POINTS[session];
  const peakValue = POINTS[PEAK][1];
  const drawdown = session >= PEAK ? (close / peakValue - 1) * 100 : 0;
  const reboundGain = (POINTS[RECORD][1] / POINTS[TROUGH][1] - 1) * 100;

  const path = useMemo(
    () =>
      POINTS.slice(0, session + 1)
        .map(([, value], index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)} ${y(value).toFixed(1)}`)
        .join(''),
    [session]
  );
  // Zone de baisse : entre la ligne du sommet et la courbe, depuis le sommet
  const area = useMemo(() => {
    if (session <= PEAK) return '';
    const top = y(peakValue).toFixed(1);
    const line = POINTS.slice(PEAK, session + 1)
      .map(([, value], offset) => `L${x(PEAK + offset).toFixed(1)} ${Math.max(y(value), Number(top)).toFixed(1)}`)
      .join('');
    return `M${x(PEAK).toFixed(1)} ${top}${line}L${x(session).toFixed(1)} ${top}Z`;
  }, [session, peakValue]);

  const d = new Date(`${date}T00:00:00Z`);
  const board = [String(d.getUTCDate()).padStart(2, '0'), m.game.solari.months[d.getUTCMonth()], String(d.getUTCFullYear())];
  const pct = (value: number, decimals = 1) => `${value >= 0 ? '+' : '−'}${f.percent(Math.abs(value), decimals, false)}`;

  return (
    <div className="container mx-auto w-full px-4">
      <div className="mx-auto max-w-5xl">
        <p className="label text-brass">{props.eyebrow}</p>
        <h2 id="crash-title" className="mt-2 min-h-[2.4em] font-display text-3xl font-semibold leading-tight text-paper sm:min-h-[1.2em] md:text-5xl">
          <span key={session >= TROUGH ? 'q' : 'i'} className="inline-block animate-rise">
            {session >= TROUGH ? props.question : props.intro}
          </span>
        </h2>
        <p
          className={cn(
            'mt-1 h-6 font-display text-lg italic text-paper-dim transition-opacity duration-500 md:text-xl',
            session >= RECORD ? 'opacity-100' : 'opacity-0'
          )}
        >
          {fmt(props.missed, { gain: pct(reboundGain, 0) })}
        </p>

        {/* Tableau : date, niveau, baisse depuis le sommet */}
        <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-3" aria-live="off">
          <div className="flex gap-1.5 [perspective:400px]" aria-label={f.date(date)}>
            {board.map((value, index) => (
              <span
                key={`${index}-${value}`}
                className="relative inline-flex h-10 min-w-[2.6ch] animate-flip-in items-center justify-center rounded-sm border border-black/60 bg-[#0A1512] px-2 font-label text-2xl font-bold text-paper [transform-origin:50%_0]"
              >
                {value}
                <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/70" />
              </span>
            ))}
          </div>
          <div>
            <p className="label text-[10px]">{props.index}</p>
            <p className="num text-2xl text-paper">{f.number(close, 2)}</p>
          </div>
          <div>
            <p className="label text-[10px]">{props.fromPeak}</p>
            <p className={cn('num text-2xl', drawdown < -0.05 ? 'text-loss' : 'text-paper-dim')}>{pct(drawdown)}</p>
          </div>
        </div>

        {/* Courbe */}
        <div className="relative mt-6 h-[34svh] w-full sm:h-[38svh]">
          <svg viewBox="0 0 1000 500" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {[2400, 2800, 3200].map((level) => (
              <line key={level} x1="0" x2="1000" y1={y(level)} y2={y(level)} stroke="rgb(239 230 210 / 0.08)" vectorEffect="non-scaling-stroke" />
            ))}
            <line
              x1={x(PEAK)}
              x2="1000"
              y1={y(peakValue)}
              y2={y(peakValue)}
              stroke="#C9A45C"
              strokeOpacity="0.55"
              strokeDasharray="4 6"
              vectorEffect="non-scaling-stroke"
            />
            {area && <path d={area} fill="#D9603F" fillOpacity="0.16" />}
            <path d={path} fill="none" stroke="#EFE6D2" strokeWidth="2.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>

          <span
            className="label absolute left-[42%] text-[10px] text-brass/80"
            style={{ top: `calc(${(y(peakValue) / 500) * 100}% - 18px)` }}
          >
            {props.peakLine}
          </span>

          {/* Point de la séance en cours */}
          <span
            aria-hidden="true"
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper shadow-[0_0_0_4px_rgb(239_230_210/0.15)]"
            style={{ left: `${x(session) / 10}%`, top: `${(y(close) / 500) * 100}%` }}
          />

          {NOTES.map((note) => {
            const at = indexOf(note.date);
            const value = POINTS[at][1];
            const left = x(at) / 10;
            const top = (y(value) / 500) * 100;
            const visible = session >= at;
            return (
              <div
                key={note.key}
                className={cn(
                  'absolute transition-opacity duration-300',
                  visible ? 'opacity-100' : 'opacity-0',
                  note.side === 'above' && '-translate-x-1/2 -translate-y-full pb-3 text-center',
                  note.side === 'below' && '-translate-x-1/4 pt-3',
                  // Sur mobile, à droite du point (la marge gauche est trop étroite)
                  note.side === 'left' &&
                    '-translate-y-1/2 rounded bg-ink/75 pl-3 pr-1 sm:-translate-x-full sm:bg-transparent sm:pl-0 sm:pr-4 sm:text-right'
                )}
                style={{ left: `${note.side === 'above' ? Math.min(Math.max(left, 12), 88) : left}%`, top: `${top}%` }}
              >
                <p className="label whitespace-nowrap text-[9px] sm:text-[10px]">{f.dayMonth(note.date)}</p>
                <p
                  className={cn(
                    'whitespace-nowrap font-display text-sm font-semibold sm:text-base',
                    note.key === 'record' || note.key === 'peak' ? 'text-brass' : 'text-paper'
                  )}
                >
                  {props.notes[note.key]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Conclusion */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" style={sceneFrom(0.88, 0.04)}>
          <p className="max-w-xl text-paper-dim">{props.conclusion}</p>
          <Link
            href={props.ctaHref}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded border border-brass/70 px-6 font-label text-sm font-semibold uppercase tracking-[0.14em] text-brass transition-colors hover:bg-brass/10"
          >
            {props.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
