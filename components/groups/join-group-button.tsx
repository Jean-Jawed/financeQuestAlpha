/**
 * FINANCEQUEST - COMPONENT: JoinGroupButton
 * Rejoindre le groupe depuis la page d'invitation ; en tempo synchronisé,
 * le joueur coche d'abord son engagement à suivre le rythme du groupe
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { playSound } from '@/lib/sound';

interface JoinGroupButtonProps {
  code: string;
  synchro: boolean;
  timeoutHours: number;
}

export function JoinGroupButton({ code, synchro, timeoutHours }: JoinGroupButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { m, fmt, href } = useI18n();
  const t = m.groups.join;
  const [commit, setCommit] = useState(false);
  const [loading, setLoading] = useState(false);

  async function join() {
    setLoading(true);
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, commit }),
      });
      const data = await res.json();
      if (!res.ok) {
        playSound('refusal');
        toast.error(data.error || t.failed);
        return;
      }
      playSound('opening');
      toast.success(data.message);
      router.push(href(`/game/${data.data.gameId}`));
    } catch {
      toast.error(m.common.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {synchro && (
        <label className="flex max-w-md cursor-pointer items-start gap-3 text-left text-sm text-paper">
          <input
            type="checkbox"
            checked={commit}
            onChange={(event) => setCommit(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[#C9A45C]"
          />
          <span>{fmt(t.commit, { hours: timeoutHours })}</span>
        </label>
      )}
      <Button size="lg" onClick={join} loading={loading} disabled={synchro && !commit}>
        {t.submit}
      </Button>
    </div>
  );
}
