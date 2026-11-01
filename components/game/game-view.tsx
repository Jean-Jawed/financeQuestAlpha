/**
 * FINANCEQUEST - COMPONENT: GameView
 * La partie, « salle des machines » (docs/reviewOct2026/phase3/03_refonte_da.md)
 *
 * Bureau (1024 px et plus) : fiche du joueur, compteur de valeur et pupitre de
 * séance ; puis carnet de cotes, l'actif choisi (courbe en cadre miroir et
 * guichet posé) et le portefeuille ; enfin journal du marché et livre d'ordres.
 * Téléphone : bandeau collant (médaillon, XP, valeur), onglets en plaques,
 * barre d'action en bas (passer un ordre, séance suivante), ticket en tiroir.
 *
 * Partie de groupe : panneau du groupe et, en tempo synchronisé, séance commune.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { PositionsPanel } from '@/components/game/positions-panel';
import { MedalOverlay } from '@/components/game/achievement-medal';
import { TickerTape } from '@/components/brand/ticker-tape';
import { AssetList } from '@/components/game/asset-list';
import { MarketJournal } from '@/components/game/market-journal';
import { NextDayButton } from '@/components/game/next-day-button';
import { TransactionHistory } from '@/components/game/transaction-history';
import { PriceChart } from '@/components/game/price-chart';
import { TradeTicket, type TradeSelection } from '@/components/game/trade-ticket';
import { AllocationBar, NextAchievement, PlayerPlate, ValueCounter } from '@/components/game/machine-panels';
import { portfolioSessionChange } from '@/lib/game/session-change';
import { EndControls } from '@/components/game/end-controls';
import { GameSummary } from '@/components/game/game-summary';
import { GroupPanel } from '@/components/groups/group-panel';
import { Frame, Plate } from '@/components/machine/frame';
import { EnamelButton, Gauge } from '@/components/machine/instruments';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { preloadSounds } from '@/lib/sound';
import { getScenario } from '@/lib/game/scenarios';
import { cn } from '@/lib/utils/cn';
import type { GroupView } from '@/types/groups';
import type {
  GameState,
  GameSummary as GameSummaryData,
  GameWithStats,
  PortfolioSummary as PortfolioType,
  HoldingWithValue,
} from '@/types/game';
import type { Transaction } from '@/types/database';

type MobileTab = 'chart' | 'positions' | 'book' | 'market' | 'group';

// ==========================================
// PAGE
// ==========================================

export function GameView({ gameId }: { gameId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { m, f, fmt, href } = useI18n();
  const t = m.game.machine;
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<GameWithStats | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [holdings, setHoldings] = useState<HoldingWithValue[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<GameSummaryData | null>(null);
  const [groupView, setGroupView] = useState<GroupView | null>(null);

  // Actif affiché au centre (courbe et guichet), choisi dans le carnet, les positions ou le journal
  const [selection, setSelection] = useState<TradeSelection | null>(null);
  // Remet le guichet à zéro (quantité, sens) à chaque nouveau choix ou ordre passé
  const [deskKey, setDeskKey] = useState(0);
  // Devise de cotation de l'actif choisi : la courbe n'est pas convertie
  const [quoteCurrency, setQuoteCurrency] = useState<string | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [tab, setTab] = useState<MobileTab>('chart');

  function applyState(state: GameState) {
    setGame(state.game);
    setPortfolio(state.portfolio);
    setHoldings(state.holdings);
    setTransactions(state.recentTransactions);
    setSummary(state.summary);
  }

  // Après un ordre ou une séance : l'API renvoie l'état à jour ; sinon, relire
  function handleActionDone(state?: GameState) {
    if (state) {
      applyState(state);
    } else {
      fetchGameData();
    }
  }

  // Ordre passé depuis le guichet : l'actif reste affiché, le guichet repart en ouverture
  function handleTradeDone(state?: GameState) {
    handleActionDone(state);
    setSelection((current) => current && { asset: current.asset, mode: 'open' });
    setDeskKey((key) => key + 1);
  }

  function select(next: TradeSelection) {
    setSelection(next);
    setDeskKey((key) => key + 1);
    // Téléphone : le ticket monte en tiroir
    if (!isDesktop) setTicketOpen(true);
  }

  async function fetchGameData() {
    try {
      const res = await fetch(`/api/games/${gameId}`);

      // Session expirée : retour au login, puis retour ici après connexion
      if (res.status === 401) {
        window.location.href = `${href('/login')}?redirect=${encodeURIComponent(href(`/game/${gameId}`))}`;
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || m.common.loadError);
        router.push(href('/dashboard'));
        return;
      }

      applyState(data.data);
    } catch {
      toast.error(m.common.networkError);
      router.push(href('/dashboard'));
    } finally {
      setLoading(false);
    }
  }

  // Partie de groupe : la séance commune a avancé, ou la partie s'est terminée
  // (fin du groupe, élimination) sans action du joueur : relire la partie
  function handleGroupUpdate(view: GroupView) {
    setGroupView(view);
    if (game && (view.viewer.date !== game.currentDate || view.viewer.status !== game.status)) {
      fetchGameData();
    }
  }

  // Pas d'attente de /api/auth/session : le proxy protège déjà la page
  // et l'API renvoie 401 si la session a expiré
  useEffect(() => {
    if (gameId) fetchGameData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Sons du jeu décodés pendant la lecture de la partie, prêts au premier ordre
  useEffect(() => preloadSounds(), []);

  // Actif affiché par défaut : la plus grosse position, sinon l'indice du scénario
  useEffect(() => {
    if (!game || selection) return;
    const biggest = [...holdings].filter((h) => !h.isShort).sort((a, b) => b.currentValue - a.currentValue)[0];
    const benchmark = getScenario(game.scenario).benchmark;
    setSelection({
      asset: biggest ? { symbol: biggest.symbol, name: biggest.name } : { symbol: benchmark, name: benchmark },
      mode: 'open',
    });
  }, [game, holdings, selection]);

  // Devise de cotation de l'actif choisi
  const selectedSymbol = selection?.asset.symbol;
  const currentDate = game?.currentDate;
  const gameCurrency = game?.currency;
  useEffect(() => {
    if (!selectedSymbol || !currentDate || !gameCurrency) return;
    let cancelled = false;
    const params = new URLSearchParams({ symbol: selectedSymbol, date: currentDate, currency: gameCurrency });
    fetch(`/api/market/price?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => !cancelled && setQuoteCurrency(json?.data?.assetCurrency ?? null))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedSymbol, currentDate, gameCurrency]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!game || !portfolio) {
    return null;
  }

  const serial = game.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  // Relecture du classement et du prochain succès après chaque ordre ou séance du joueur
  const refreshKey = `${game.currentDate}|${transactions.length}|${transactions[0]?.id ?? ''}|${game.status}`;
  const scenario = getScenario(game.scenario);
  const scenarioName = (m.scenarios[scenario.id as keyof typeof m.scenarios] as { name: string }).name;
  const allowed = scenario.rules.actions;

  const sync =
    groupView && groupView.group.tempo === 'synchro'
      ? {
          started: groupView.group.status !== 'open',
          ready: groupView.viewer.ready,
          readyCount: groupView.sync?.readyCount ?? 0,
          total: groupView.sync?.total ?? groupView.group.playersCount,
        }
      : undefined;
  const you = groupView?.standings.find((standing) => standing.isYou);
  const groupRank = you && groupView ? { rank: you.rank, total: groupView.standings.length } : null;

  const groupPanel = (framed: boolean) =>
    game.groupId ? (
      <GroupPanel groupId={game.groupId} refreshKey={refreshKey} onUpdate={handleGroupUpdate} framed={framed} />
    ) : null;

  // Partie terminée : le bilan, puis le livre d'ordres
  if (game.status === 'completed') {
    return (
      <div className="container mx-auto space-y-10 px-4 py-10">
        <GameSummary state={{ game, portfolio, holdings, recentTransactions: transactions, summary }} />
        {game.groupId && <div className="mx-auto max-w-3xl">{groupPanel(false)}</div>}
        <div className="mx-auto max-w-3xl">
          <TransactionHistory transactions={transactions} currency={game.currency} />
        </div>
        <MedalOverlay />
      </div>
    );
  }

  // Bande du jour : variation de séance des titres détenus
  const tickerItems = holdings
    .filter((h) => h.dayChangePercent !== null)
    .map((h) => ({ symbol: h.symbol, name: h.name, changePercent: h.dayChangePercent as number }));

  const session = portfolioSessionChange(holdings, portfolio.totalValue);
  const cashShare = portfolio.totalValue > 0 ? (Math.max(portfolio.availableCash, 0) / portfolio.totalValue) * 100 : 100;
  const selectedTrades = selection
    ? transactions
        .filter((tx) => tx.symbol === selection.asset.symbol)
        .map((tx) => ({ date: tx.transactionDate, type: tx.type }))
    : [];

  // ---------- Pièces partagées entre bureau et téléphone ----------

  const nextDay = (layout: 'desk' | 'bar') => (
    <NextDayButton
      layout={layout}
      gameId={game.id}
      currentDate={game.currentDate}
      startDate={game.startDate}
      endDate={scenario.rules.period?.end ?? game.dataEndDate ?? game.currentDate}
      totalValue={portfolio.totalValue}
      currency={game.currency}
      onDayAdvanced={handleActionDone}
      sync={sync}
      onWaiting={() => groupView && setGroupView({ ...groupView, viewer: { ...groupView.viewer, ready: true } })}
      aside={layout === 'desk' ? <Gauge value={cashShare} label={t.cashShare} size={64} /> : undefined}
    />
  );

  const ticket = (inline: boolean) =>
    selection && (
      <TradeTicket
        key={`${selection.asset.symbol}-${selection.mode}-${deskKey}`}
        inline={inline}
        showChart={!inline}
        gameId={game.id}
        currentDate={game.currentDate}
        currency={game.currency}
        feeRate={game.settings.transaction_fees}
        asset={selection.asset}
        mode={selection.mode}
        allowShorting={game.settings.allow_shorting}
        allowedActions={allowed}
        heldQuantity={selection.heldQuantity}
        averageCost={selection.averageCost}
        availableCash={portfolio.availableCash}
        onClose={() => {
          setTicketOpen(false);
          setSelection((current) => current && { asset: current.asset, mode: 'open' });
        }}
        onDone={handleTradeDone}
      />
    );

  const chart = selection && (
    <Frame variant="mirror" className="p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-2xl font-semibold text-paper sm:text-3xl">{selection.asset.name}</h2>
        <span className="num text-sm text-paper-dim">{selection.asset.symbol}</span>
      </div>
      <PriceChart
        key={selection.asset.symbol}
        symbol={selection.asset.symbol}
        currentDate={game.currentDate}
        currency={quoteCurrency ?? game.currency}
        trades={selectedTrades}
        framed
      />
    </Frame>
  );

  const positions = (
    <Frame className="space-y-4 p-4">
      <PositionsPanel
        framed
        holdings={holdings}
        gameId={game.id}
        currentDate={game.currentDate}
        currency={game.currency}
        feeRate={game.settings.transaction_fees}
        scenario={game.scenario}
        onTradeComplete={handleActionDone}
        onSelect={select}
      />
      <AllocationBar holdings={holdings} portfolio={portfolio} />
    </Frame>
  );

  const book = (
    <Frame className="overflow-hidden p-0" corners={isDesktop}>
      <AssetList
        framed
        gameId={game.id}
        currentDate={game.currentDate}
        currency={game.currency}
        allowShorting={game.settings.allow_shorting}
        scenario={game.scenario}
        feeRate={game.settings.transaction_fees}
        availableCash={portfolio.availableCash}
        onTradeComplete={handleActionDone}
        onSelect={select}
        activeSymbol={selection?.asset.symbol}
      />
    </Frame>
  );

  const journal = (
    <Frame className="overflow-hidden p-0">
      <MarketJournal
        framed
        gameId={game.id}
        currentDate={game.currentDate}
        currency={game.currency}
        scenario={game.scenario}
        allowShorting={game.settings.allow_shorting}
        feeRate={game.settings.transaction_fees}
        availableCash={portfolio.availableCash}
        onTradeComplete={handleActionDone}
        onSelect={select}
      />
    </Frame>
  );

  const history = (
    <Frame className="overflow-hidden p-0">
      <TransactionHistory framed transactions={transactions} currency={game.currency} />
    </Frame>
  );

  const endControls = (
    <EndControls gameId={game.id} sessionsPlayed={game.sessionsPlayed} inGroup={Boolean(game.groupId)} onEnded={handleActionDone} />
  );

  const meta = (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <Link href={href('/dashboard')} className="label transition-colors hover:text-paper">
          {m.game.back}
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold text-paper md:text-3xl">
          {fmt(m.game.openedOn, { date: f.date(game.startDate) })}
        </h1>
      </div>
      <dl className="flex flex-wrap gap-5 text-right">
        <div>
          <dt className="label text-[10px]">{m.scenarios.label}</dt>
          <dd className="font-display text-paper">{scenarioName}</dd>
        </div>
        <div>
          <dt className="label text-[10px]">{m.game.serial}</dt>
          <dd className="num text-paper">{fmt(m.game.serialValue, { serial })}</dd>
        </div>
        <div>
          <dt className="label text-[10px]">{m.game.currency}</dt>
          <dd className="num text-paper">{game.currency}</dd>
        </div>
        <div>
          <dt className="label text-[10px]">{m.game.fees}</dt>
          <dd className="num text-paper">{f.percent(game.settings.transaction_fees, 2, false)}</dd>
        </div>
      </dl>
    </header>
  );

  // ---------- Bureau ----------

  if (isDesktop) {
    return (
      <div>
        {tickerItems.length >= 3 && <TickerTape items={tickerItems} />}

        <div className="container mx-auto space-y-8 px-4 py-8">
          {meta}

          <section className="grid grid-cols-[minmax(0,42fr)_minmax(0,46fr)_minmax(0,48fr)] items-stretch gap-5">
            <PlayerPlate achievements={game.achievementsUnlocked} sessions={game.sessionsPlayed} groupRank={groupRank} />
            <ValueCounter portfolio={portfolio} session={session} currency={game.currency} rollKey={game.currentDate} />
            <Frame className="h-full px-4 py-2.5">{nextDay('desk')}</Frame>
          </section>

          <section className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1.1fr)]">
            <div className="xl:sticky xl:top-20">{book}</div>

            <div className="min-w-0 space-y-6">
              {chart}
              <Frame className="space-y-4 p-5">
                <Plate>{t.desk}</Plate>
                {ticket(true)}
              </Frame>
            </div>

            <div className="col-span-2 grid gap-6 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
              {positions}
              <NextAchievement gameId={game.id} currency={game.currency} refreshKey={refreshKey} />
              {game.groupId && <Frame className="p-3">{groupPanel(true)}</Frame>}
              {endControls}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            {journal}
            {history}
          </section>
        </div>

        <MedalOverlay />
      </div>
    );
  }

  // ---------- Téléphone et petite tablette ----------

  const tabs: Array<{ id: MobileTab; label: string }> = [
    { id: 'chart', label: t.tabs.chart },
    { id: 'positions', label: t.tabs.positions },
    { id: 'book', label: t.tabs.book },
    { id: 'market', label: t.tabs.market },
    ...(game.groupId ? [{ id: 'group' as const, label: t.tabs.group }] : []),
  ];
  const up = (session?.change ?? 0) >= 0;

  return (
    <div className="pb-28">
      {/* Bandeau collant : le joueur et sa valeur */}
      <div className="wood sticky top-16 z-30 border-b-2 border-brass-deep shadow-[0_6px_14px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <PlayerPlate compact achievements={game.achievementsUnlocked} sessions={game.sessionsPlayed} className="flex-1" />
          <div className="shrink-0 text-right">
            <p className="num text-lg font-semibold text-paper">{f.currency(portfolio.totalValue, game.currency)}</p>
            <p className={cn('num text-xs', up ? 'text-gain' : 'text-loss')} title={m.game.summary.session}>
              {up ? '▲ +' : '▼ '}
              {f.currency(session?.change ?? 0, game.currency)} · {f.percent(session?.percent ?? 0, 2)}
            </p>
          </div>
        </div>
        <p className="num border-t border-black/30 px-4 py-1 text-center text-xs text-paper-dim">
          {f.date(game.currentDate)} · {fmt(t.session, { count: game.sessionsPlayed })}
        </p>
      </div>

      {/* Onglets en plaques */}
      <nav aria-label={t.tabsLabel} className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={cn(
              'min-h-[40px] shrink-0 rounded px-4 font-label text-xs font-semibold uppercase tracking-label',
              tab === item.id ? 'plate' : 'border border-wood-edge bg-black/20 text-paper-dim'
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="space-y-6 px-4">
        {tab === 'chart' && (
          <>
            {chart}
            <NextAchievement gameId={game.id} currency={game.currency} refreshKey={refreshKey} />
          </>
        )}
        {tab === 'positions' && (
          <>
            <ValueCounter compact portfolio={portfolio} session={session} currency={game.currency} rollKey={game.currentDate} />
            <Frame className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="label text-[10px]">{m.game.summary.cash}</p>
                <p className="num text-lg text-paper">{f.currency(portfolio.availableCash, game.currency)}</p>
              </div>
              <Gauge value={cashShare} label={t.cashShare} size={84} />
            </Frame>
            {positions}
            {endControls}
          </>
        )}
        {tab === 'book' && book}
        {tab === 'market' && (
          <>
            {journal}
            {history}
          </>
        )}
        {tab === 'group' && game.groupId && <Frame className="p-2">{groupPanel(true)}</Frame>}
        {meta}
      </div>

      {/* Barre d'action : les deux gestes du jeu sous le pouce */}
      <div className="wood fixed inset-x-0 bottom-0 z-40 border-t-2 border-brass-deep px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_16px_rgba(0,0,0,0.55)]">
        <div className="mx-auto flex max-w-xl gap-3">
          <EnamelButton
            tone="green"
            className="min-h-[52px] flex-1 whitespace-nowrap px-3 text-sm"
            onClick={() => selection && setTicketOpen(true)}
            disabled={!selection}
          >
            {t.order}
          </EnamelButton>
          <div className="flex-[1.4]">{nextDay('bar')}</div>
        </div>
      </div>

      {ticketOpen && ticket(false)}
      <MedalOverlay />
    </div>
  );
}
