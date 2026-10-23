/**
 * FINANCEQUEST - COMPONENT: CreateGroupCard
 * Organiser une partie de groupe : mode, tempo (bien en vue : il change tout),
 * scénario, devise et départ communs, durée et paramètres du mode
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { ScenarioPicker } from '@/components/dashboard/scenario-picker';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { INTL_LOCALE } from '@/lib/i18n/config';
import { playSound } from '@/lib/sound';
import { DEFAULT_GAME_CURRENCY, GAME_CURRENCIES, type GameCurrency } from '@/lib/game/currency';
import { DEFAULT_SCENARIO, getScenario, type ScenarioId } from '@/lib/game/scenarios';
import {
  CRISIS_PRESETS,
  DEFAULT_SYNC_TIMEOUT_HOURS,
  GROUP_DEFAULTS,
  GROUP_LIMITS,
  GROUP_MODES,
  GROUP_TEMPOS,
  SYNC_ONLY_MODES,
  type CrisisPresetId,
  type GroupMode,
  type GroupTempo,
} from '@/lib/game/groups';
import { cn } from '@/lib/utils/cn';

interface CreateGroupCardProps {
  minDate: string;
  maxDate: string;
}

const selectClass =
  'h-11 w-full rounded border border-line-strong bg-ink px-3 text-paper focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass';

export function CreateGroupCard({ minDate, maxDate }: CreateGroupCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { m, locale, href } = useI18n();
  const t = m.groups.create;
  const currencyNames = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: 'currency' });

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<GroupMode>('sprint');
  const [tempo, setTempo] = useState<GroupTempo>('libre');
  const [scenario, setScenario] = useState<ScenarioId>(DEFAULT_SCENARIO);
  const [currency, setCurrency] = useState<GameCurrency>(DEFAULT_GAME_CURRENCY);
  const [startDate, setStartDate] = useState('');
  const [crisis, setCrisis] = useState<CrisisPresetId>('covid-2020');
  const [sessions, setSessions] = useState(GROUP_DEFAULTS.sprint.sessions);
  const [target, setTarget] = useState(GROUP_DEFAULTS.course.targetReturn ?? 15);
  const [every, setEvery] = useState(GROUP_DEFAULTS.elimination.eliminationEvery ?? 5);
  const [timeout, setTimeoutHours] = useState(DEFAULT_SYNC_TIMEOUT_HOURS);

  const period = mode === 'crise' ? undefined : getScenario(scenario).rules.period;
  const syncOnly = SYNC_ONLY_MODES.includes(mode);
  const needsDate = !period && mode !== 'crise';

  function pickMode(next: GroupMode) {
    setMode(next);
    setSessions(GROUP_DEFAULTS[next].sessions);
    if (SYNC_ONLY_MODES.includes(next)) setTempo('synchro');
  }

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mode,
          tempo,
          // Crise : le départ est celui du krach, sans règle de scénario
          scenario: mode === 'crise' ? DEFAULT_SCENARIO : scenario,
          currency,
          startDate: needsDate ? startDate : undefined,
          crisis: mode === 'crise' ? crisis : undefined,
          sessionsTarget: sessions,
          targetReturn: mode === 'course' ? target : undefined,
          eliminationEvery: mode === 'elimination' ? every : undefined,
          syncTimeoutHours: tempo === 'synchro' ? timeout : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        playSound('refusal');
        toast.error(data.error || t.failed);
        return;
      }
      playSound('opening');
      toast.success(data.message);
      setOpen(false);
      router.push(href(`/game/${data.data.gameId}`));
    } catch {
      toast.error(m.common.networkError);
    } finally {
      setLoading(false);
    }
  }

  const valid =
    name.trim().length >= GROUP_LIMITS.nameMin && (!needsDate || Boolean(startDate)) && sessions >= GROUP_LIMITS.sessionsMin;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded border border-dashed border-brass/50 bg-ink/40 p-6 text-center transition-colors hover:border-brass hover:bg-ink-2"
      >
        <Image
          src="/gravures/corbeille.webp"
          alt=""
          width={160}
          height={84}
          className="engraving h-16 w-auto rounded-sm object-contain opacity-70 transition-opacity group-hover:opacity-100"
        />
        <h3 className="mt-4 font-display text-xl font-semibold text-paper">{t.cardTitle}</h3>
        <p className="mt-2 max-w-xs text-sm text-paper-dim">{t.cardText}</p>
        <span className="mt-4 inline-flex h-10 items-center rounded border border-brass-bright/60 bg-brass px-5 font-label text-sm font-semibold uppercase tracking-[0.14em] text-ink shadow-[0_2px_0_#8E7034] transition-colors group-hover:bg-brass-bright">
          {t.cta}
        </span>
      </button>

      <Modal isOpen={open} onClose={() => !loading && setOpen(false)} title={t.title} size="lg">
        <div className="space-y-7">
          <Input
            id="group-name"
            label={t.name}
            placeholder={t.namePlaceholder}
            value={name}
            maxLength={GROUP_LIMITS.nameMax}
            onChange={(event) => setName(event.target.value)}
            disabled={loading}
          />

          {/* Tempo : deux grandes cartes, le choix qui change tout */}
          <fieldset>
            <legend className="label mb-1 block">{t.tempo}</legend>
            <p className="mb-3 text-xs text-paper-dim">{t.tempoNote}</p>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
              {GROUP_TEMPOS.map((value) => {
                const selected = tempo === value;
                const locked = syncOnly && value === 'libre';
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={loading || locked}
                    onClick={() => setTempo(value)}
                    className={cn(
                      'rounded border-2 p-4 text-left transition-colors disabled:opacity-40',
                      selected ? 'border-brass bg-brass/10' : 'border-line hover:border-brass/60'
                    )}
                  >
                    <span className={cn('block font-display text-xl font-semibold', selected ? 'text-brass' : 'text-paper')}>
                      {m.groups.tempos[value].name}
                    </span>
                    <span className="mt-1 block text-sm text-paper-dim">{m.groups.tempos[value].text}</span>
                  </button>
                );
              })}
            </div>
            {syncOnly && <p className="mt-2 text-xs text-brass">{t.syncOnly}</p>}
          </fieldset>

          {/* Mode */}
          <fieldset>
            <legend className="label mb-3 block">{t.mode}</legend>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
              {GROUP_MODES.map((value) => {
                const selected = mode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={loading}
                    onClick={() => pickMode(value)}
                    className={cn(
                      'rounded border px-4 py-3 text-left transition-colors',
                      selected ? 'border-brass ring-1 ring-brass' : 'border-line hover:border-brass/60'
                    )}
                  >
                    <span className={cn('block font-display text-base font-semibold', selected ? 'text-brass' : 'text-paper')}>
                      {m.groups.modes[value].name}
                    </span>
                    <span className="mt-0.5 block text-xs text-paper-dim">{m.groups.modes[value].text}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Paramètres du mode */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="group-sessions"
              type="number"
              label={mode === 'course' ? t.sessionsCap : t.sessions}
              min={GROUP_LIMITS.sessionsMin}
              max={GROUP_LIMITS.sessionsMax}
              value={sessions}
              onChange={(event) => setSessions(Number(event.target.value))}
              disabled={loading}
            />
            {mode === 'course' && (
              <Input
                id="group-target"
                type="number"
                label={t.target}
                min={GROUP_LIMITS.targetMin}
                max={GROUP_LIMITS.targetMax}
                value={target}
                onChange={(event) => setTarget(Number(event.target.value))}
                disabled={loading}
              />
            )}
            {mode === 'elimination' && (
              <Input
                id="group-every"
                type="number"
                label={t.every}
                min={GROUP_LIMITS.eliminationEveryMin}
                max={GROUP_LIMITS.eliminationEveryMax}
                value={every}
                onChange={(event) => setEvery(Number(event.target.value))}
                disabled={loading}
              />
            )}
            {tempo === 'synchro' && (
              <Input
                id="group-timeout"
                type="number"
                label={t.timeout}
                helperText={t.timeoutHint}
                min={GROUP_LIMITS.timeoutHoursMin}
                max={GROUP_LIMITS.timeoutHoursMax}
                value={timeout}
                onChange={(event) => setTimeoutHours(Number(event.target.value))}
                disabled={loading}
              />
            )}
          </div>

          {/* Départ commun */}
          {mode === 'crise' ? (
            <div>
              <label htmlFor="group-crisis" className="label mb-2 block">
                {t.crisis}
              </label>
              <select
                id="group-crisis"
                className={selectClass}
                value={crisis}
                onChange={(event) => setCrisis(event.target.value as CrisisPresetId)}
                disabled={loading}
              >
                {CRISIS_PRESETS.filter((preset) => preset.start >= minDate && preset.start <= maxDate).map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {m.groups.crises[preset.id]}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <ScenarioPicker value={scenario} onChange={setScenario} disabled={loading} />
          )}

          {needsDate && (
            <Input
              id="group-start"
              type="date"
              label={t.startDate}
              value={startDate}
              min={minDate}
              max={maxDate}
              onChange={(event) => setStartDate(event.target.value)}
              disabled={loading}
            />
          )}

          <div>
            <label htmlFor="group-currency" className="label mb-2 block">
              {t.currency}
            </label>
            <select
              id="group-currency"
              className={selectClass}
              value={currency}
              onChange={(event) => setCurrency(event.target.value as GameCurrency)}
              disabled={loading}
            >
              {GAME_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code} · {currencyNames.of(code)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-paper-dim">{t.currencyHint}</p>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            {m.common.cancel}
          </Button>
          <Button onClick={submit} loading={loading} disabled={!valid}>
            {t.submit}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
