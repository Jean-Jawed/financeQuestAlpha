/**
 * FINANCEQUEST - BRAND: SolariDate
 * Date en volets de tableau d'affichage, qui basculent quand elle change
 */

'use client';

import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';

function Flap({ value, className }: { value: string; className?: string }) {
  return (
    <span
      // key = valeur : React remonte le volet, l'animation rejoue
      key={value}
      className={cn(
        'relative inline-flex animate-flip-in items-center justify-center rounded-sm border border-black/60 bg-[#0A1512] px-2 py-1 font-label font-bold text-paper shadow-[inset_0_-1px_0_rgb(239_230_210/0.06)] [transform-origin:50%_0]',
        className
      )}
    >
      {value}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/70" />
    </span>
  );
}

interface SolariDateProps {
  /** YYYY-MM-DD */
  date: string;
  className?: string;
}

export function SolariDate({ date, className }: SolariDateProps) {
  const { m, locale } = useI18n();
  const d = new Date(`${date}T00:00:00Z`);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = m.game.solari.months[d.getUTCMonth()];
  const year = String(d.getUTCFullYear());

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <span className="label text-[10px]">{m.game.solari.weekdays[d.getUTCDay()]}</span>
      <time dateTime={date} className="flex items-stretch gap-1.5 text-3xl [perspective:400px]">
        {/* Ordre des volets selon l'usage : 15 JUIN 2023 · JUN 15 2023 */}
        {locale === 'en' ? (
          <>
            <Flap value={month} className="min-w-[4.2ch]" />
            <Flap value={day} className="w-[2.4ch] tabular-nums" />
          </>
        ) : (
          <>
            <Flap value={day} className="w-[2.4ch] tabular-nums" />
            <Flap value={month} className="min-w-[4.2ch]" />
          </>
        )}
        <Flap value={year} className="tabular-nums" />
      </time>
    </div>
  );
}
