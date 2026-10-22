/**
 * FINANCEQUEST - COMPONENT: CreateGameCard
 * Card pour créer une nouvelle partie avec modal
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useI18n } from '@/lib/i18n/client';
import { INTL_LOCALE } from '@/lib/i18n/config';
import { playSound } from '@/lib/sound';
import {
  DEFAULT_GAME_CURRENCY,
  GAME_CURRENCIES,
  STARTING_CAPITAL,
  type GameCurrency,
} from '@/lib/game/currency';

// ==========================================
// TYPES
// ==========================================

interface CreateGameCardProps {
  /** Première date de départ possible (début de la base prix, YYYY-MM-DD) */
  minDate: string;
  /** Dernière date de départ possible (veille de la fin de la base prix) */
  maxDate: string;
  /** Aucune partie encore : libellé d'accueil */
  isFirst?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

export function CreateGameCard({ minDate, maxDate, isFirst = false }: CreateGameCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { m, f, fmt, locale } = useI18n();
  const t = m.dashboard.create;
  // Nom des devises dans la langue du joueur (« dollar des États-Unis », « US Dollar »)
  const currencyNames = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: 'currency' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [currency, setCurrency] = useState<GameCurrency>(DEFAULT_GAME_CURRENCY);
  const [loading, setLoading] = useState(false);

  async function handleCreateGame() {
    if (!startDate) {
      toast.error(t.pickDate);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, currency }),
      });

      const data = await res.json();

      if (!res.ok) {
        playSound('refusal');
        toast.error(data.error || t.failed);
        setLoading(false);
        return;
      }

      playSound('opening');
      toast.success(data.message || t.success);
      setIsModalOpen(false);
      router.refresh(); // Recharger la page pour afficher la nouvelle partie
    } catch (error) {
      toast.error(m.common.networkError);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="group relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded border border-dashed border-brass/50 bg-ink/40 p-8 text-center transition-colors hover:border-brass hover:bg-ink-2"
      >
        <Image
          src="/gravures/sablier.webp"
          alt=""
          width={140}
          height={140}
          className="engraving h-28 w-28 object-contain opacity-70 transition-opacity group-hover:opacity-100"
        />
        <p className="label mt-4 text-brass">{isFirst ? t.firstTitle : t.blankTitle}</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-paper">{t.title}</h3>
        <p className="mt-2 max-w-xs text-sm text-paper-dim">{t.cardText}</p>
        <span className="mt-6 inline-flex h-10 items-center rounded border border-brass-bright/60 bg-brass px-5 font-label text-sm font-semibold uppercase tracking-[0.14em] text-ink shadow-[0_2px_0_#8E7034] transition-colors group-hover:bg-brass-bright">
          {t.cta}
        </span>
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !loading && setIsModalOpen(false)}
        title={t.title}
        size="md"
      >
        <div className="space-y-6">
          <p className="text-paper-dim">
            {fmt(t.modalText, { capital: f.currency(STARTING_CAPITAL[currency], currency) })}
          </p>

          <div>
            <label htmlFor="game-currency" className="label mb-2 block">
              {t.currency}
            </label>
            <select
              id="game-currency"
              className="h-11 w-full rounded border border-line-strong bg-ink px-3 text-paper focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as GameCurrency)}
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

          <Input
            id="game-start-date"
            type="date"
            label={t.startDate}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={minDate}
            max={maxDate}
            disabled={loading}
            helperText={t.startDateHint}
          />

          {loading && (
            <div className="flex items-center gap-3 rounded border border-brass/30 bg-brass/10 p-4">
              <LoadingSpinner size="sm" />
              <p className="font-medium text-brass">{t.opening}</p>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={loading}>
            {m.common.cancel}
          </Button>
          <Button onClick={handleCreateGame} loading={loading} disabled={!startDate}>
            {t.submit}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
