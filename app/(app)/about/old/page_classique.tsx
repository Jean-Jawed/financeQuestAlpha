/**
 * FINANCEQUEST - PAGE: ABOUT
 * Présentation du jeu et de ses fonctionnalités
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Présentation — FinanceQuest',
  description: 'Découvrez FinanceQuest, le simulateur de trading historique en mode gaming',
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="fq-stat">
      <span className="fq-stat-value">{value}</span>
      <span className="fq-stat-label">{label}</span>
    </div>
  );
}

function AssetCategory({
  count,
  label,
  examples,
  tag,
}: {
  count: number;
  label: string;
  examples: string;
  tag: string;
}) {
  return (
    <div className="fq-asset-row">
      <div className="fq-asset-left">
        <span className="fq-asset-tag">{tag}</span>
        <span className="fq-asset-count">{count}</span>
      </div>
      <div className="fq-asset-right">
        <span className="fq-asset-label">{label}</span>
        <span className="fq-asset-examples">{examples}</span>
      </div>
    </div>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="fq-feature">
      <h3 className="fq-feature-title">{title}</h3>
      <p className="fq-feature-desc">{description}</p>
    </div>
  );
}

// ==========================================
// PAGE
// ==========================================

export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Geist:wght@300;400;500;600&display=swap');

        :root {
          --ink: #f0ede8;
          --ink-muted: #8a8480;
          --ink-faint: #3a3835;
          --surface: #141210;
          --surface-raised: #1c1a17;
          --surface-high: #242118;
          --border: #2e2b26;
          --border-light: #3d3a34;
          --accent: #c9a96e;
          --accent-dim: #7a6540;
          --accent-glow: rgba(201,169,110,0.12);
          --red: #e05c5c;
          --green: #5cba8a;
        }

        .fq-page {
          min-height: 100vh;
          background-color: var(--surface);
          color: var(--ink);
          font-family: 'Geist', sans-serif;
          font-weight: 300;
        }

        /* ── HERO ─────────────────────────────────────── */
        .fq-hero {
          padding: 120px 32px 100px;
          max-width: 900px;
          margin: 0 auto;
          border-bottom: 1px solid var(--border);
        }

        .fq-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fq-eyebrow::after {
          content: '';
          display: block;
          height: 1px;
          width: 40px;
          background: var(--accent-dim);
        }

        .fq-hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(48px, 8vw, 88px);
          line-height: 1.0;
          font-weight: 400;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
          color: var(--ink);
        }

        .fq-hero-title em {
          font-style: italic;
          color: var(--accent);
        }

        .fq-hero-sub {
          font-size: 18px;
          line-height: 1.6;
          color: var(--ink-muted);
          max-width: 560px;
          margin: 28px 0 0;
          font-weight: 300;
        }

        /* ── STATS BAR ────────────────────────────────── */
        .fq-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          max-width: 900px;
          margin: 0 auto;
          border-bottom: 1px solid var(--border);
        }

        .fq-stat {
          padding: 40px 32px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .fq-stat:last-child { border-right: none; }

        .fq-stat-value {
          font-family: 'Instrument Serif', serif;
          font-size: 42px;
          line-height: 1;
          color: var(--ink);
          letter-spacing: -0.02em;
        }

        .fq-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-muted);
        }

        /* ── SECTION WRAPPER ──────────────────────────── */
        .fq-section {
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 32px;
          border-bottom: 1px solid var(--border);
        }

        .fq-section-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink-faint);
          margin-bottom: 48px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .fq-section-label::before {
          content: '';
          display: block;
          height: 1px;
          width: 24px;
          background: var(--border-light);
        }

        .fq-section-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 400;
          line-height: 1.15;
          margin: 0 0 24px;
          letter-spacing: -0.01em;
        }

        .fq-section-body {
          font-size: 16px;
          line-height: 1.75;
          color: var(--ink-muted);
          max-width: 620px;
        }

        .fq-section-body strong {
          color: var(--ink);
          font-weight: 500;
        }

        /* ── CALLOUT ──────────────────────────────────── */
        .fq-callout {
          margin-top: 32px;
          padding: 20px 24px;
          background: var(--accent-glow);
          border-left: 2px solid var(--accent);
          border-radius: 0 4px 4px 0;
          font-size: 14px;
          line-height: 1.65;
          color: var(--ink-muted);
          max-width: 560px;
        }

        .fq-callout strong {
          color: var(--accent);
          font-weight: 500;
        }

        /* ── ASSETS TABLE ─────────────────────────────── */
        .fq-assets {
          margin-top: 48px;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .fq-assets-header {
          display: grid;
          grid-template-columns: 140px 1fr;
          padding: 14px 24px;
          background: var(--surface-raised);
          border-bottom: 1px solid var(--border);
        }

        .fq-assets-header span {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-faint);
        }

        .fq-asset-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s ease;
          align-items: center;
        }

        .fq-asset-row:last-child {
          border-bottom: none;
        }

        .fq-asset-row:hover {
          background: var(--surface-raised);
        }

        .fq-asset-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .fq-asset-tag {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent-dim);
          padding: 2px 6px;
          border: 1px solid var(--accent-dim);
          border-radius: 2px;
          width: fit-content;
        }

        .fq-asset-count {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          color: var(--ink);
          line-height: 1;
          letter-spacing: -0.01em;
        }

        .fq-asset-right {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-left: 24px;
          border-left: 1px solid var(--border);
        }

        .fq-asset-label {
          font-size: 15px;
          font-weight: 500;
          color: var(--ink);
        }

        .fq-asset-examples {
          font-size: 13px;
          color: var(--ink-muted);
          font-weight: 300;
          line-height: 1.5;
        }

        .fq-assets-total {
          padding: 16px 24px;
          background: var(--surface-raised);
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .fq-assets-total-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-muted);
        }

        .fq-assets-total-value {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: var(--accent);
        }

        /* ── FEATURES GRID ────────────────────────────── */
        .fq-features {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
          margin-top: 48px;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .fq-feature {
          padding: 28px;
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .fq-feature:nth-child(even) { border-right: none; }
        .fq-feature:nth-last-child(-n+2) { border-bottom: none; }

        .fq-feature-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
          margin: 0 0 8px;
        }

        .fq-feature-desc {
          font-size: 13px;
          line-height: 1.6;
          color: var(--ink-muted);
          margin: 0;
          font-weight: 300;
        }

        /* ── CTA ──────────────────────────────────────── */
        .fq-cta-section {
          max-width: 900px;
          margin: 0 auto;
          padding: 100px 32px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 48px;
        }

        .fq-cta-text {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(24px, 3.5vw, 38px);
          font-weight: 400;
          line-height: 1.2;
          max-width: 440px;
          color: var(--ink);
          letter-spacing: -0.01em;
        }

        .fq-cta-text em {
          font-style: italic;
          color: var(--ink-muted);
        }

        .fq-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          background: var(--accent);
          color: var(--surface);
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 4px;
          white-space: nowrap;
          transition: background 0.2s ease, transform 0.2s ease;
          font-weight: 500;
          flex-shrink: 0;
        }

        .fq-cta-btn:hover {
          background: #d4b87e;
          transform: translateY(-1px);
        }

        .fq-cta-arrow {
          font-size: 16px;
          transition: transform 0.2s ease;
        }

        .fq-cta-btn:hover .fq-cta-arrow {
          transform: translateX(3px);
        }

        /* ── FOOTER NOTE ──────────────────────────────── */
        .fq-footer {
          border-top: 1px solid var(--border);
          padding: 24px 32px;
          max-width: 900px;
          margin: 0 auto;
        }

        .fq-footer p {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--ink-faint);
          margin: 0;
        }

        /* ── TICKER BAND ──────────────────────────────── */
        .fq-ticker {
          overflow: hidden;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 12px 0;
          background: var(--surface-raised);
        }

        .fq-ticker-inner {
          display: flex;
          gap: 0;
          animation: ticker 30s linear infinite;
          width: max-content;
        }

        .fq-ticker-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 28px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          border-right: 1px solid var(--border);
          white-space: nowrap;
        }

        .fq-ticker-symbol {
          color: var(--ink);
          font-weight: 500;
        }

        .fq-ticker-change.up { color: var(--green); }
        .fq-ticker-change.down { color: var(--red); }

        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── RESPONSIVE ───────────────────────────────── */
        @media (max-width: 640px) {
          .fq-hero { padding: 72px 20px 64px; }
          .fq-stats { grid-template-columns: repeat(2, 1fr); }
          .fq-section { padding: 56px 20px; }
          .fq-features { grid-template-columns: 1fr; }
          .fq-feature:nth-child(even) { border-right: none; }
          .fq-feature:nth-last-child(-n+2) { border-bottom: 1px solid var(--border); }
          .fq-feature:last-child { border-bottom: none; }
          .fq-cta-section { flex-direction: column; align-items: flex-start; padding: 64px 20px; }
          .fq-footer { padding: 20px; }
          .fq-assets-header, .fq-asset-row { grid-template-columns: 100px 1fr; }
        }
      `}</style>

      <div className="fq-page">

        {/* Hero */}
        <section className="fq-hero">
          <div className="fq-eyebrow">Simulateur de Trading Historique</div>
          <h1 className="fq-hero-title">
            Tradez<br />
            <em>l'histoire.</em>
          </h1>
          <p className="fq-hero-sub">
            Remontez dans le temps, choisissez une date de départ, et construisez votre portfolio avec 10 000$ virtuels et des données de marché authentiques.
          </p>
        </section>

        {/* Ticker */}
        <div className="fq-ticker">
          <div className="fq-ticker-inner">
            {[
              { s: 'AAPL', v: '+2.4%', up: true }, { s: 'BTC', v: '+8.1%', up: true },
              { s: 'LVMH', v: '-1.2%', up: false }, { s: 'NVDA', v: '+5.7%', up: true },
              { s: 'GC=F', v: '+0.3%', up: true }, { s: 'EURUSD', v: '-0.5%', up: false },
              { s: 'TSLA', v: '+3.9%', up: true }, { s: 'TTE', v: '-0.8%', up: false },
              { s: 'ETH', v: '+6.2%', up: true }, { s: 'SPY', v: '+1.1%', up: true },
              { s: 'MSFT', v: '+1.8%', up: true }, { s: 'CL=F', v: '-2.1%', up: false },
              { s: 'AIR', v: '+0.9%', up: true }, { s: 'SOL', v: '+12.3%', up: true },
              { s: '^FCHI', v: '-0.4%', up: false }, { s: 'AMZN', v: '+2.6%', up: true },
              { s: 'RMS', v: '+1.5%', up: true }, { s: 'XOM', v: '-1.7%', up: false },
              // duplicate for seamless loop
              { s: 'AAPL', v: '+2.4%', up: true }, { s: 'BTC', v: '+8.1%', up: true },
              { s: 'LVMH', v: '-1.2%', up: false }, { s: 'NVDA', v: '+5.7%', up: true },
              { s: 'GC=F', v: '+0.3%', up: true }, { s: 'EURUSD', v: '-0.5%', up: false },
              { s: 'TSLA', v: '+3.9%', up: true }, { s: 'TTE', v: '-0.8%', up: false },
              { s: 'ETH', v: '+6.2%', up: true }, { s: 'SPY', v: '+1.1%', up: true },
              { s: 'MSFT', v: '+1.8%', up: true }, { s: 'CL=F', v: '-2.1%', up: false },
              { s: 'AIR', v: '+0.9%', up: true }, { s: 'SOL', v: '+12.3%', up: true },
              { s: '^FCHI', v: '-0.4%', up: false }, { s: 'AMZN', v: '+2.6%', up: true },
              { s: 'RMS', v: '+1.5%', up: true }, { s: 'XOM', v: '-1.7%', up: false },
            ].map((t, i) => (
              <div key={i} className="fq-ticker-item">
                <span className="fq-ticker-symbol">{t.s}</span>
                <span className={`fq-ticker-change ${t.up ? 'up' : 'down'}`}>{t.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="fq-stats">
          <StatBlock value="243" label="Actifs disponibles" />
          <StatBlock value="8" label="Classes d'actifs" />
          <StatBlock value="14" label="Marchés mondiaux" />
          <StatBlock value="10 000$" label="Capital de départ" />
        </div>

        {/* Section — Concept */}
        <section className="fq-section">
          <div className="fq-section-label">Le Concept</div>
          <h2 className="fq-section-title">Le temps comme terrain de jeu</h2>
          <p className="fq-section-body">
            FinanceQuest vous donne accès aux données historiques authentiques des marchés financiers mondiaux. Choisissez n'importe quelle date de départ, constituez votre portfolio, et avancez jour par jour à votre rythme. <strong>Pas de simulation artificielle — de vraies données, de vraies fluctuations.</strong>
          </p>
          <div className="fq-callout">
            <strong>Une règle unique :</strong> vous ne pouvez pas voyager dans le futur. Votre partie s'arrête automatiquement à la date du jour — ce qui rend chaque décision aussi conséquente que dans la réalité.
          </div>
        </section>

        {/* Section — Assets */}
        <section className="fq-section">
          <div className="fq-section-label">Catalogue d'actifs</div>
          <h2 className="fq-section-title">243 actifs, 8 classes,<br />14 marchés</h2>
          <p className="fq-section-body">
            Du S&P 500 aux cryptomonnaies de niche, de l'or aux obligations souveraines, en passant par les grandes actions européennes et asiatiques. Un catalogue construit pour couvrir l'ensemble du spectre des marchés mondiaux.
          </p>

          <div className="fq-assets">
            <div className="fq-assets-header">
              <span>Catégorie</span>
              <span style={{ paddingLeft: '24px' }}>Détail</span>
            </div>

            <AssetCategory
              count={156}
              tag="Actions"
              label="14 marchés mondiaux"
              examples="NYSE · NASDAQ · Euronext Paris · LSE · XETRA · TSE · HKEX · SSE · TSX · ASX · SIX · AMS · BRU · MIL"
            />
            <AssetCategory
              count={40}
              tag="Crypto"
              label="Cryptomonnaies"
              examples="Bitcoin, Ethereum, Solana, BNB, XRP, Cardano, Avalanche, Polygon, Chainlink, Uniswap, Cosmos, Arbitrum, Optimism..."
            />
            <AssetCategory
              count={10}
              tag="Forex"
              label="Paires de devises"
              examples="EUR/USD · GBP/USD · USD/JPY · USD/CHF · EUR/GBP · AUD/USD · USD/CAD · EUR/JPY · GBP/JPY · NZD/USD"
            />
            <AssetCategory
              count={10}
              tag="Obligations"
              label="ETF obligataires US"
              examples="TLT · IEF · SHY · LQD · HYG · BND · AGG · VCIT · VCSH · MUB"
            />
            <AssetCategory
              count={10}
              tag="Matières 1ères"
              label="Commodities"
              examples="Or · Argent · Pétrole WTI · Gaz naturel · Cuivre · Platine · Palladium · Maïs · Blé · Soja"
            />
            <AssetCategory
              count={7}
              tag="Indices"
              label="Grands indices boursiers"
              examples="S&P 500 · Dow Jones · NASDAQ Composite · CAC 40 · DAX · FTSE 100 · Nikkei 225"
            />
            <AssetCategory
              count={6}
              tag="ETF"
              label="ETF diversifiés"
              examples="SPY · QQQ · VTI · EFA · IWM · Amundi MSCI World · Lyxor CAC 40"
            />
            <AssetCategory
              count={4}
              tag="Immobilier"
              label="REITs"
              examples="Prologis · Simon Property Group · Realty Income · Unibail-Rodamco-Westfield"
            />

            <div className="fq-assets-total">
              <span className="fq-assets-total-label">Total</span>
              <span className="fq-assets-total-value">243 actifs</span>
            </div>
          </div>
        </section>

        {/* Section — Features */}
        <section className="fq-section">
          <div className="fq-section-label">Fonctionnalités</div>
          <h2 className="fq-section-title">Conçu pour apprendre<br />par l'expérience</h2>
          <p className="fq-section-body">
            Toutes les mécaniques d'un vrai compte de trading, sans le risque réel.
          </p>

          <div className="fq-features">
            <FeatureItem
              title="Positions longues"
              description="Achetez des actifs et profitez de leur appréciation dans le temps."
            />
            <FeatureItem
              title="Vente à découvert"
              description="Pariez sur la baisse des prix via le short selling — une mécanique de trading avancée."
            />
            <FeatureItem
              title="Historique 30 jours"
              description="Consultez les tendances récentes de chaque actif avant de prendre position."
            />
            <FeatureItem
              title="Données réelles"
              description="Prix historiques authentiques via Yahoo Finance et MarketStack. Aucune simulation fictive."
            />
            <FeatureItem
              title="Classement global"
              description="Comparez vos performances avec d'autres joueurs sur la même période historique."
            />
            <FeatureItem
              title="Achievements"
              description="Progressez et débloquez des badges au fil de vos exploits de trading."
            />
          </div>
        </section>

        {/* CTA */}
        <div className="fq-cta-section">
          <p className="fq-cta-text">
            Prêt à tester votre stratégie <em>sur les marchés qui ont déjà eu lieu ?</em>
          </p>
          <Link href="/dashboard" className="fq-cta-btn">
            Commencer une partie
            <span className="fq-cta-arrow">→</span>
          </Link>
        </div>

        {/* Footer */}
        <footer className="fq-footer">
          <p>FinanceQuest est un outil éducatif. Les performances passées ne constituent pas une garantie des résultats futurs.</p>
        </footer>

      </div>
    </>
  );
}
