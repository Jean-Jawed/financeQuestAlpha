/**
 * FINANCEQUEST - PAGE: ABOUT
 */
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Présentation — FinanceQuest',
  description: 'Découvrez FinanceQuest, le simulateur de trading historique en mode gaming',
};

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="fq-stat">
      <span className="fq-stat-value">{value}</span>
      <span className="fq-stat-label">{label}</span>
    </div>
  );
}

function AssetCategory({ count, tag, label, examples }: { count: number; tag: string; label: string; examples: string }) {
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
      <div className="fq-feature-dot" />
      <div>
        <h3 className="fq-feature-title">{title}</h3>
        <p className="fq-feature-desc">{description}</p>
      </div>
    </div>
  );
}

const TICKER_DATA = [
  { s: 'AAPL', v: '+2.4%', up: true },  { s: 'BTC',     v: '+8.1%',  up: true  },
  { s: 'LVMH', v: '-1.2%', up: false }, { s: 'NVDA',    v: '+5.7%',  up: true  },
  { s: 'GC=F', v: '+0.3%', up: true },  { s: 'EUR/USD', v: '-0.5%',  up: false },
  { s: 'TSLA', v: '+3.9%', up: true },  { s: 'TTE',     v: '-0.8%',  up: false },
  { s: 'ETH',  v: '+6.2%', up: true },  { s: 'SPY',     v: '+1.1%',  up: true  },
  { s: 'MSFT', v: '+1.8%', up: true },  { s: 'CL=F',    v: '-2.1%',  up: false },
  { s: 'AIR',  v: '+0.9%', up: true },  { s: 'SOL',     v: '+12.3%', up: true  },
  { s: 'CAC 40',v:'-0.4%', up: false }, { s: 'AMZN',    v: '+2.6%',  up: true  },
  { s: 'RMS',  v: '+1.5%', up: true },  { s: 'XOM',     v: '-1.7%',  up: false },
];

export default function AboutPage() {
  const tickerItems = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');

        .fq-about {
          --bg:          #0a0e17;
          --bg-card:     #0f1420;
          --bg-raised:   #141929;
          --border:      rgba(255,255,255,0.06);
          --border-cyan: rgba(34,211,238,0.22);
          --ink:         #f1f5f9;
          --ink-muted:   #64748b;
          --cyan:        #22d3ee;
          --cyan-dim:    rgba(34,211,238,0.10);
          --cyan-glow:   rgba(34,211,238,0.06);
          --cyan-text:   #67e8f9;
          --green:       #34d399;
          --red:         #f87171;
          background-color: var(--bg);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          min-height: 100vh;
        }

        /* HERO */
        .fq-hero {
          position: relative;
          padding: 100px 32px 88px;
          max-width: 1000px;
          margin: 0 auto;
          overflow: hidden;
        }
        .fq-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 100%);
          pointer-events: none;
        }
        .fq-hero::after {
          content: '';
          position: absolute;
          top: -80px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .fq-hero-inner { position: relative; z-index: 1; }

        .fq-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--cyan);
          margin-bottom: 24px;
          font-weight: 500;
        }
        .fq-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 8px var(--cyan);
          animation: pulse-dot 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(.75); }
        }
        .fq-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(44px,7vw,80px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.03em;
          margin: 0;
          color: var(--ink);
        }
        .fq-hero-title .accent { color: var(--cyan); }
        .fq-hero-sub {
          font-size: 17px;
          line-height: 1.75;
          color: var(--ink-muted);
          max-width: 520px;
          margin: 28px 0 0;
          font-weight: 300;
        }

        /* TICKER */
        .fq-ticker {
          overflow: hidden;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--bg-card);
          padding: 10px 0;
        }
        .fq-ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll 35s linear infinite;
        }
        .fq-ticker-item {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 22px;
          border-right: 1px solid var(--border);
          white-space: nowrap;
          font-size: 11.5px;
          letter-spacing: .02em;
        }
        .fq-ticker-symbol { color: var(--ink); font-weight: 500; }
        .fq-ticker-up   { color: var(--green); }
        .fq-ticker-down { color: var(--red); }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* STATS */
        .fq-stats {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          max-width: 1000px;
          margin: 0 auto;
          border-bottom: 1px solid var(--border);
        }
        .fq-stat {
          padding: 36px 32px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: background .2s;
        }
        .fq-stat:last-child { border-right: none; }
        .fq-stat:hover { background: var(--bg-card); }
        .fq-stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 38px;
          font-weight: 700;
          line-height: 1;
          color: var(--ink);
          letter-spacing: -.02em;
        }
        .fq-stat:first-child .fq-stat-value { color: var(--cyan); }
        .fq-stat-label {
          font-size: 11px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--ink-muted);
          font-weight: 400;
        }

        /* SECTIONS */
        .fq-section {
          max-width: 1000px;
          margin: 0 auto;
          padding: 72px 32px;
          border-bottom: 1px solid var(--border);
        }
        .fq-section-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
          margin-bottom: 48px;
        }
        .fq-section-header.single {
          grid-template-columns: 1fr;
          max-width: 580px;
          margin-bottom: 40px;
        }
        .fq-section-tag {
          display: block;
          font-size: 10px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--cyan);
          font-weight: 500;
          margin-bottom: 14px;
        }
        .fq-section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(24px,3.5vw,36px);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -.02em;
          margin: 0;
          color: var(--ink);
        }
        .fq-section-body {
          font-size: 15px;
          line-height: 1.8;
          color: var(--ink-muted);
          margin: 0;
          font-weight: 300;
        }
        .fq-section-body strong { color: var(--ink); font-weight: 500; }
        .fq-callout {
          padding: 16px 20px;
          background: var(--cyan-glow);
          border: 1px solid var(--border-cyan);
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.65;
          color: var(--ink-muted);
        }
        .fq-callout strong { color: var(--cyan-text); font-weight: 500; }

        /* ASSETS */
        .fq-assets {
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          background: var(--bg-card);
        }
        .fq-assets-head {
          display: grid;
          grid-template-columns: 160px 1fr;
          padding: 12px 24px;
          background: var(--bg-raised);
          border-bottom: 1px solid var(--border);
        }
        .fq-assets-head span {
          font-size: 10px;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--ink-muted);
          font-weight: 400;
        }
        .fq-asset-row {
          display: grid;
          grid-template-columns: 160px 1fr;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          align-items: center;
          transition: background .15s;
        }
        .fq-asset-row:hover { background: var(--bg-raised); }
        .fq-asset-left { display: flex; flex-direction: column; gap: 6px; }
        .fq-asset-tag {
          font-size: 9px;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--cyan);
          padding: 2px 7px;
          border: 1px solid var(--border-cyan);
          border-radius: 3px;
          width: fit-content;
          background: var(--cyan-dim);
          font-weight: 500;
        }
        .fq-asset-count {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1;
          letter-spacing: -.02em;
        }
        .fq-asset-right {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-left: 24px;
          border-left: 1px solid var(--border);
        }
        .fq-asset-label   { font-size: 14px; font-weight: 500; color: var(--ink); }
        .fq-asset-examples { font-size: 12px; color: var(--ink-muted); font-weight: 300; line-height: 1.5; }
        .fq-assets-foot {
          padding: 14px 24px;
          background: var(--bg-raised);
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .fq-assets-foot-label { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-muted); }
        .fq-assets-foot-value { font-family: 'Syne',sans-serif; font-size: 20px; font-weight: 700; color: var(--cyan); }

        /* FEATURES */
        .fq-features {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }
        .fq-feature {
          display: flex;
          gap: 14px;
          padding: 24px;
          background: var(--bg-card);
          transition: background .2s;
        }
        .fq-feature:hover { background: var(--bg-raised); }
        .fq-feature-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 8px rgba(34,211,238,.5);
          flex-shrink: 0;
          margin-top: 5px;
        }
        .fq-feature-title { font-size: 14px; font-weight: 500; color: var(--ink); margin: 0 0 6px; }
        .fq-feature-desc  { font-size: 13px; line-height: 1.6; color: var(--ink-muted); margin: 0; font-weight: 300; }

        /* CTA */
        .fq-cta {
          max-width: 1000px;
          margin: 0 auto;
          padding: 88px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
        }
        .fq-cta-text {
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px,3vw,34px);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -.02em;
          color: var(--ink);
          max-width: 460px;
          margin: 0;
        }
        .fq-cta-text span { color: var(--cyan); }
        .fq-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: var(--cyan);
          color: #0a0e17;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          border-radius: 6px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: opacity .2s, transform .2s, box-shadow .2s;
          box-shadow: 0 0 24px rgba(34,211,238,.2);
        }
        .fq-cta-btn:hover { opacity:.9; transform:translateY(-2px); box-shadow:0 0 36px rgba(34,211,238,.35); }
        .fq-cta-arrow { transition: transform .2s; display: inline-block; }
        .fq-cta-btn:hover .fq-cta-arrow { transform: translateX(4px); }

        /* FOOTER */
        .fq-about-footer {
          border-top: 1px solid var(--border);
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px 32px;
        }
        .fq-about-footer p { font-size: 11px; color: var(--ink-muted); opacity: .45; margin: 0; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .fq-hero           { padding: 64px 20px 56px; }
          .fq-stats          { grid-template-columns: repeat(2,1fr); }
          .fq-stat           { padding: 28px 20px; }
          .fq-section        { padding: 56px 20px; }
          .fq-section-header { grid-template-columns: 1fr; gap: 24px; }
          .fq-features       { grid-template-columns: 1fr; }
          .fq-assets-head,
          .fq-asset-row      { grid-template-columns: 110px 1fr; }
          .fq-cta            { flex-direction: column; align-items: flex-start; padding: 64px 20px; }
          .fq-about-footer   { padding: 20px; }
        }
      `}</style>

      <div className="fq-about">

        <section className="fq-hero">
          <div className="fq-hero-inner">
            <div className="fq-eyebrow">
              <span className="fq-eyebrow-dot" />
              Simulateur de trading historique
            </div>
            <h1 className="fq-hero-title">
              Tradez le passé.<br />
              <span className="accent">Maîtrisez l'avenir.</span>
            </h1>
            <p className="fq-hero-sub">
              Remontez dans le temps, choisissez votre date de départ, et construisez votre portfolio avec 10 000$ virtuels sur des données de marché authentiques.
            </p>
          </div>
        </section>

        <div className="fq-ticker">
          <div className="fq-ticker-track">
            {tickerItems.map((t, i) => (
              <div key={i} className="fq-ticker-item">
                <span className="fq-ticker-symbol">{t.s}</span>
                <span className={t.up ? 'fq-ticker-up' : 'fq-ticker-down'}>{t.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fq-stats">
          <StatBlock value="243"     label="Actifs disponibles" />
          <StatBlock value="8"       label="Classes d'actifs"   />
          <StatBlock value="14"      label="Marchés mondiaux"   />
          <StatBlock value="10 000$" label="Capital de départ"  />
        </div>

        <section className="fq-section">
          <div className="fq-section-header">
            <div>
              <span className="fq-section-tag">Le concept</span>
              <h2 className="fq-section-title">Le temps comme<br />terrain de jeu</h2>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'20px', paddingTop:'2px' }}>
              <p className="fq-section-body">
                FinanceQuest vous donne accès aux données historiques authentiques des marchés mondiaux. Choisissez n'importe quelle date de départ, constituez votre portfolio, et avancez jour par jour. <strong>Pas de simulation artificielle — de vraies données, de vraies fluctuations.</strong>
              </p>
              <div className="fq-callout">
                <strong>Une règle unique :</strong> vous ne pouvez pas voyager dans le futur. Votre partie s'arrête automatiquement à la date du jour — ce qui rend chaque décision aussi conséquente que dans la réalité.
              </div>
            </div>
          </div>
        </section>

        <section className="fq-section">
          <div className="fq-section-header single">
            <span className="fq-section-tag">Catalogue d'actifs</span>
            <h2 className="fq-section-title">243 actifs, 8 classes,<br />14 marchés mondiaux</h2>
          </div>
          <div className="fq-assets">
            <div className="fq-assets-head">
              <span>Catégorie</span>
              <span style={{ paddingLeft:'24px' }}>Détail</span>
            </div>
            <AssetCategory count={156} tag="Actions"        label="14 marchés mondiaux"     examples="NYSE · NASDAQ · Euronext Paris · LSE · XETRA · TSE · HKEX · SSE · TSX · ASX · SIX · AMS · BRU · MIL" />
            <AssetCategory count={40}  tag="Crypto"         label="Cryptomonnaies"           examples="Bitcoin · Ethereum · Solana · BNB · XRP · Cardano · Avalanche · Polygon · Chainlink · Arbitrum · Optimism..." />
            <AssetCategory count={10}  tag="Forex"          label="Paires de devises"        examples="EUR/USD · GBP/USD · USD/JPY · USD/CHF · EUR/GBP · AUD/USD · USD/CAD · EUR/JPY · GBP/JPY · NZD/USD" />
            <AssetCategory count={10}  tag="Obligations"    label="ETF obligataires US"      examples="TLT · IEF · SHY · LQD · HYG · BND · AGG · VCIT · VCSH · MUB" />
            <AssetCategory count={10}  tag="Matières 1ères" label="Commodities"              examples="Or · Argent · Pétrole WTI · Gaz naturel · Cuivre · Platine · Palladium · Maïs · Blé · Soja" />
            <AssetCategory count={7}   tag="Indices"        label="Grands indices boursiers" examples="S&P 500 · Dow Jones · NASDAQ Composite · CAC 40 · DAX · FTSE 100 · Nikkei 225" />
            <AssetCategory count={6}   tag="ETF"            label="ETF diversifiés"          examples="SPY · QQQ · VTI · EFA · IWM · Amundi MSCI World · Lyxor CAC 40" />
            <AssetCategory count={4}   tag="Immobilier"     label="REITs"                    examples="Prologis · Simon Property Group · Realty Income · Unibail-Rodamco-Westfield" />
            <div className="fq-assets-foot">
              <span className="fq-assets-foot-label">Total</span>
              <span className="fq-assets-foot-value">243 actifs</span>
            </div>
          </div>
        </section>

        <section className="fq-section">
          <div className="fq-section-header single">
            <span className="fq-section-tag">Fonctionnalités</span>
            <h2 className="fq-section-title">Toutes les mécaniques<br />d'un vrai compte de trading</h2>
          </div>
          <div className="fq-features">
            <FeatureItem title="Positions longues"    description="Achetez des actifs et profitez de leur appréciation dans le temps." />
            <FeatureItem title="Vente à découvert"    description="Pariez sur la baisse des prix via le short selling, une mécanique avancée." />
            <FeatureItem title="Historique 30 jours"  description="Consultez les tendances récentes de chaque actif avant de prendre position." />
            <FeatureItem title="Données authentiques" description="Prix historiques réels via Yahoo Finance et MarketStack. Aucune valeur fictive." />
            <FeatureItem title="Classement global"    description="Comparez vos performances avec d'autres joueurs sur les mêmes périodes historiques." />
            <FeatureItem title="Achievements"         description="Progressez et débloquez des badges au fil de vos exploits de trading." />
          </div>
        </section>

        <div className="fq-cta">
          <p className="fq-cta-text">
            Prêt à tester votre stratégie sur <span>les marchés qui ont déjà eu lieu ?</span>
          </p>
          <Link href="/dashboard" className="fq-cta-btn">
            Commencer une partie
            <span className="fq-cta-arrow">→</span>
          </Link>
        </div>

        <footer className="fq-about-footer">
          <p>FinanceQuest est un outil éducatif. Les performances passées ne constituent pas une garantie des résultats futurs.</p>
        </footer>

      </div>
    </>
  );
}
