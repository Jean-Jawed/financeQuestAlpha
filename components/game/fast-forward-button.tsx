/**
 * PASTFOLIO - COMPONENT: FastForwardButton
 * Avance rapide : partir en vacances une semaine, un mois, un an, ou jusqu'à une date.
 * Les séances atteignables viennent du serveur (période du scénario, fin des
 * données, séances restantes du groupe) ; la date choisie est ramenée à la
 * dernière séance qui la précède.
 */

'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { EnamelButton } from '@/components/machine/instruments';
import { showMedals } from '@/components/game/achievement-medal';
import { showXp } from '@/components/xp/xp-feedback';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { playSound } from '@/lib/sound';
import { cn } from '@/lib/utils/cn';
import { TimeoutError, fetchWithTimeout } from '@/lib/utils/fetch-timeout';
import { FAST_FORWARD_PRESETS, presetDate, type FastForwardPreset } from '@/lib/game/fast-forward';
import type { GameState } from '@/types/game';

interface Bounds {
  blocked: 'ended' | 'synchro' | 'no_session' | null;
  dates: string[];
  limit: 'period' | 'data' | 'group';
}

interface FastForwardButtonProps {
  gameId: string;
  currentDate: string;
  currency: string;
  /** Positions à découvert ouvertes : les appels de marge peuvent interrompre l'avance */
  hasShorts: boolean;
  inGroup: boolean;
  onAdvanced: (state?: GameState) => void;
  /** 'desk' : bouton compact du pupitre ; 'bar' : barre d'action mobile */
  layout?: 'desk' | 'bar';
  disabled?: boolean;
}

/** Une avance longue peut prendre du temps : délai plus large qu'un ordre */
const TIMEOUT_MS = 60_000;

export function FastForwardButton({ gameId, currentDate, currency, hasShorts, inGroup, onAdvanced, layout = 'desk', disabled }: FastForwardButtonProps) {
  const { toast } = useToast();
  const { m, f, fmt } = useI18n();
  const t = m.game.fastForward;
  const [open, setOpen] = useState(false);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [target, setTarget] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function openDialog() {
    setOpen(true);
    setBounds(null);
    setTarget('');
    try {
      const res = await fetch(`/api/games/${gameId}/fast-forward`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const data: Bounds = json.data;
      setBounds(data);
      const week = presetDate(currentDate, data.dates, FAST_FORWARD_PRESETS.week);
      setTarget(week ?? data.dates[data.dates.length - 1] ?? '');
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : t.failed);
      setOpen(false);
    }
  }

  const dates = bounds?.dates ?? [];
  const maxDate = dates[dates.length - 1];
  // Date choisie ramenée à la dernière séance qui la précède
  const playable = target ? dates.filter((date) => date <= target) : [];
  const landing = playable[playable.length - 1];
  const reachesEnd = Boolean(landing && landing === maxDate);

  async function submit() {
    if (!landing) return;
    setLoading(true);
    try {
      const res = await fetchWithTimeout(
        `/api/games/${gameId}/fast-forward`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetDate: landing }) },
        TIMEOUT_MS
      );
      const json = await res.json();
      if (!res.ok) {
        playSound('refusal');
        toast.error(json.error || t.failed);
        return;
      }

      const data = json.data;
      const state: GameState | undefined = data.state;
      const after = state?.portfolio.totalValue ?? data.valueBefore;
      const change = after - data.valueBefore;
      const percent = data.valueBefore > 0 ? (change / data.valueBefore) * 100 : 0;
      const signed = `${change > 0 ? '▲ +' : change < 0 ? '▼ ' : ''}${f.currency(change, currency)} (${f.percent(percent, 2)})`;

      if (data.endReason === 'bankrupt') {
        playSound('refusal');
        toast.error(m.game.nextDay.bankrupt, 8000);
      } else if (data.stoppedBy === 'margin_call' || data.forcedOrders.length > 0) {
        playSound('refusal');
        toast.error(fmt(t.stoppedMarginCall, { date: f.date(data.newDate), count: data.forcedOrders.length }), 9000);
      } else if (data.stoppedBy === 'group') {
        playSound('bell');
        toast.info(fmt(t.stoppedGroup, { date: f.date(data.newDate) }), 8000);
      } else {
        playSound('bell');
        window.setTimeout(() => playSound('flaps', 0.7), 450);
      }
      toast.info(fmt(t.done, { sessions: data.sessions, from: f.dateShort(data.fromDate), to: f.dateShort(data.newDate), change: signed }), 8000);

      showMedals(data.achievementsUnlocked);
      showXp(data.xp);
      setOpen(false);
      onAdvanced(state);
    } catch (error) {
      if (error instanceof TimeoutError) {
        toast.error(t.noAnswer);
        setOpen(false);
        onAdvanced();
        return;
      }
      toast.error(m.common.networkError);
    } finally {
      setLoading(false);
    }
  }

  const presets = (Object.keys(FAST_FORWARD_PRESETS) as FastForwardPreset[]).map((key) => ({
    key,
    date: presetDate(currentDate, dates, FAST_FORWARD_PRESETS[key]),
  }));

  const icon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M4 6l7 6-7 6V6zM13 6l7 6-7 6V6z" />
    </svg>
  );

  return (
    <>
      {layout === 'bar' ? (
        <EnamelButton
          tone="brass"
          size="lg"
          className="min-h-[52px] shrink-0 whitespace-nowrap px-3"
          onClick={openDialog}
          disabled={disabled}
          title={t.button}
          aria-label={t.button}
        >
          {icon}
        </EnamelButton>
      ) : (
        <button
          type="button"
          onClick={openDialog}
          disabled={disabled}
          className="inline-flex items-center gap-1 font-label font-semibold uppercase tracking-label text-brass transition-colors hover:text-brass-bright disabled:opacity-40"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 5l9 7-9 7V5zM12 5l9 7-9 7V5z" />
          </svg>
          {t.button}
        </button>
      )}

      {/* Fenêtre rendue hors du pupitre : elle n'hérite pas du style de la frise */}
      {open && createPortal(
        <Modal isOpen onClose={() => !loading && setOpen(false)} title={t.title} size="md">
          {!bounds ? (
            <p className="text-sm text-paper-dim">{t.loadingBounds}</p>
          ) : bounds.blocked ? (
            <p className="text-sm text-paper">{t.blocked[bounds.blocked]}</p>
          ) : (
            <div className="space-y-4 text-sm">
              <p className="text-paper-dim">{t.intro}</p>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {presets.map(({ key, date }) => (
                  <Button
                    key={key}
                    size="sm"
                    className="whitespace-nowrap px-1"
                    variant={date && date === landing ? 'primary' : 'secondary'}
                    disabled={!date || loading}
                    onClick={() => date && setTarget(date)}
                  >
                    {t.presets[key]}
                  </Button>
                ))}
                <Button size="sm" className="whitespace-nowrap px-1" variant={reachesEnd ? 'primary' : 'secondary'} disabled={loading} onClick={() => setTarget(maxDate)}>
                  {t.presets.end}
                </Button>
              </div>

              <label className="block">
                <span className="label text-[10px] text-paper-dim">{t.custom}</span>
                <input
                  type="date"
                  value={target}
                  min={dates[0]}
                  max={maxDate}
                  onChange={(event) => setTarget(event.target.value)}
                  disabled={loading}
                  className="num mt-1 h-11 w-full rounded-sm border border-line bg-ink px-3 text-paper [color-scheme:dark]"
                />
                <span className="mt-1 block text-[11px] text-paper-faint">
                  {fmt(t.range, { from: f.date(dates[0]), to: f.date(maxDate) })} · {t.limits[bounds.limit]}
                </span>
              </label>

              {landing ? (
                <p className="rounded-sm border border-brass/40 bg-ink px-3 py-2 text-paper">
                  {fmt(t.summary, { sessions: playable.length, date: f.date(landing) })}
                </p>
              ) : (
                <p className="text-loss">{t.noDate}</p>
              )}

              <ul className="list-disc space-y-1 pl-5 text-xs text-paper-dim">
                <li>{t.noOrders}</li>
                {hasShorts && <li className="text-brass-bright">{t.shorts}</li>}
                {inGroup && <li>{t.group}</li>}
                {reachesEnd && <li className="font-semibold text-loss">{t.ends[bounds.limit]}</li>}
                <li>{t.noXp}</li>
              </ul>
            </div>
          )}

          <ModalFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              {m.common.cancel}
            </Button>
            {bounds && !bounds.blocked && (
              <EnamelButton tone="brass" onClick={submit} disabled={!landing || loading} aria-busy={loading}>
                {icon}
                {loading ? t.loading : t.confirm}
              </EnamelButton>
            )}
          </ModalFooter>
        </Modal>,
        document.body
      )}
    </>
  );
}
