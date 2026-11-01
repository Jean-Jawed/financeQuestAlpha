/**
 * PASTFOLIO - COMPONENT: NextDayButton
 * La cloche : date en volets, frise de la partie, clôture de la séance
 * Partie de groupe en tempo synchronisé : le joueur se déclare prêt, la séance
 * avance quand tout le groupe l'est
 */

'use client';

import { useState } from 'react';
import { EnamelButton } from '@/components/machine/instruments';
import { cn } from '@/lib/utils/cn';
import { SolariDate } from '@/components/brand/solari-date';
import { showMedals } from '@/components/game/achievement-medal';
import { showXp } from '@/components/xp/xp-feedback';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { playSound } from '@/lib/sound';
import { TimeoutError, fetchWithTimeout } from '@/lib/utils/fetch-timeout';
import { daysBetween } from '@/lib/game/achievement-rules';
import { portfolioSessionChange, sessionExtremes } from '@/lib/game/session-change';
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
  /** Tempo synchronisé : état de la séance commune (absent pour une partie à son rythme) */
  sync?: { started: boolean; ready: boolean; readyCount: number; total: number };
  /** Tempo synchronisé : le joueur est prêt, la séance attend les autres */
  onWaiting?: () => void;
  /** 'desk' : pupitre (date, frise, bouton) ; 'bar' : bouton seul, barre d'action mobile */
  layout?: 'desk' | 'bar';
  /** Instrument posé à côté du bouton (manomètre des liquidités) */
  aside?: React.ReactNode;
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
  sync,
  onWaiting,
  layout = 'desk',
  aside,
}: NextDayButtonProps) {
  const { toast } = useToast();
  const { m, f, fmt } = useI18n();
  const t = m.game.nextDay;
  const g = m.groups.nextDay;
  const [loading, setLoading] = useState(false);

  async function handleNextDay() {
    setLoading(true);

    try {
      // Pas de renvoi automatique : il ferait avancer la partie de deux séances
      const res = await fetchWithTimeout('/api/games/next-day', {
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

      // Tempo synchronisé : prêt, la séance attend les autres joueurs
      if (data.data?.waiting) {
        playSound('stamp', 0.5);
        toast.info(data.message);
        showXp(data.data?.xp);
        onWaiting?.();
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

      // Bilan de la séance : gain du jour, puis la meilleure et la pire position
      const state: GameState | undefined = data.data?.state;
      if (state) {
        const signed = (value: number) => `${value > 0 ? '▲ +' : value < 0 ? '▼ ' : ''}${f.currency(value, currency)}`;
        const session = portfolioSessionChange(state.holdings, state.portfolio.totalValue);
        const { best, worst } = sessionExtremes(state.holdings);
        const parts = [
          fmt(t.closed, {
            change: session
              ? `${signed(session.change)} (${f.percent(session.percent, 2)})`
              : signed(state.portfolio.totalValue - totalValue),
          }),
          ...(best ? [fmt(t.best, { symbol: best.symbol, change: signed(best.dayChange ?? 0) })] : []),
          ...(worst ? [fmt(t.worst, { symbol: worst.symbol, change: signed(worst.dayChange ?? 0) })] : []),
        ];
        toast.info(parts.join(' · '), 6500);
      }

      showMedals(data.data?.achievementsUnlocked);
      showXp(data.data?.xp);
      onDayAdvanced(data.data?.state);
    } catch (error) {
      if (error instanceof TimeoutError) {
        toast.error(t.noAnswer);
        onDayAdvanced();
        return;
      }
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
  const syncBlocked = sync ? !sync.started || sync.ready : false;
  const label = isFinished
    ? t.finished
    : sync
      ? !sync.started
        ? g.notStarted
        : sync.ready
          ? fmt(g.waiting, { ready: sync.readyCount, total: sync.total })
          : g.ready
      : t.close;

  const button = (
    <EnamelButton
      tone="brass"
      size={layout === 'bar' ? 'lg' : 'md'}
      className={cn('w-full whitespace-nowrap', layout === 'bar' && 'min-h-[52px] px-3 text-sm')}
      onClick={handleNextDay}
      disabled={loading || isFinished || syncBlocked}
      aria-busy={loading}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
        <path d="M6 17h12M8 17V11a4 4 0 0 1 8 0v6M12 4v3M10.5 20a1.5 1.5 0 0 0 3 0" />
      </svg>
      {label}
    </EnamelButton>
  );

  if (layout === 'bar') return button;

  return (
    <section aria-label={t.section} className="flex h-full items-center gap-4">
      <SolariDate date={currentDate} small className="shrink-0" />

      <div className="min-w-0 flex-1 space-y-2">
        {button}
        {/* Frise de la partie */}
        <div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-[#120C16] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brass-deep to-brass-bright transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="num mt-1 flex justify-between gap-2 whitespace-nowrap text-[10px] text-paper-dim" title={`${f.dateShort(startDate)} → ${f.dateShort(endDate)}`}>
            <span>{fmt(t.day, { elapsed: elapsedDays, total: totalDays })}</span>
            <span className="max-xl:hidden">→ {f.dateShort(endDate)}</span>
          </div>
        </div>
      </div>

      {aside && <div className="shrink-0 max-xl:hidden">{aside}</div>}
    </section>
  );
}
