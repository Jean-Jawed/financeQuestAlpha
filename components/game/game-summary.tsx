/**
 * FINANCEQUEST - COMPONENT: GameSummary
 * Le bilan d'une partie terminée : gravure selon la fin, valeur et rendement
 * finaux, comparaison avec l'indice du scénario, rang, partage
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PerformanceBadge } from '@/components/ui/badge';
import { Rosette } from '@/components/brand/guilloche';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { getScenario } from '@/lib/game/scenarios';
import { cn } from '@/lib/utils/cn';
import type { GameState } from '@/types/game';

type EndReason = keyof ReturnType<typeof useI18n>['m']['end']['reasons'];

/** Gravure du bilan selon la façon dont la partie s'est terminée */
const END_IMAGES: Record<EndReason, string> = {
  retired: '/gravures/retraite.webp',
  bankrupt: '/gravures/faillite.webp',
  period_end: '/gravures/sablier-bilan.webp',
  data_end: '/gravures/sablier-bilan.webp',
  abandoned: '/gravures/sablier-bilan.webp',
  // Parties de groupe
  group_end: '/gravures/laurier.webp',
  target_reached: '/gravures/laurier.webp',
  eliminated: '/gravures/faillite.webp',
};

export function GameSummary({ state }: { state: GameState }) {
  const { m, f, fmt, href } = useI18n();
  const { toast } = useToast();
  const t = m.end;
  const { game, summary } = state;

  const reason = (game.endReason ?? 'retired') as EndReason;
  const scenario = getScenario(game.scenario);
  const scenarioName = m.scenarios[scenario.id as keyof typeof m.scenarios] as { name: string };
  const finalValue = parseFloat(game.finalValue ?? String(state.portfolio.totalValue));
  const finalReturn = parseFloat(game.finalReturn ?? String(state.portfolio.returnPercentage));
  const benchmark = summary?.benchmark ?? null;
  const gap = benchmark ? finalReturn - benchmark.returnPercentage : null;

  async function share() {
    const text = fmt(t.shareText, { scenario: scenarioName.name, result: f.percent(finalReturn, 1) });
    const url = `${window.location.origin}${href('/')}`;

    try {
      if (navigator.share) {
        await navigator.share({ text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success(t.copied);
      }
    } catch {
      // Partage annulé par le joueur : rien à faire
    }
  }

  return (
    <section className="certificate relative mx-auto max-w-3xl overflow-hidden px-6 py-10 text-center sm:px-10" aria-labelledby="summary-title">
      <Rosette
        size={520}
        strands={20}
        strokeWidth={0.35}
        className="absolute -right-44 -top-44 text-brass/[0.08]"
      />

      <p className="label relative text-brass">
        {t.summary} · {scenarioName.name}
      </p>
      <div className="relative mx-auto mt-6 w-40 overflow-hidden rounded border-[5px] border-double border-brass/60 bg-paper p-1.5 sm:w-48">
        <Image src={END_IMAGES[reason]} alt="" width={400} height={400} className="engraving h-auto w-full" />
      </div>
      <h1 id="summary-title" className="relative mt-6 font-display text-4xl font-semibold text-paper md:text-5xl">
        {t.titles[reason]}
      </h1>
      <p className="label relative mt-2">
        {t.reasons[reason]} · {fmt(t.playedFrom, { start: f.date(game.startDate), end: f.date(game.currentDate) })}
      </p>

      {/* Résultat */}
      <div className="relative mt-8 flex flex-col items-center gap-3">
        <p className="label">{t.finalValue}</p>
        <p className="num text-5xl font-semibold text-paper">{f.currency(finalValue, game.currency)}</p>
        <PerformanceBadge value={finalReturn} />
        {benchmark && gap !== null && (
          <p className="mt-2 max-w-md text-paper-dim">
            {fmt(t.benchmark, { index: benchmark.name })} : {f.percent(benchmark.returnPercentage, 1)}.{' '}
            <span className={cn(gap >= 0 ? 'text-gain' : 'text-loss')}>
              {fmt(gap >= 0 ? t.beat : t.behind, { points: f.number(Math.abs(gap), 1) })}
            </span>
          </p>
        )}
      </div>

      {/* Chiffres de la partie */}
      <dl className="relative mt-10 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line text-left sm:grid-cols-4">
        {[
          { label: t.sessions, value: String(game.sessionsPlayed) },
          { label: t.orders, value: String(summary?.ordersCount ?? 0) },
          { label: t.fees, value: f.currency(summary?.feesPaid ?? 0, game.currency) },
          { label: t.achievements, value: String(game.achievementsUnlocked) },
        ].map((stat) => (
          <div key={stat.label} className="bg-ink-2 px-4 py-4">
            <dt className="label text-[10px]">{stat.label}</dt>
            <dd className="num mt-1 text-lg text-paper">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <p className="relative mt-6 font-display text-xl text-paper">
        {t.rank} :{' '}
        <span className="text-brass">
          {summary?.rank ? fmt(t.rankValue, { rank: summary.rank.rank, total: summary.rank.total }) : t.unranked}
        </span>
      </p>

      {/* Suites */}
      <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={share}
          className="inline-flex h-12 items-center rounded border border-brass-bright/60 bg-brass px-7 font-label text-base font-semibold uppercase tracking-[0.14em] text-ink shadow-[0_2px_0_#8E7034] transition-colors hover:bg-brass-bright"
        >
          {t.share}
        </button>
        <Link
          href={href('/dashboard')}
          className="inline-flex h-12 items-center rounded border border-brass/70 px-6 font-label text-base font-semibold uppercase tracking-[0.14em] text-brass transition-colors hover:bg-brass/10"
        >
          {t.newGame}
        </Link>
        <Link
          href={`${href('/leaderboard')}?scenario=${scenario.id}`}
          className="font-label text-sm font-semibold uppercase tracking-label text-paper-dim underline-offset-4 hover:text-paper hover:underline"
        >
          {t.leaderboard}
        </Link>
      </div>
    </section>
  );
}
