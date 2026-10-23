/**
 * FINANCEQUEST - COMPONENT: EndControls
 * Prendre sa retraite (à partir de MIN_SESSIONS_TO_RETIRE séances) ou abandonner,
 * avec confirmation : les positions sont soldées au cours de clôture
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { MIN_SESSIONS_TO_RETIRE } from '@/lib/game/scenarios';
import { playSound } from '@/lib/sound';
import type { GameState } from '@/types/game';

interface EndControlsProps {
  gameId: string;
  sessionsPlayed: number;
  /** Partie de groupe : la fin est fixée par le groupe, seul l'abandon reste possible */
  inGroup?: boolean;
  /** Appelé avec l'état de la partie terminée (bilan) */
  onEnded: (state?: GameState) => void;
}

type EndChoice = 'retired' | 'abandoned';

export function EndControls({ gameId, sessionsPlayed, inGroup = false, onEnded }: EndControlsProps) {
  const { m, fmt } = useI18n();
  const t = m.end;
  const { toast } = useToast();
  const [choice, setChoice] = useState<EndChoice | null>(null);
  const [loading, setLoading] = useState(false);

  const remaining = Math.max(MIN_SESSIONS_TO_RETIRE - sessionsPlayed, 0);
  const canRetire = remaining === 0;

  async function confirm() {
    if (!choice) return;
    setLoading(true);

    try {
      const res = await fetch('/api/games/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, reason: choice }),
      });
      const data = await res.json();

      if (!res.ok) {
        playSound('refusal');
        toast.error(data.error || t.failed);
        return;
      }

      // La cloche sonne la dernière séance du joueur
      playSound(choice === 'retired' ? 'bell' : 'refusal');
      setChoice(null);
      onEnded(data.data?.state);
    } catch {
      toast.error(m.common.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {!inGroup && (
        <Button
          variant="secondary"
          className="w-full"
          disabled={!canRetire}
          onClick={() => setChoice('retired')}
        >
          {canRetire ? t.retire : fmt(t.retireLocked, { remaining })}
        </Button>
      )}
      <button
        type="button"
        onClick={() => setChoice('abandoned')}
        className="mx-auto block font-label text-xs font-semibold uppercase tracking-label text-paper-faint transition-colors hover:text-loss"
      >
        {t.abandon}
      </button>

      <Modal
        isOpen={choice !== null}
        onClose={() => !loading && setChoice(null)}
        title={choice === 'retired' ? t.retireTitle : t.abandonTitle}
        size="sm"
      >
        <p className="text-paper-dim">{choice === 'retired' ? t.retireText : t.abandonText}</p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setChoice(null)} disabled={loading}>
            {m.common.cancel}
          </Button>
          <Button variant={choice === 'abandoned' ? 'danger' : 'primary'} onClick={confirm} loading={loading}>
            {choice === 'retired' ? t.confirmRetire : t.confirmAbandon}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
