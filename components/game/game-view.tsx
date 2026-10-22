/**
 * FINANCEQUEST - COMPONENT: GameView
 * La partie : séance, portefeuille, positions, cote et livre d'ordres
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { PortfolioSummary } from '@/components/game/portfolio-summary';
import Link from 'next/link';
import { PositionsPanel } from '@/components/game/positions-panel';
import { MedalOverlay } from '@/components/game/achievement-medal';
import { TickerTape } from '@/components/brand/ticker-tape';
import { AssetList } from '@/components/game/asset-list';
import { NextDayButton } from '@/components/game/next-day-button';
import { TransactionHistory } from '@/components/game/transaction-history';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n/client';
import { preloadSounds } from '@/lib/sound';
import { getScenario } from '@/lib/game/scenarios';
import { EndControls } from '@/components/game/end-controls';
import { GameSummary } from '@/components/game/game-summary';
import type {
  GameState,
  GameSummary as GameSummaryData,
  GameWithStats,
  PortfolioSummary as PortfolioType,
  HoldingWithValue,
} from '@/types/game';
import type { Transaction } from '@/types/database';

// ==========================================
// PAGE
// ==========================================

export function GameView({ gameId }: { gameId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { m, f, fmt, href } = useI18n();

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<GameWithStats | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [holdings, setHoldings] = useState<HoldingWithValue[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<GameSummaryData | null>(null);

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

  // Fetch game data
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
    } catch (error) {
      toast.error(m.common.networkError);
      router.push(href('/dashboard'));
    } finally {
      setLoading(false);
    }
  }

  // Pas d'attente de /api/auth/session : le proxy protège déjà la page
  // et l'API renvoie 401 si la session a expiré
  useEffect(() => {
    if (gameId) {
      fetchGameData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Sons du jeu décodés pendant la lecture de la partie, prêts au premier ordre
  useEffect(() => preloadSounds(), []);

  if (loading) {
    return <LoadingPage />;
  }

  if (!game || !portfolio) {
    return null;
  }

  const serial = game.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  const scenario = getScenario(game.scenario);
  const scenarioName = (m.scenarios[scenario.id as keyof typeof m.scenarios] as { name: string }).name;

  // Partie terminée : le bilan, puis le livre d'ordres
  if (game.status === 'completed') {
    return (
      <div className="container mx-auto space-y-10 px-4 py-10">
        <GameSummary
          state={{ game, portfolio, holdings, recentTransactions: transactions, summary }}
        />
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

  return (
    <div>
      {tickerItems.length >= 3 && <TickerTape items={tickerItems} />}

      <div className="container mx-auto px-4 py-8">
        {/* En-tête du titre */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <Link
              href={href('/dashboard')}
              className="label transition-colors hover:text-paper"
            >
              {m.game.back}
            </Link>
            <h1 className="mt-2 font-display text-3xl font-semibold text-paper md:text-4xl">
              {fmt(m.game.openedOn, { date: f.date(game.startDate) })}
            </h1>
          </div>
          <dl className="flex flex-wrap gap-6 text-right">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          {/* Colonne portefeuille */}
          <div className="space-y-6">
            <NextDayButton
              gameId={game.id}
              currentDate={game.currentDate}
              startDate={game.startDate}
              endDate={scenario.rules.period?.end ?? game.dataEndDate ?? game.currentDate}
              totalValue={portfolio.totalValue}
              currency={game.currency}
              onDayAdvanced={handleActionDone}
            />

            <EndControls gameId={game.id} sessionsPlayed={game.sessionsPlayed} onEnded={handleActionDone} />

            <PortfolioSummary portfolio={portfolio} currency={game.currency} />

            <PositionsPanel
              holdings={holdings}
              gameId={game.id}
              currentDate={game.currentDate}
              currency={game.currency}
              feeRate={game.settings.transaction_fees}
              scenario={game.scenario}
              onTradeComplete={handleActionDone}
            />
          </div>

          {/* Colonne marché */}
          <div className="space-y-6">
            <AssetList
              gameId={game.id}
              currentDate={game.currentDate}
              currency={game.currency}
              allowShorting={game.settings.allow_shorting}
              scenario={game.scenario}
              feeRate={game.settings.transaction_fees}
              availableCash={portfolio.availableCash}
              onTradeComplete={handleActionDone}
            />

            <TransactionHistory transactions={transactions} currency={game.currency} />
          </div>
        </div>
      </div>

      <MedalOverlay />
    </div>
  );
}
