/**
 * THE GAZETTE - Micro-trading algorithms, explained simply (English)
 */

import { ArchiveFigure } from '@/components/mag/figures';
import { LatencyDiagram, MarketMakingDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, H3, InlineCta, KeyFigure, List, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('en').mag;
const SIGNUP = localizePath('en', '/signup');

export const toc: TocEntry[] = [
  { id: 'definition', title: 'What are we talking about?' },
  { id: 'latency', title: 'The race to the microsecond' },
  { id: 'strategies', title: 'The main families of strategies' },
  { id: 'effects', title: 'What they change for everyone else' },
  { id: 'at-home', title: 'And at home?' },
  { id: 'lessons', title: 'What a player can take away' },
];

export default function Article() {
  return (
    <>
      <P>
        Micro-trading refers to strategies that place a huge number of orders, over very short periods, to earn
        a tiny amount each time. These orders are decided and sent by algorithms, in a few microseconds, without
        human intervention. In the United States, this high-frequency trading is estimated to account for around
        half of stock trading volume.
      </P>

      <ArchiveFigure
        name="courtier-telescripteur-1894"
        locale="en" layout="side"
        alt="A man in a top hat reads the tape of a stock ticker"
        caption="In 1894, a broker reads prices off a ticker tape. The information arrived several minutes late."
      />

      <H2 id="definition">What are we talking about?</H2>
      <P>The term covers several things that are worth telling apart.</P>
      <List>
        <li>
          <Em>Algorithmic trading</Em>: any order decided or executed by a program. A fund that automatically
          splits a large order into small pieces counts, even if it holds the shares for years.
        </li>
        <li>
          <Em>High-frequency trading</Em> (HFT): an extreme form of the former, where speed is the main edge.
          Positions last from a few milliseconds to a few minutes, and are almost always closed before the end of
          the day.
        </li>
        <li>
          <Em>Scalping</Em>: the “human” version of the idea, taking very small, repeated gains. Done by
          individuals, it works on the scale of seconds or minutes, not microseconds.
        </li>
      </List>
      <Definition term="Microsecond">
        One millionth of a second. A blink of an eye lasts about 100,000 microseconds: enough time for a fast
        algorithm to react thousands of times.
      </Definition>

      <H2 id="latency">The race to the microsecond</H2>
      <P>
        For these strategies, getting there first is everything. The delay between the moment information appears
        and the moment the order reaches the exchange is called <Em>latency</Em>, and trading firms spend fortunes
        to reduce it.
      </P>
      <H3>Co-location</H3>
      <P>
        Exchanges rent out space in their own data centres, a few metres from the computers that match orders.
        Every metre of cable counts: light travels about 20 centimetres per nanosecond in optical fibre. Serious
        operators even equalise cable lengths between clients, so that nobody gains an edge from where they sit
        in the room.
      </P>
      <H3>Links between markets</H3>
      <P>
        In 2010, a company dug an almost straight fibre-optic line between Chicago, where futures are traded, and
        the New York area, where stocks are traded. Estimated cost: around 300 million dollars, to shave a few
        milliseconds off the round trip, down to about 13. A few years later, networks of microwave towers beat
        it: in air, signals travel about half as fast again as light in glass, and the round trip dropped to
        around 8 milliseconds.
      </P>
      <Table
        head={['Delay', 'Order of magnitude']}
        rows={[
          ['Human reaction', '200,000 µs (0.2 s)'],
          ['Retail internet connection to an exchange', '10,000 to 50,000 µs'],
          ['Chicago – New York round trip by microwave', 'about 8,000 µs'],
          ['Decision by a co-located algorithm', 'a few µs'],
        ]}
      />

      <LatencyDiagram locale="en" />
      <P>
        To go even lower, the fastest algorithms no longer run on ordinary processors, but on programmable chips
        (FPGAs) that react directly to the data arriving from the network.
      </P>

      <ArchiveFigure
        name="telescripteur-edison"
        locale="en" layout="side"
        alt="Edison stock ticker under a glass dome"
        caption="The stock ticker improved by Thomas Edison around 1870: the first machine to broadcast prices at a distance."
      />

      <H2 id="strategies">The main families of strategies</H2>
      <H3>Market making</H3>
      <P>
        This is the most common strategy. The market maker constantly displays a buying price and a slightly
        higher selling price. Every time a buyer and a seller go through it, it pockets the gap, the spread: often
        a fraction of a cent per share, multiplied by millions of trades. Its main risk: piling up shares just
        before the price falls, against someone better informed.
      </P>
      <H3>Statistical arbitrage</H3>
      <P>
        Some assets usually move together: two large companies in the same sector, an index and its components,
        an exchange-traded fund and its basket. When the gap between them strays from its usual level, the
        algorithm sells the more expensive one, buys the cheaper one, and waits for the gap to close. The bet is
        not risk-free: a gap can also reflect a real change.
      </P>
      <H3>Latency arbitrage</H3>
      <P>
        The same stock trades on several platforms. When its price moves on one, the others take a few
        microseconds to follow. The fastest algorithm can buy where the price has not yet risen, just before it
        does. This is the most controversial strategy, because it profits from a technical delay rather than from
        analysis.
      </P>
      <H3>Very short-term momentum and news reading</H3>
      <P>
        Other programs spot imbalances in the order book, or analyse newswires and official releases in a few
        microseconds, to position themselves in the direction of the move that is starting.
      </P>
      <H3>Algorithmic execution</H3>
      <P>
        This is not high-frequency trading, but it is a close cousin. A fund that needs to buy millions of shares
        cannot do it in one go without pushing the price up against itself. Its algorithms therefore split the
        order: in equal slices over time (<Em>TWAP</Em>, time-weighted average price) or following the day’s usual
        volumes (<Em>VWAP</Em>, volume-weighted average price).
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Write your own rules, and test them session after session on real prices.
      </InlineCta>

      <MarketMakingDiagram locale="en" />

      <H2 id="effects">What these algorithms change for everyone else</H2>
      <P>
        The verdict is mixed. On the one hand, competition between electronic market makers has sharply narrowed
        spreads on large stocks: buying or selling costs far less than in the days of open-outcry trading floors.
        On the other, this liquidity can vanish all at once, just when it is needed most.
      </P>
      <KeyFigure value="6 May 2010">
        The “flash crash”: within minutes, the Dow Jones loses nearly 1,000 points, about 9%, before recovering
        almost immediately. Some stocks briefly trade at one cent.
      </KeyFigure>
      <P>
        The report by US authorities identified a trigger: a very large sell order of S&amp;P 500 futures, about
        4 billion dollars, handed to an execution algorithm that sold regardless of price. High-frequency
        algorithms first absorbed these sales, then traded the contracts back and forth among themselves, before
        pulling out en masse. In 2016, a British trader also pleaded guilty to manipulation by{' '}
        <Em>spoofing</Em> (placing orders with no intention of executing them), a practice accused of making the
        fall worse.
      </P>
      <P>
        An algorithm can also go wrong on its own. On 1 August 2012, badly deployed software at Knight Capital, one
        of the largest US market makers, sent millions of unintended orders: about 440 million dollars lost in
        45 minutes. The firm had to be taken over.
      </P>
      <P>
        Rules have tightened since. In Europe, the MiFID II directive has required high-frequency traders since 2018
        to be authorised, to test their algorithms, to be able to switch them off instantly and to keep records of
        their orders. Exchanges automatically halt trading in a stock whose price runs out of control.
      </P>

      <ArchiveFigure
        name="activite-wall-street-1908"
        locale="en"
        alt="Engraving of an agitated crowd of brokers on Wall Street"
        caption="“Great activity in Wall Street”, 1908. A century later, the same frenzy plays out silently, inside data centres."
      />

      <H2 id="at-home">Can you do micro-trading at home?</H2>
      <P>
        Not in the true sense. An individual starts with a delay of several tens of milliseconds, thousands of
        times more than co-located players: at that scale, they always arrive after everyone else. Three more
        obstacles stand in the way:
      </P>
      <List>
        <li>
          <Em>Fees</Em>: an average gain of a fraction of a cent per share never covers retail brokerage fees.
        </li>
        <li>
          <Em>Data</Em>: complete, fast market data feeds are expensive, and free data arrives late.
        </li>
        <li>
          <Em>Overfitting</Em>: a strategy tested on the past can look miraculous simply because it was tuned,
          unknowingly, to the random quirks of that particular period.
        </li>
      </List>
      <P>Platforms promising winning “trading robots” to install at home therefore deserve the utmost suspicion.</P>

      <H2 id="lessons">What a player can take away</H2>
      <P>
        Without aiming for the microsecond, algorithmic trading firms practise a discipline that any investor can
        learn from.
      </P>
      <List ordered>
        <li>Rules written in advance: when to enter, when to exit, how much to commit.</li>
        <li>A loss limit per position and per day, respected without exception.</li>
        <li>Testing the rules on historical data, while distrusting results that look too good.</li>
        <li>Tracking costs: fees and spreads often turn a gain into a loss.</li>
        <li>An order journal, reread with a cool head to understand what worked, and what did not.</li>
      </List>
      <P>
        This is exactly what a simulator on historical prices is for. In FinanceQuest, you apply your rules one
        session at a time, without knowing what comes next, and see what they produce on the real market of the
        time, fees included.
      </P>
    </>
  );
}
