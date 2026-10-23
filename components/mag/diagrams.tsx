/**
 * FINANCEQUEST - COMPONENTS: schémas pédagogiques de La Gazette
 * Dessinés en SVG (nets à toutes les tailles), dans la palette du site, en français
 * et en anglais. Les courbes « illustratives » sont tirées d'un générateur à graine
 * fixe : elles sont identiques à chaque rendu.
 */

import type { Locale } from '@/lib/i18n/config';

// ==========================================
// PALETTE ET OUTILS
// ==========================================

const BRASS = '#C9A45C';
const PAPER = '#EFE6D2';
const DIM = '#A9A08C';
const FAINT = '#7D7665';
const GAIN = '#5DAE80';
const LOSS = '#D9603F';
const LINE = 'rgb(239 230 210 / 0.12)';

const LABEL = { fontFamily: 'var(--font-label), sans-serif', fontWeight: 600, letterSpacing: '0.08em' } as const;
const MONO = { fontFamily: 'var(--font-mono), monospace' } as const;

/** Générateur pseudo-aléatoire à graine fixe (mulberry32) */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Marche aléatoire de `n` pas, de `start` vers `end`, d'amplitude `vol` */
function walk(seed: number, n: number, start: number, end: number, vol: number): number[] {
  const rand = seeded(seed);
  const values = [start];
  for (let i = 1; i < n; i++) values.push(values[i - 1] + (rand() - 0.5) * vol);
  // Pont : la courbe arrive exactement à `end`
  const drift = (end - values[n - 1]) / (n - 1);
  return values.map((v, i) => v + drift * i);
}

function polyline(values: number[], x0: number, x1: number, y0: number, y1: number, min: number, max: number) {
  return values
    .map((v, i) => {
      const x = x0 + (i / (values.length - 1)) * (x1 - x0);
      const y = y1 - ((v - min) / (max - min)) * (y1 - y0);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join('');
}

function Frame({
  title,
  caption,
  children,
  height = 300,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <figure className="my-10 rounded border border-line bg-ink-2 p-4 sm:p-5">
      <p className="label text-brass">{title}</p>
      <svg viewBox={`0 0 640 ${height}`} className="mt-3 block h-auto w-full" role="img" aria-label={caption ?? title}>
        {children}
      </svg>
      {caption && <figcaption className="mt-3 text-sm text-paper-dim">{caption}</figcaption>}
    </figure>
  );
}

function Text({
  x,
  y,
  children,
  color = DIM,
  size = 13,
  anchor = 'start',
  mono = false,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  color?: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
  mono?: boolean;
}) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} textAnchor={anchor} style={mono ? MONO : LABEL}>
      {children}
    </text>
  );
}

const num = (locale: Locale, value: number, decimals = 2) =>
  value.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

// ==========================================
// FOURCHETTE (carnet d'ordres)
// ==========================================

export function SpreadDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Le carnet d’ordres', sellers: 'VENDEURS · prix demandés', buyers: 'ACHETEURS · prix proposés', spread: 'fourchette', qty: 'titres', caption: 'Un achat au marché paie le meilleur prix demandé (100,10), une vente au marché reçoit le meilleur prix proposé (100,00) : l’écart de 0,10 est un coût caché.' },
    en: { title: 'The order book', sellers: 'SELLERS · asking prices', buyers: 'BUYERS · bid prices', spread: 'spread', qty: 'shares', caption: 'A market buy pays the best ask (100.10), a market sell receives the best bid (100.00): the 0.10 gap is a hidden cost.' },
  }[locale];
  const asks = [
    [100.3, 200],
    [100.2, 500],
    [100.1, 300],
  ];
  const bids = [
    [100.0, 400],
    [99.9, 600],
    [99.8, 250],
  ];
  const bar = (q: number) => (q / 600) * 300;

  return (
    <Frame title={t.title} caption={t.caption} height={310}>
      <Text x={20} y={24} color={LOSS} size={12}>{t.sellers}</Text>
      {asks.map(([price, qty], i) => (
        <g key={price}>
          <rect x={150} y={36 + i * 30} width={bar(qty)} height={22} fill={LOSS} opacity={0.25 + i * 0.2} />
          <Text x={130} y={52 + i * 30} anchor="end" color={PAPER} mono>{num(locale, price)}</Text>
          <Text x={158 + bar(qty)} y={52 + i * 30} color={DIM} size={12} mono>{qty} {t.qty}</Text>
        </g>
      ))}
      <rect x={20} y={128} width={600} height={34} fill={BRASS} opacity={0.12} />
      <Text x={320} y={150} anchor="middle" color={BRASS} size={13}>{`↕ ${t.spread} : ${num(locale, 0.1)}`}</Text>
      {bids.map(([price, qty], i) => (
        <g key={price}>
          <rect x={150} y={172 + i * 30} width={bar(qty)} height={22} fill={GAIN} opacity={0.65 - i * 0.2} />
          <Text x={130} y={188 + i * 30} anchor="end" color={PAPER} mono>{num(locale, price)}</Text>
          <Text x={158 + bar(qty)} y={188 + i * 30} color={DIM} size={12} mono>{qty} {t.qty}</Text>
        </g>
      ))}
      <Text x={20} y={282} color={GAIN} size={12}>{t.buyers}</Text>
    </Frame>
  );
}

// ==========================================
// PERTE ET GAIN NÉCESSAIRE
// ==========================================

export function LossRecoveryDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Perdre, puis remonter', loss: 'perte', gain: 'gain nécessaire pour revenir au départ', caption: 'Plus la perte est profonde, plus la remontée est longue : après −50 %, il faut doubler.' },
    en: { title: 'Losing, then climbing back', loss: 'loss', gain: 'gain needed to break even', caption: 'The deeper the loss, the longer the climb: after −50%, you need to double your money.' },
  }[locale];
  const pairs = [
    [10, 11],
    [20, 25],
    [33, 50],
    [50, 100],
    [80, 400],
  ];
  const zero = 200;
  const pct = (v: number) => `${v}${locale === 'fr' ? ' %' : '%'}`;

  return (
    <Frame title={t.title} caption={t.caption} height={300}>
      <line x1={20} x2={620} y1={zero} y2={zero} stroke={LINE} />
      {pairs.map(([loss, gain], i) => {
        const x = 50 + i * 115;
        // Même échelle pour la perte et le gain : 0,4 px par point de pourcentage
        const gainHeight = gain * 0.4;
        const lossHeight = loss * 0.4;
        return (
          <g key={loss}>
            <rect x={x} y={zero} width={36} height={lossHeight} fill={LOSS} opacity={0.8} />
            <rect x={x + 42} y={zero - gainHeight} width={36} height={gainHeight} fill={GAIN} opacity={0.8} />
            <Text x={x + 18} y={zero + lossHeight + 16} anchor="middle" color={LOSS} size={12} mono>−{pct(loss)}</Text>
            <Text x={x + 60} y={zero - gainHeight - 6} anchor="middle" color={GAIN} size={12} mono>+{pct(gain)}</Text>
          </g>
        );
      })}
      <rect x={20} y={278} width={10} height={10} fill={LOSS} />
      <Text x={36} y={287} size={11}>{t.loss}</Text>
      <rect x={110} y={278} width={10} height={10} fill={GAIN} />
      <Text x={126} y={287} size={11}>{t.gain}</Text>
    </Frame>
  );
}

// ==========================================
// DIVERSIFICATION
// ==========================================

export function DiversificationDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Une valeur seule, ou un panier', one: 'une seule action', basket: 'panier de 10 actions', caption: 'Même point d’arrivée, mais le panier traverse les mauvaises passes avec des creux bien moins profonds : les accidents propres à chaque entreprise se compensent en partie.' },
    en: { title: 'One stock, or a basket', one: 'a single stock', basket: 'basket of 10 stocks', caption: 'Same end point, but the basket goes through rough patches with much shallower dips: company-specific accidents partly offset each other.' },
  }[locale];
  const n = 120;
  const single = walk(7, n, 100, 118, 9);
  const paths = Array.from({ length: 10 }, (_, k) => walk(20 + k, n, 100, 118, 9));
  const basket = single.map((_, i) => paths.reduce((s, p) => s + p[i], 0) / paths.length);
  const all = [...single, ...basket];
  const min = Math.min(...all) - 4;
  const max = Math.max(...all) + 4;

  return (
    <Frame title={t.title} caption={t.caption}>
      {[0.25, 0.5, 0.75].map((r) => (
        <line key={r} x1={20} x2={620} y1={30 + r * 220} y2={30 + r * 220} stroke={LINE} strokeDasharray="2 4" />
      ))}
      <path d={polyline(single, 20, 620, 30, 250, min, max)} fill="none" stroke={DIM} strokeWidth={1.2} opacity={0.8} />
      <path d={polyline(basket, 20, 620, 30, 250, min, max)} fill="none" stroke={BRASS} strokeWidth={2.4} />
      <line x1={20} x2={44} y1={280} y2={280} stroke={DIM} strokeWidth={1.2} />
      <Text x={52} y={284} size={11}>{t.one}</Text>
      <line x1={220} x2={244} y1={280} y2={280} stroke={BRASS} strokeWidth={2.4} />
      <Text x={252} y={284} size={11}>{t.basket}</Text>
    </Frame>
  );
}

// ==========================================
// ACHAT ET VENTE À DÉCOUVERT : PROFILS DE GAIN
// ==========================================

export function ShortPayoffDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Acheter ou vendre à découvert', x: 'variation du cours', y: 'gain ou perte', long: 'achat : perte limitée à la mise', short: 'découvert : perte sans plafond', caption: 'L’acheteur perd au pire sa mise si le cours tombe à zéro. Le vendeur à découvert gagne au mieux 100 %, mais sa perte grandit sans limite si le cours monte.' },
    en: { title: 'Buying or selling short', x: 'price change', y: 'gain or loss', long: 'buy: loss capped at your stake', short: 'short: loss with no ceiling', caption: 'A buyer loses at worst their stake if the price falls to zero. A short seller gains at best 100%, but their loss grows without limit if the price rises.' },
  }[locale];
  // Axe x : variation de −100 % à +200 % ; axe y : de −200 % à +200 %
  const X = (v: number) => 60 + ((v + 100) / 300) * 540;
  const Y = (v: number) => 150 - (v / 200) * 120;
  const pct = (v: number) => `${v > 0 ? '+' : ''}${v}${locale === 'fr' ? ' %' : '%'}`;

  return (
    <Frame title={t.title} caption={t.caption}>
      <line x1={60} x2={600} y1={Y(0)} y2={Y(0)} stroke={LINE} />
      <line x1={X(0)} x2={X(0)} y1={20} y2={280} stroke={LINE} />
      {[-100, 0, 100, 200].map((v) => (
        <Text key={v} x={X(v)} y={292} anchor="middle" size={11} mono>{pct(v)}</Text>
      ))}
      <Text x={600} y={Y(0) - 8} anchor="end" size={11}>{t.x}</Text>
      <line x1={X(-100)} x2={X(200)} y1={Y(-100)} y2={Y(200)} stroke={GAIN} strokeWidth={2.4} />
      <line x1={X(-100)} x2={X(200)} y1={Y(100)} y2={Y(-200)} stroke={LOSS} strokeWidth={2.4} />
      <Text x={X(110)} y={Y(140)} color={GAIN} size={12}>{t.long}</Text>
      <Text x={X(110)} y={Y(-150)} color={LOSS} size={12}>{t.short}</Text>
    </Frame>
  );
}

// ==========================================
// FRAIS SUR 30 ANS
// ==========================================

export function FeesDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: '10 000 € sur 30 ans', a: 'rendement 7 % par an', b: 'le même, moins 1 % de frais', years: 'ans', caption: 'Un point de frais par an paraît indolore ; au bout de trente ans, il a coûté près d’un quart du capital final.' },
    en: { title: '10,000 over 30 years', a: '7% return per year', b: 'the same, minus 1% in fees', years: 'years', caption: 'One point of fees a year feels painless; after thirty years, it has cost nearly a quarter of the final capital.' },
  }[locale];
  const years = Array.from({ length: 31 }, (_, i) => i);
  const a = years.map((y) => 10000 * 1.07 ** y);
  const b = years.map((y) => 10000 * 1.06 ** y);
  const max = 80000;
  const money = (v: number) => Math.round(v).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US');

  return (
    <Frame title={t.title} caption={t.caption}>
      {[20000, 40000, 60000, 80000].map((v) => (
        <g key={v}>
          <line x1={70} x2={620} y1={250 - (v / max) * 220} y2={250 - (v / max) * 220} stroke={LINE} strokeDasharray="2 4" />
          <Text x={62} y={254 - (v / max) * 220} anchor="end" size={10} mono>{money(v)}</Text>
        </g>
      ))}
      <path d={polyline(a, 70, 600, 30, 250, 0, max)} fill="none" stroke={BRASS} strokeWidth={2.4} />
      <path d={polyline(b, 70, 600, 30, 250, 0, max)} fill="none" stroke={DIM} strokeWidth={2} strokeDasharray="6 4" />
      <Text x={604} y={250 - (a[30] / max) * 220} color={BRASS} size={12} mono anchor="end">{money(a[30])}</Text>
      <Text x={604} y={268 - (b[30] / max) * 220} color={DIM} size={12} mono anchor="end">{money(b[30])}</Text>
      <Text x={70} y={272} size={10} mono>0</Text>
      <Text x={600} y={272} size={10} anchor="end" mono>{`30 ${t.years}`}</Text>
      <line x1={70} x2={94} y1={290} y2={290} stroke={BRASS} strokeWidth={2.4} />
      <Text x={100} y={294} size={11}>{t.a}</Text>
      <line x1={330} x2={354} y1={290} y2={290} stroke={DIM} strokeWidth={2} strokeDasharray="6 4" />
      <Text x={360} y={294} size={11}>{t.b}</Text>
    </Frame>
  );
}

// ==========================================
// LATENCES (échelle logarithmique)
// ==========================================

export function LatencyDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Des secondes aux microsecondes', caption: 'Échelle logarithmique : chaque graduation divise le temps par dix. Un algorithme en colocation réagit environ 40 000 fois plus vite qu’un humain.', rows: ['Réaction d’un humain', 'Internet d’un particulier', 'Chicago – New York (micro-ondes)', 'Algorithme en colocation'] },
    en: { title: 'From seconds to microseconds', caption: 'Logarithmic scale: each tick divides time by ten. A co-located algorithm reacts about 40,000 times faster than a human.', rows: ['Human reaction', 'Retail internet connection', 'Chicago – New York (microwave)', 'Co-located algorithm'] },
  }[locale];
  // Durées en microsecondes
  const values = [200_000, 30_000, 8_000, 5];
  const labels = ['0,2 s', '30 ms', '8 ms', '5 µs'].map((l) => (locale === 'fr' ? l : l.replace(',', '.')));
  const X = (us: number) => 250 + (Math.log10(us) / 6) * 360;

  return (
    <Frame title={t.title} caption={t.caption} height={250}>
      {[1, 10, 100, 1_000, 10_000, 100_000, 1_000_000].map((v) => (
        <line key={v} x1={X(v)} x2={X(v)} y1={20} y2={210} stroke={LINE} strokeDasharray="2 4" />
      ))}
      {values.map((v, i) => (
        <g key={i}>
          <Text x={240} y={52 + i * 46} anchor="end" color={PAPER} size={12}>{t.rows[i]}</Text>
          <rect x={250} y={38 + i * 46} width={Math.max(X(v) - 250, 3)} height={20} fill={i === 3 ? BRASS : DIM} opacity={i === 3 ? 0.9 : 0.5} />
          <Text x={X(v) + 8} y={53 + i * 46} size={12} mono color={i === 3 ? BRASS : DIM}>{labels[i]}</Text>
        </g>
      ))}
      {['1 µs', '1 ms', '1 s'].map((l, k) => (
        <Text key={l} x={X([1, 1_000, 1_000_000][k])} y={232} anchor="middle" size={10} mono>{l}</Text>
      ))}
    </Frame>
  );
}

// ==========================================
// TENUE DE MARCHÉ
// ==========================================

export function MarketMakingDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Le teneur de marché', seller: 'Vendeur', maker: 'Teneur de marché', buyer: 'Acheteur', buys: 'achète à 99,90', sells: 'revend à 100,00', earns: 'gagne 0,10 par aller-retour', caption: 'Le teneur de marché est toujours prêt à acheter et à vendre. Il vit de l’écart, multiplié par des millions d’échanges, et risque de garder des titres juste avant une baisse.' },
    en: { title: 'The market maker', seller: 'Seller', maker: 'Market maker', buyer: 'Buyer', buys: 'buys at 99.90', sells: 'resells at 100.00', earns: 'earns 0.10 per round trip', caption: 'The market maker is always ready to buy and sell. It lives off the spread, multiplied by millions of trades, and risks holding shares just before a fall.' },
  }[locale];

  return (
    <Frame title={t.title} caption={t.caption} height={200}>
      {[
        { x: 20, label: t.seller, color: DIM },
        { x: 240, label: t.maker, color: BRASS },
        { x: 460, label: t.buyer, color: DIM },
      ].map((box) => (
        <g key={box.label}>
          <rect x={box.x} y={60} width={160} height={60} rx={4} fill="none" stroke={box.color} strokeWidth={1.4} />
          <Text x={box.x + 80} y={96} anchor="middle" color={box.color === BRASS ? BRASS : PAPER} size={14}>{box.label}</Text>
        </g>
      ))}
      <line x1={184} x2={234} y1={90} y2={90} stroke={GAIN} strokeWidth={2} />
      <line x1={404} x2={454} y1={90} y2={90} stroke={GAIN} strokeWidth={2} />
      <path d="M448 84 L456 90 L448 96" fill="none" stroke={GAIN} strokeWidth={2} />
      <path d="M228 84 L236 90 L228 96" fill="none" stroke={GAIN} strokeWidth={2} />
      <Text x={209} y={50} anchor="middle" size={12} mono>{t.buys}</Text>
      <Text x={429} y={50} anchor="middle" size={12} mono>{t.sells}</Text>
      <Text x={320} y={160} anchor="middle" color={BRASS} size={13}>{t.earns}</Text>
    </Frame>
  );
}

// ==========================================
// ETF : UN PANIER EN UNE PART
// ==========================================

export function EtfDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Ce que contient une part d’ETF', share: '1 part d’ETF', note: 'un peu de chacune, dans les mêmes proportions que l’indice', caption: 'Acheter une part d’un ETF qui suit un indice revient à acheter d’un coup un morceau de chaque entreprise de l’indice.' },
    en: { title: 'What one ETF share holds', share: '1 ETF share', note: 'a little of each, in the same proportions as the index', caption: 'Buying one share of an ETF that tracks an index means buying, in one go, a slice of every company in that index.' },
  }[locale];
  const companies = [
    ['A', 24],
    ['B', 19],
    ['C', 16],
    ['D', 14],
    ['E', 11],
    ['F', 9],
    ['G', 7],
  ] as const;
  let y = 20;

  return (
    <Frame title={t.title} caption={t.caption} height={270}>
      {companies.map(([name, weight]) => {
        // Hauteur minimale pour que le libellé reste lisible
        const h = 17 + weight * 1.2;
        const row = (
          <g key={name}>
            <rect x={40} y={y} width={180} height={h - 3} fill={BRASS} opacity={0.15 + weight / 40} />
            <Text x={50} y={y + h / 2 + 3} color={PAPER} size={11}>{`${locale === 'fr' ? 'Entreprise' : 'Company'} ${name}`}</Text>
            <Text x={212} y={y + h / 2 + 3} anchor="end" size={11} mono color={PAPER}>{`${weight}${locale === 'fr' ? ' %' : '%'}`}</Text>
          </g>
        );
        y += h;
        return row;
      })}
      <path d="M240 136 L330 136" stroke={BRASS} strokeWidth={2} />
      <path d="M322 129 L332 136 L322 143" fill="none" stroke={BRASS} strokeWidth={2} />
      <rect x={350} y={96} width={250} height={80} rx={4} fill="none" stroke={BRASS} strokeWidth={1.6} />
      <Text x={475} y={129} anchor="middle" color={BRASS} size={16}>{t.share}</Text>
      <foreignObject x={360} y={139} width={230} height={40}>
        <p style={{ color: DIM, fontSize: 11, textAlign: 'center', lineHeight: 1.3 }}>{t.note}</p>
      </foreignObject>
    </Frame>
  );
}

// ==========================================
// VOLATILITÉ
// ==========================================

export function VolatilityDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Même rendement, volatilité différente', calm: 'volatilité faible', wild: 'volatilité forte', caption: 'Les deux valeurs gagnent 10 % sur la période. La plus volatile fait passer par des creux de −20 % : il faut avoir les nerfs, et ne pas être obligé de vendre au mauvais moment.' },
    en: { title: 'Same return, different volatility', calm: 'low volatility', wild: 'high volatility', caption: 'Both securities gain 10% over the period. The more volatile one goes through −20% dips: you need strong nerves, and must not be forced to sell at the wrong time.' },
  }[locale];
  const calm = walk(3, 150, 100, 110, 1.6);
  const wild = walk(11, 150, 100, 110, 7);
  const all = [...calm, ...wild];
  const min = Math.min(...all) - 3;
  const max = Math.max(...all) + 3;

  return (
    <Frame title={t.title} caption={t.caption}>
      <path d={polyline(wild, 20, 620, 30, 250, min, max)} fill="none" stroke={LOSS} strokeWidth={1.4} opacity={0.85} />
      <path d={polyline(calm, 20, 620, 30, 250, min, max)} fill="none" stroke={GAIN} strokeWidth={2.4} />
      <line x1={20} x2={44} y1={280} y2={280} stroke={GAIN} strokeWidth={2.4} />
      <Text x={52} y={284} size={11}>{t.calm}</Text>
      <line x1={220} x2={244} y1={280} y2={280} stroke={LOSS} strokeWidth={1.4} />
      <Text x={252} y={284} size={11}>{t.wild}</Text>
    </Frame>
  );
}

// ==========================================
// INDICE : UNE MOYENNE PONDÉRÉE
// ==========================================

export function IndexDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Comment un indice bouge', weight: 'poids', change: 'variation du jour', index: 'Indice', caption: 'Chaque valeur pèse selon sa capitalisation. Une baisse de 3 % d’un poids lourd compte plus qu’une hausse de 5 % d’une petite valeur.' },
    en: { title: 'How an index moves', weight: 'weight', change: 'day’s change', index: 'Index', caption: 'Each stock counts according to its market value. A 3% fall in a heavyweight matters more than a 5% rise in a small stock.' },
  }[locale];
  const rows = [
    { name: 'A', weight: 40, change: -3 },
    { name: 'B', weight: 25, change: 1 },
    { name: 'C', weight: 20, change: 2 },
    { name: 'D', weight: 15, change: 5 },
  ];
  const total = rows.reduce((s, r) => s + (r.weight * r.change) / 100, 0);
  const pct = (v: number) => `${v > 0 ? '+' : ''}${num(locale, v, 1)}${locale === 'fr' ? ' %' : '%'}`;

  return (
    <Frame title={t.title} caption={t.caption} height={250}>
      <Text x={150} y={24} size={11}>{t.weight}</Text>
      <Text x={470} y={24} size={11} anchor="middle">{t.change}</Text>
      {rows.map((row, i) => (
        <g key={row.name}>
          <Text x={40} y={56 + i * 40} color={PAPER} size={13}>{`${locale === 'fr' ? 'Valeur' : 'Stock'} ${row.name}`}</Text>
          <rect x={150} y={42 + i * 40} width={row.weight * 4} height={20} fill={BRASS} opacity={0.5} />
          <Text x={156 + row.weight * 4} y={57 + i * 40} size={11} mono>{`${row.weight}${locale === 'fr' ? ' %' : '%'}`}</Text>
          <Text x={470} y={57 + i * 40} anchor="middle" mono size={13} color={row.change >= 0 ? GAIN : LOSS}>{pct(row.change)}</Text>
        </g>
      ))}
      <line x1={40} x2={600} y1={205} y2={205} stroke={LINE} />
      <Text x={40} y={232} color={BRASS} size={14}>{t.index}</Text>
      <Text x={470} y={232} anchor="middle" mono size={15} color={total >= 0 ? GAIN : LOSS}>{pct(total)}</Text>
    </Frame>
  );
}

// ==========================================
// LE CHANGE
// ==========================================

export function FxDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Une action américaine vue d’Europe', usd: 'cours en dollars', eur: 'valeur en euros', rate: 'l’euro passe de 1,05 à 1,15 $', caption: 'L’action ne bouge pas à New York, mais l’euro se renforce : pour un investisseur en euros, elle perd près de 9 %.' },
    en: { title: 'A US stock seen from Europe', usd: 'price in dollars', eur: 'value in euros', rate: 'the euro rises from 1.05 to 1.15 $', caption: 'The stock does not move in New York, but the euro strengthens: for a euro-based investor, it loses nearly 9%.' },
  }[locale];
  const n = 60;
  const usd = Array.from({ length: n }, () => 100);
  const rate = Array.from({ length: n }, (_, i) => 1.05 + (0.1 * i) / (n - 1));
  const eur = usd.map((v, i) => v / rate[i]);

  return (
    <Frame title={t.title} caption={t.caption} height={260}>
      <path d={polyline(usd, 40, 600, 30, 210, 80, 105)} fill="none" stroke={DIM} strokeWidth={2} strokeDasharray="6 4" />
      <path d={polyline(eur, 40, 600, 30, 210, 80, 105)} fill="none" stroke={BRASS} strokeWidth={2.4} />
      <Text x={604} y={46} anchor="end" size={12} mono color={DIM}>100 $</Text>
      <Text x={604} y={210 - ((eur[n - 1] - 80) / 25) * 180 + 18} anchor="end" size={12} mono color={BRASS}>{`${num(locale, eur[n - 1], 1)} €`}</Text>
      <Text x={40} y={210 - ((eur[0] - 80) / 25) * 180 + 18} size={12} mono color={BRASS}>{`${num(locale, eur[0], 1)} €`}</Text>
      <Text x={320} y={238} anchor="middle" size={12}>{t.rate}</Text>
      <line x1={40} x2={64} y1={252} y2={252} stroke={DIM} strokeWidth={2} strokeDasharray="6 4" />
      <Text x={70} y={256} size={11}>{t.usd}</Text>
      <line x1={420} x2={444} y1={252} y2={252} stroke={BRASS} strokeWidth={2.4} />
      <Text x={450} y={256} size={11}>{t.eur}</Text>
    </Frame>
  );
}

// ==========================================
// LES GRANDS KRACHS
// ==========================================

export function CrashesDiagram({ locale }: { locale: Locale }) {
  const t = {
    fr: { title: 'Les grands krachs : la chute, du sommet au creux', caption: 'Indices de référence, du plus haut au plus bas de chaque crise. 1987 : la chute s’est concentrée en une seule journée.', rows: [['1929', 'Dow Jones, 1929-1932', 89], ['1987', 'Dow Jones, lundi 19 octobre', 23], ['2000', 'Nasdaq, 2000-2002', 78], ['2008', 'S&P 500, 2007-2009', 57], ['2020', 'S&P 500, février-mars', 34]] },
    en: { title: 'The great crashes: from peak to trough', caption: 'Benchmark indices, from the peak to the trough of each crisis. 1987: the fall was concentrated in a single day.', rows: [['1929', 'Dow Jones, 1929-1932', 89], ['1987', 'Dow Jones, Monday 19 October', 23], ['2000', 'Nasdaq, 2000-2002', 78], ['2008', 'S&P 500, 2007-2009', 57], ['2020', 'S&P 500, February-March', 34]] },
  }[locale];

  return (
    <Frame title={t.title} caption={t.caption} height={270}>
      {t.rows.map(([year, label, drop], i) => (
        <g key={year as string}>
          <Text x={20} y={46 + i * 46} color={BRASS} size={18} mono>{year}</Text>
          <Text x={90} y={34 + i * 46} size={11}>{label}</Text>
          <rect x={90} y={40 + i * 46} width={(Number(drop) / 100) * 440} height={14} fill={LOSS} opacity={0.75} />
          <Text x={98 + (Number(drop) / 100) * 440} y={52 + i * 46} size={12} mono color={LOSS}>{`−${drop}${locale === 'fr' ? ' %' : '%'}`}</Text>
        </g>
      ))}
    </Frame>
  );
}
