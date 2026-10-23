/**
 * LA GAZETTE - The great stock market crashes, from 1720 to 2020 (English)
 */

import { CrashesDiagram } from '@/components/mag/diagrams';
import { ArchiveFigure } from '@/components/mag/figures';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('en').mag;
const SIGNUP = localizePath('en', '/signup');

export const toc: TocEntry[] = [
  { id: 'bubbles', title: '1720: the first bubbles' },
  { id: 'nineteenth-century', title: 'Gold and 19th-century panics' },
  { id: '1929', title: '1929: the great crash' },
  { id: '1987', title: '1987: Black Monday' },
  { id: '2000', title: '2000: the dot-com bubble' },
  { id: '2008', title: '2008: the financial crisis' },
  { id: '2020', title: '2020: the flash crash' },
  { id: 'recovery', title: 'How long to recover' },
  { id: 'lessons', title: 'What crashes teach us' },
];

export default function Article() {
  return (
    <>
      <P>
        A crash is a sudden, widespread fall in prices, often of more than 20% in a few days or weeks. Each has its
        own causes, but almost all follow the same script: a seductive story, borrowed money to cash in on it,
        prices drifting away from reality, then a trigger, and fear spreading faster than information.
      </P>
      <Definition term="Crash">
        A sudden collapse of prices across a whole market. A market is called a “bear market” when an index has
        lost more than 20% from its peak.
      </Definition>

      <H2 id="bubbles">1720: the first bubbles</H2>
      <P>
        In Paris, the Scotsman John Law persuades the Regent to create a bank that issues paper money, and a company
        to trade with Louisiana, the Mississippi Company. Its shares, payable in the bank’s notes, rise from about
        500 livres to nearly 10,000 livres in 1719. On the rue Quincampoix, people fight over them. In early 1720,
        the shrewdest convert their gains into gold; confidence turns, prices collapse, and Law flees France by the
        end of the year.
      </P>
      <ArchiveFigure
        name="bulle-mississippi-1720"
        locale="en"
        layout="side"
        alt="Dutch engraving: a chariot drawn by roosters, below a tower from which wind is blown, surrounded by speculators"
        caption="“The inventor of the wind trade on his triumphal chariot”: a 1720 Dutch satire of John Law and the share mania."
      />
      <P>
        The same year in London, the South Sea Company promises fabulous profits from trade with Spanish America.
        Its share rises from about £130 in January to nearly £1,000 in the summer, before falling back towards £150
        in the autumn. According to tradition, Isaac Newton himself lost a fortune. The engraver William Hogarth
        drew the plate that illustrates this article: a merry-go-round of dupes, while Honesty is broken on the
        wheel.
      </P>

      <H2 id="nineteenth-century">Gold and 19th-century panics</H2>
      <P>
        On 24 September 1869, two New York speculators, Jay Gould and James Fisk, try to corner all the available
        gold to drive its price up. When the US government decides to sell its reserves, the gold price collapses
        within minutes: Wall Street’s first “Black Friday”, which ruins many brokerage houses.
      </P>
      <ArchiveFigure
        name="chute-or-1869"
        locale="en"
        alt="Engraving by Thomas Nast: Wall Street in ruins before Trinity Church, with a sign reading “closed for repairs”"
        caption="“What a fall was there, my countrymen!”: Thomas Nast draws Wall Street in ruins after the Black Friday of 1869."
      />
      <P>
        In October 1907, a failed attempt to corner the shares of a copper company triggers a run on New York’s
        banks. With no central bank, it is the banker John Pierpont Morgan who gathers his peers to put out the
        fire. The shock is so great that the United States creates the Federal Reserve six years later.
      </P>
      <ArchiveFigure
        name="panique-1907"
        locale="en"
        alt="Photograph of a crowd packed into Wall Street before the Sub-Treasury, October 1907"
        caption="Wall Street during the panic of October 1907. Savers queue to withdraw their money."
      />

      <H2 id="1929">1929: the great crash</H2>
      <P>
        The 1920s are euphoric. People buy shares on credit, sometimes putting up only 10% of the price. The Dow
        Jones rises sixfold in eight years and reaches 381 points on 3 September 1929. On Thursday 24 October,
        panic breaks out; on Monday the 28th, the index loses nearly 13%, on Tuesday the 29th, almost 12% more.
        Buyers on credit, called on to repay, have to sell at any price.
      </P>
      <P>
        The worst is yet to come. Bank failures, collapsing world trade, mass unemployment: the Dow Jones hits 41
        points in July 1932, a fall of 89% from the peak.
      </P>
      <KeyFigure value="25 years">
        The time it took the Dow Jones to regain its 1929 peak, in November 1954 (excluding dividends).
      </KeyFigure>

      <H2 id="1987">1987: Black Monday</H2>
      <P>
        On Monday 19 October 1987, the Dow Jones loses 22.6% in a single session, the worst day in its history.
        There was no spectacular bankruptcy that day. The causes: expensive markets, rising rates, and “portfolio
        insurance” computer programs that sold automatically as prices fell, speeding up the slide. After this
        crash, exchanges introduced circuit breakers, which halt trading when prices fall too fast.
      </P>

      <H2 id="2000">2000: the dot-com bubble</H2>
      <P>
        In the late 1990s, anything to do with the internet sells like hot cakes, even companies with no profit or
        revenue. The Nasdaq, the tech-heavy exchange, peaks at 5,048 points on 10 March 2000, then loses 78% in two
        and a half years. Many stars of the day disappear; a few survive and become giants. The Nasdaq only regains
        its peak in 2015.
      </P>

      <H2 id="2008">2008: the financial crisis</H2>
      <P>
        In the United States, millions of mortgages were granted to fragile households, then sliced up and sold
        worldwide as complex securities. When house prices fall, nobody knows who holds the losses any more. On 15
        September 2008, Lehman Brothers goes bankrupt; banks stop lending to each other. The S&amp;P 500 loses 57%
        between October 2007 and March 2009.
      </P>

      <H2 id="2020">2020: the flash crash</H2>
      <P>
        In February 2020, the Covid-19 epidemic reaches Europe and the United States. The S&amp;P 500 loses 34% in
        just over a month, the fastest fall in its history, and circuit breakers trip four times in March. Then
        central banks and governments step in massively: the index is back at its peak by August. Those who sold at
        the bottom locked in their losses.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Live through a crisis from the inside, session after session, without ever knowing what tomorrow holds.
      </InlineCta>

      <H2 id="recovery">How long to recover</H2>
      <CrashesDiagram locale="en" />
      <Table
        head={['Crash', 'Fall from peak to trough', 'Back to the peak']}
        rows={[
          ['1929 (Dow Jones)', '−89%', 'about 25 years'],
          ['1987 (Dow Jones)', '−23% in one day', 'about 2 years'],
          ['2000 (Nasdaq)', '−78%', 'about 15 years'],
          ['2008 (S&P 500)', '−57%', 'about 5½ years'],
          ['2020 (S&P 500)', '−34%', 'about 6 months'],
        ]}
      />
      <P>
        These durations are based on price indices, without{' '}
        <MagLink id="dividende" locale="en">
          dividends
        </MagLink>
        . With dividends reinvested, recovery is shorter, but the gap between cases remains huge: a few months, or a
        generation.
      </P>

      <H2 id="lessons">What crashes teach us</H2>
      <List>
        <li>
          <Em>They come back.</Em> No era has been spared; the question is not “if” but “when”.
        </li>
        <li>
          <Em>Credit makes them worse.</Em> In 1720, 1929 or 2008, borrowed money is what turns a fall into a
          disaster, because it forces people to sell at the worst moment.
        </li>
        <li>
          <Em>Diversification limits the damage.</Em> Those who had bet everything on internet stocks in 2000 waited
          fifteen years; a spread-out portfolio recovered much faster.
        </li>
        <li>
          <Em>Selling in a panic is costly.</Em> The best sessions often come right after the worst. Missing them is
          enough to damage a performance for good.
        </li>
        <li>
          <Em>Volatility is part of the journey.</Em> Better to know in advance how much{' '}
          <MagLink id="volatilite" locale="en">
            volatility
          </MagLink>{' '}
          you can stand than to find out in the middle of the storm.
        </li>
      </List>
      <P>
        If you think prices will fall, there is also{' '}
        <MagLink id="vente-a-decouvert" locale="en">
          short selling
        </MagLink>
        , a powerful but dangerous tool. The game’s <Em>The bank run</Em> scenario drops you into a recent banking
        panic: a good way to test your reflexes.
      </P>
    </>
  );
}
