/**
 * FINANCEQUEST - COMPONENT: NextDayButton
 * La cloche : date en volets, frise de la partie, clôture de la séance
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SolariDate } from '@/components/brand/solari-date';
import { showMedals } from '@/components/game/achievement-medal';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { playSound } from '@/lib/sound';
import { daysBetween } from '@/lib/game/achievement-rules';
import type { GameState } from '@/types/game';

// ==========================================
// TYPES
// ==========================================

interface NextDayButtonProps {
  gameId: string;
  currentDate: string;
  startDate: string;
  /** Dernière date disponible dans la base prix (fin possible de la partie) */
  endDate: string;
  /** Valeur du portefeuille avant la séance : sert au bilan du jour */
  totalValue: number;
  currency: string;
  /** Appelé avec l'état de la partie renvoyé par la séance */
  onDayAdvanced: (state?: GameState) => void;
}

// ==========================================
// COMPONENT
// ==========================================

export function NextDayButton({
  gameId,
  currentDate,
  startDate,
  endDate,
  totalValue,
  currency,
  onDayAdvanced,
}: NextDayButtonProps) {
  const { toast } = useToast();
  const { m, f, fmt } = useI18n();
  const t = m.game.nextDay;
  const [loading, setLoading] = useState(false);

  async function handleNextDay() {
    setLoading(true);

    try {
      const res = await fetch('/api/games/next-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      const data = await res.json();

      if (!res.ok) {
        playSound('refusal');
        toast.error(data.error || t.failed);
        return;
      }

      // La cloche sonne la clôture, puis les volets basculent sur la nouvelle date ;
      // une faillite se solde par un choc sourd
      if (data.data?.endReason === 'bankrupt') {
        playSound('refusal');
      } else {
        playSound('bell');
        window.setTimeout(() => playSound('flaps', 0.7), 450);
      }

      // Bilan de la séance : variation de la valeur du portefeuille
      const newValue: number | undefined = data.data?.state?.portfolio.totalValue;
      if (typeof newValue === 'number') {
        const delta = newValue - totalValue;
        const sign = delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : '';
        toast.info(fmt(t.closed, { change: `${sign}${f.currency(delta, currency)}` }));
      }

      showMedals(data.data?.achievementsUnlocked);
      onDayAdvanced(data.data?.state);
    } catch (error) {
      toast.error(m.common.networkError);
    } finally {
      setLoading(false);
    }
  }

  // Frise : du départ à la fin des données de marché
  const totalDays = daysBetween(startDate, endDate);
  const elapsedDays = daysBetween(startDate, currentDate);
  const progress = totalDays > 0 ? Math.min((elapsedDays / totalDays) * 100, 100) : 100;
  const isFinished = currentDate >= endDate;

  return (
    <section className="certificate p-6" aria-label={t.section}>
      <p className="label mb-4 text-center text-brass">{t.section}</p>
      <SolariDate date={currentDate} />

      {/* Frise de la partie */}
      <div className="mt-6">
        <div className="relative h-2 rounded-sm bg-ink">
          <div
            className="absolute inset-y-0 left-0 rounded-sm bg-brass transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
          {/* Graduations trimestrielles */}
          {[25, 50, 75].map((tick) => (
            <span key={tick} className="absolute top-0 h-2 w-px bg-ink-2" style={{ left: `${tick}%` }} />
          ))}
        </div>
        <div className="num mt-2 flex justify-between text-[11px] text-paper-dim">
          <span>{f.dateShort(startDate)}</span>
          <span>{fmt(t.day, { elapsed: elapsedDays, total: totalDays })}</span>
          <span>{f.dateShort(endDate)}</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="mt-6 w-full"
        onClick={handleNextDay}
        loading={loading}
        disabled={isFinished}
      >
        {isFinished ? t.finished : t.close}
        {!isFinished && !loading && <span aria-hidden="true">→</span>}
      </Button>
      {!isFinished && (
        <p className="mt-2 text-center text-xs text-paper-dim">{t.hint}</p>
      )}
    </section>
  );
}
