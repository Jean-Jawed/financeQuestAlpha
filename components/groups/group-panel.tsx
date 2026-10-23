/**
 * FINANCEQUEST - COMPONENT: GroupPanel
 * Le panneau « Groupe » d'une partie de groupe : règles et progression, code
 * d'invitation, salle d'attente (tempo synchronisé), classement à la date du joueur
 * et messagerie. Rafraîchi toutes les 15 secondes tant que l'onglet est visible.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PerformanceBadge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { INTL_LOCALE } from '@/lib/i18n/config';
import { GROUP_LIMITS } from '@/lib/game/groups';
import { playSound } from '@/lib/sound';
import { cn } from '@/lib/utils/cn';
import type { GroupMessageView, GroupStanding, GroupView } from '@/types/groups';

const REFRESH_MS = 15_000;

interface GroupPanelProps {
  groupId: string;
  /** Change à chaque ordre ou séance du joueur : le classement est relu aussitôt */
  refreshKey: string;
  /** Vue du groupe à jour (la page en tire l'état de la séance commune) */
  onUpdate?: (view: GroupView) => void;
}

export function GroupPanel({ groupId, refreshKey, onUpdate }: GroupPanelProps) {
  const { m, f, fmt, href, locale } = useI18n();
  const t = m.groups.panel;
  const { toast } = useToast();

  const [view, setView] = useState<GroupView | null>(null);
  const [messages, setMessages] = useState<GroupMessageView[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const lastMessageId = useRef(0);
  const chatEnd = useRef<HTMLDivElement>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const refresh = useCallback(
    async (full = false) => {
      try {
        const after = full ? 0 : lastMessageId.current;
        const res = await fetch(`/api/groups/${groupId}${after ? `?after=${after}` : ''}`, { cache: 'no-store' });
        if (!res.ok) return;
        const { data } = (await res.json()) as { data: GroupView };

        setView(data);
        onUpdateRef.current?.(data);
        if (data.messages.length > 0) {
          setMessages((previous) => {
            const merged = after ? [...previous, ...data.messages] : data.messages;
            // Sans doublon si deux rafraîchissements se croisent
            return merged.filter((message, index) => merged.findIndex((other) => other.id === message.id) === index);
          });
          lastMessageId.current = data.messages[data.messages.length - 1].id;
        }
      } catch {
        // Réseau : le prochain rafraîchissement réessaiera
      }
    },
    [groupId]
  );

  // Premier chargement, puis à chaque action du joueur
  useEffect(() => {
    void refresh(lastMessageId.current === 0);
  }, [refresh, refreshKey]);

  // Rafraîchissement régulier, suspendu quand l'onglet est caché
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  async function send() {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        toast.error((await res.json()).error || m.common.networkError);
        return;
      }
      setDraft('');
      await refresh();
    } catch {
      toast.error(m.common.networkError);
    } finally {
      setSending(false);
    }
  }

  async function remove(messageId: number) {
    const res = await fetch(`/api/groups/${groupId}/messages?message=${messageId}`, { method: 'DELETE' });
    if (res.ok) setMessages((previous) => previous.filter((message) => message.id !== messageId));
  }

  async function start() {
    setStarting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/start`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        playSound('refusal');
        toast.error(data.error || m.common.networkError);
        return;
      }
      playSound('bell');
      toast.success(data.message);
      await refresh();
    } catch {
      toast.error(m.common.networkError);
    } finally {
      setStarting(false);
    }
  }

  async function copyInvite(code: string) {
    const url = `${window.location.origin}${href(`/groups/join/${code}`)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.copied);
    } catch {
      toast.info(url);
    }
  }

  if (!view) {
    return <section className="certificate h-40 animate-pulse p-6" aria-busy="true" />;
  }

  const { group, viewer, standings, sync } = view;
  const mode = m.groups.modes[group.mode];
  const rule = fmt(mode.rule, {
    sessions: group.sessionsTarget,
    target: group.targetReturn ?? 0,
    every: group.eliminationEvery ?? 0,
  });
  const lobby = group.tempo === 'synchro' && group.status === 'open';
  const deadline = sync?.deadline
    ? new Date(sync.deadline).toLocaleString(INTL_LOCALE[locale], { weekday: 'long', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <section className="certificate p-5" aria-labelledby="group-title">
      {/* Règles et progression */}
      <header>
        <p className="label text-[10px] text-brass">
          {t.title} · {m.groups.tempos[group.tempo].name}
        </p>
        <h2 id="group-title" className="mt-1 font-display text-2xl font-semibold text-paper">
          {group.name}
        </h2>
        <p className="mt-1 text-sm text-paper-dim">
          <span className="text-paper">{mode.name}</span> · {rule}
        </p>
        {group.status !== 'completed' && !lobby && (
          <p className="label mt-2 text-[10px]">
            {fmt(t.progress, { played: Math.min(viewer.sessionsPlayed, group.sessionsTarget), target: group.sessionsTarget })}
          </p>
        )}
      </header>

      {/* Invitation */}
      {group.status !== 'completed' && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded border border-line bg-ink px-3 py-2">
          <div>
            <p className="label text-[10px]">{t.code}</p>
            <p className="num text-lg tracking-[0.2em] text-brass">{group.code}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => copyInvite(group.code)}>
            {t.copyLink}
          </Button>
        </div>
      )}

      {/* Salle d'attente (tempo synchronisé) */}
      {lobby && (
        <div className="mt-4 rounded border border-brass/40 bg-brass/10 p-4">
          <p className="font-display text-lg text-paper">{t.lobbyTitle}</p>
          <p className="mt-1 text-sm text-paper-dim">{t.lobbyText}</p>
          {group.isOwner ? (
            <Button className="mt-3 w-full" onClick={start} loading={starting} disabled={group.playersCount < 2}>
              {t.start}
            </Button>
          ) : (
            <p className="label mt-3 text-[10px] text-brass">{t.lobbyWaiting}</p>
          )}
        </div>
      )}

      {/* Séance commune */}
      {sync && group.status === 'running' && (
        <div className="mt-4 text-sm text-paper-dim">
          <p className="text-paper">{fmt(t.syncStatus, { ready: sync.readyCount, total: sync.total })}</p>
          {deadline && <p className="mt-0.5 text-xs">{fmt(t.deadline, { time: deadline })}</p>}
        </div>
      )}

      {group.status === 'completed' && standings[0] && (
        <p className="mt-4 rounded border border-brass/40 bg-brass/10 px-4 py-3 font-display text-lg text-brass">
          {t.completed} · {fmt(t.winner, { name: standings[0].name })}
        </p>
      )}

      {/* Classement */}
      <h3 className="label mt-6 text-brass">{t.standings}</h3>
      <ol className="mt-2 divide-y divide-line">
        {standings.map((standing) =>
          renderStanding(standing, group.currency, group.tempo === 'synchro' && group.status === 'running')
        )}
      </ol>

      {/* Messagerie */}
      <h3 className="label mt-6 text-brass">{t.chat}</h3>
      <div className="mt-2 max-h-72 space-y-2 overflow-y-auto rounded border border-line bg-ink p-3" aria-live="polite">
        {messages.length === 0 && <p className="text-sm text-paper-faint">{t.chatEmpty}</p>}
        {messages.map((message) => (
          <div key={message.id} className={cn('group text-sm', message.isYou && 'text-right')}>
            <p className="label text-[10px]">
              {message.isYou ? t.you : message.name} ·{' '}
              {new Date(message.createdAt).toLocaleTimeString(INTL_LOCALE[locale], { hour: '2-digit', minute: '2-digit' })}
              {group.isOwner && (
                <button
                  type="button"
                  onClick={() => remove(message.id)}
                  className="ml-2 text-paper-faint opacity-0 transition-opacity hover:text-loss focus:opacity-100 group-hover:opacity-100"
                >
                  {t.delete}
                </button>
              )}
            </p>
            <p
              className={cn(
                'mt-0.5 inline-block max-w-[90%] whitespace-pre-wrap break-words rounded px-3 py-1.5 text-left',
                message.isYou ? 'bg-brass/15 text-paper' : 'bg-ink-2 text-paper-dim'
              )}
            >
              {message.body}
            </p>
          </div>
        ))}
        <div ref={chatEnd} />
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={GROUP_LIMITS.messageMax}
          placeholder={t.chatPlaceholder}
          aria-label={t.chatPlaceholder}
          className="h-10 min-w-0 flex-1 rounded border border-line-strong bg-ink px-3 text-sm text-paper focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        />
        <Button type="submit" size="sm" loading={sending} disabled={!draft.trim()}>
          {t.send}
        </Button>
      </form>
    </section>
  );

  function renderStanding(standing: GroupStanding, currency: string, sync: boolean) {
    const statusLabel =
      standing.status === 'eliminated'
        ? t.eliminated
        : standing.status === 'abandoned'
          ? t.abandoned
          : standing.status === 'finished'
            ? standing.reachedIn !== null
              ? fmt(t.reachedIn, { sessions: standing.reachedIn })
              : t.finished
            : sync
              ? standing.ready
                ? t.ready
                : t.notReady
              : null;

    return (
      <li key={standing.userId} className={cn('flex items-start gap-3 py-2.5', standing.isYou && 'text-brass')}>
        <span className="num w-6 shrink-0 pt-0.5 text-paper-faint">{standing.rank}</span>
        <div className="min-w-0 flex-1">
          <p className={cn('truncate font-semibold', standing.isYou ? 'text-brass' : 'text-paper')}>
            {standing.name}
            {standing.isYou && <span className="label ml-2 text-[10px]">{t.you}</span>}
          </p>
          <p className="label mt-0.5 text-[10px]">
            {f.dateShort(standing.date)}
            {standing.ahead && ` · ${t.ahead}`}
            {statusLabel && ` · ${statusLabel}`}
          </p>
          <p className="mt-1 text-xs text-paper-dim">
            {t.orders} <span className="num text-paper">{standing.ordersCount}</span> · {t.positions}{' '}
            <span className="num text-paper">{standing.openPositions}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="num text-paper">{f.currency(standing.totalValue, currency)}</p>
          <div className="mt-1">
            <PerformanceBadge value={standing.returnPercentage} />
          </div>
        </div>
      </li>
    );
  }
}
