/**
 * FINANCEQUEST - PAGE: invitation à une partie de groupe
 * /[locale]/groups/join/[code] : règles du groupe, puis « Rejoindre »
 * (connexion d'abord pour un visiteur ; engagement à suivre le rythme en tempo synchronisé)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { and, eq, sql } from 'drizzle-orm';
import { Rosette } from '@/components/brand/guilloche';
import { JoinGroupButton } from '@/components/groups/join-group-button';
import { getSessionState } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { groupMembers, users } from '@/lib/db/schema';
import { findGroupByCode } from '@/lib/game/group-server';
import { INVITE_CODE_PATTERN } from '@/lib/game/groups';
import { getI18n, resolveLocale } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';

type Params = Promise<{ locale: string; code: string }>;

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const { code } = await params;
  const { ui } = getI18n(locale);
  return pageMetadata({ locale, path: `/groups/join/${code}`, title: ui.groups.join.pageTitle, noindex: true });
}

export default async function JoinGroupPage({ params }: { params: Params }) {
  const locale = await resolveLocale(params);
  const { code } = await params;
  const { ui, f, fmt, href } = getI18n(locale);
  const t = ui.groups.join;

  const group = INVITE_CODE_PATTERN.test(code.toUpperCase()) ? await findGroupByCode(code) : null;

  if (!group) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-display text-2xl text-paper">{t.notFound}</p>
        <Link href={href('/dashboard')} className="label mt-6 inline-block text-brass hover:text-brass-bright">
          {ui.end.dashboard} →
        </Link>
      </div>
    );
  }

  const session = await getSessionState();
  const userId = session.status === 'ok' ? session.user.id : null;

  const [[{ count }], [owner], [membership]] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)::int` }).from(groupMembers).where(eq(groupMembers.groupId, group.id)),
    db.select({ name: users.name }).from(users).where(eq(users.id, group.ownerId)),
    userId
      ? db
          .select({ gameId: groupMembers.gameId })
          .from(groupMembers)
          .where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, userId)))
      : Promise.resolve([]),
  ]);

  const mode = ui.groups.modes[group.mode];
  const tempo = ui.groups.tempos[group.tempo];
  const scenarioName = (ui.scenarios[group.scenario as keyof typeof ui.scenarios] as { name?: string })?.name;
  const joinable = group.tempo === 'libre' ? group.status !== 'completed' : group.status === 'open';
  const full = Number(count) >= group.maxPlayers;
  const redirectTo = href(`/groups/join/${group.code}`);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-14">
      <div className="certificate relative overflow-hidden p-8 text-center">
        <Rosette
          size={420}
          strands={20}
          strokeWidth={0.35}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brass/[0.07]"
        />
        <div className="relative">
          <p className="label text-brass">{t.invitedTo}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-paper">{group.name}</h1>
          {owner && <p className="mt-2 text-paper-dim">{fmt(t.organiser, { name: owner.name })}</p>}

          <dl className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-4 text-left text-sm">
            <div className="col-span-2 rounded border border-line bg-ink p-4">
              <dt className="label text-[10px]">{ui.groups.create.mode}</dt>
              <dd className="mt-1 font-display text-lg text-paper">{mode.name}</dd>
              <dd className="text-paper-dim">
                {fmt(mode.rule, {
                  sessions: group.sessionsTarget,
                  target: group.targetReturn ?? 0,
                  every: group.eliminationEvery ?? 0,
                })}
              </dd>
            </div>
            <div className="col-span-2 rounded border-2 border-brass/60 bg-brass/10 p-4">
              <dt className="label text-[10px] text-brass">{ui.groups.create.tempo}</dt>
              <dd className="mt-1 font-display text-lg text-paper">{tempo.name}</dd>
              <dd className="text-paper-dim">{tempo.text}</dd>
            </div>
            <div>
              <dt className="label text-[10px]">{ui.groups.create.startDate}</dt>
              <dd className="num mt-1 text-paper">{f.date(group.startDate)}</dd>
            </div>
            <div>
              <dt className="label text-[10px]">{ui.groups.create.currency}</dt>
              <dd className="num mt-1 text-paper">{group.currency}</dd>
            </div>
            {scenarioName && group.scenario !== 'libre' && (
              <div>
                <dt className="label text-[10px]">{ui.scenarios.label}</dt>
                <dd className="mt-1 text-paper">{scenarioName}</dd>
              </div>
            )}
            <div>
              <dt className="label text-[10px]">{ui.groups.panel.standings}</dt>
              <dd className="mt-1 text-paper">{fmt(t.players, { count: Number(count), max: group.maxPlayers })}</dd>
            </div>
          </dl>

          <div className="mt-8">
            {membership ? (
              <>
                <p className="text-paper-dim">{t.already}</p>
                <Link
                  href={href(`/game/${membership.gameId}`)}
                  className="mt-4 inline-flex h-12 items-center rounded border border-brass-bright/60 bg-brass px-7 font-label font-semibold uppercase tracking-[0.14em] text-ink"
                >
                  {t.open}
                </Link>
              </>
            ) : !joinable || full ? (
              <p className="text-loss">{t.closed}</p>
            ) : !userId ? (
              <div className="flex flex-col items-center gap-3">
                <Link
                  href={`${href('/login')}?redirect=${encodeURIComponent(redirectTo)}`}
                  className="inline-flex h-12 items-center rounded border border-brass-bright/60 bg-brass px-7 font-label font-semibold uppercase tracking-[0.14em] text-ink"
                >
                  {t.login}
                </Link>
                <Link
                  href={`${href('/signup')}?redirect=${encodeURIComponent(redirectTo)}`}
                  className="text-sm text-paper-dim underline underline-offset-4 hover:text-paper"
                >
                  {t.signup}
                </Link>
              </div>
            ) : (
              <JoinGroupButton
                code={group.code}
                synchro={group.tempo === 'synchro'}
                timeoutHours={group.syncTimeoutHours ?? 24}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
