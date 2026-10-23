/**
 * THE GAZETTE - What to know before you start trading (English)
 */

import { ArchiveFigure } from '@/components/mag/figures';
import { DiversificationDiagram, FeesDiagram, LossRecoveryDiagram, ShortPayoffDiagram, SpreadDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, List, P } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('en').mag;
const SIGNUP = localizePath('en', '/signup');

export const toc: TocEntry[] = [
  { id: 'trading-investing', title: 'Trading, investing, speculating' },
  { id: 'price', title: 'What a price really is' },
  { id: 'risk-return', title: 'Risk and return' },
  { id: 'diversification', title: 'Diversification' },
  { id: 'fees', title: 'Fees' },
  { id: 'short-selling', title: 'Short selling' },
  { id: 'leverage', title: 'Leverage' },
  { id: 'biases', title: 'Psychological biases' },
  { id: 'practice', title: 'Practise first' },
];

export default function Article() {
  return (
    <>
      <P>
        Trading means buying and selling financial assets (stocks, indices, commodities, currencies,
        cryptocurrencies) in the hope of profiting from their price changes. The idea is simple; the practice is
        much less so. Before your first order, you need to understand what a price is, how risk always comes with
        return, what fees really cost, and why your own brain is often your worst adviser.
      </P>

      <ArchiveFigure
        name="bourse-paris-xixe"
        locale="en"
        alt="The Paris stock exchange palace, 19th-century engraving"
        caption="The Palais Brongniart, home of the Paris stock exchange from 1826 to 1987, where prices were shouted around the trading ring."
      />

      <H2 id="trading-investing">Trading, investing, speculating: three different things</H2>
      <P>
        The three words are often used interchangeably. Yet they describe distinct approaches, which require
        neither the same time nor the same temperament.
      </P>
      <List>
        <li>
          <Em>Investing</Em> means buying a share of a company, a bond or an index to hold for years, relying on
          growing profits, dividends or interest.
        </li>
        <li>
          <Em>Trading</Em> means acting over shorter periods, from a few minutes to a few weeks, to take advantage
          of price movements rather than long-term value.
        </li>
        <li>
          <Em>Speculating</Em> means betting on a specific price move, often with concentrated positions or
          leverage. Every trade involves some speculation.
        </li>
      </List>
      <P>
        The difference matters, because the rules change with the time horizon. Over ten years, a stock usually
        follows the health of the company. Over a single day, its price depends mostly on market mood, news and
        chance.
      </P>

      <H2 id="price">What a price really is</H2>
      <P>
        A price is not the “value” of a company. It is the price at which the last trade took place between a
        buyer and a seller. At any moment, the order book shows two prices: the best price offered by buyers, and
        the best price asked by sellers.
      </P>
      <Definition term="Bid-ask spread">
        The gap between the best price buyers offer and the best price sellers ask. It is a hidden cost: buying
        and selling straight away loses this gap.
      </Definition>
      <P>
        Two order types are enough to get started. A <Em>market order</Em> executes immediately, at the best
        available price, whatever it is. A <Em>limit order</Em> sets a maximum price when buying, or a minimum when
        selling: it protects you from a bad price, but may never be filled.
      </P>
      <P>
        In FinanceQuest, orders fill at the session’s <Em>closing price</Em>, the last price of the day. It is the
        reference price used by newspapers, indices and funds.
      </P>

      <SpreadDiagram locale="en" />

      <H2 id="risk-return">Return never comes without risk</H2>
      <P>
        This is the most important rule in finance: a higher expected return is always paid for with higher risk.
        An investment that promises a lot with no risk is almost always a scam.
      </P>
      <Definition term="Volatility">
        How widely a price moves, measured by the standard deviation of its returns, usually on an annual basis.
        The higher it is, the faster the price can drift away from where it started, in either direction.
      </Definition>
      <P>
        Major stock indices have historically had a volatility of around 15 to 20% a year. A single stock is
        usually more volatile, and a cryptocurrency such as bitcoin is often two to four times more volatile than
        an index. The higher the volatility, the deeper temporary losses can be, and that is where arithmetic
        becomes cruel.
      </P>
      <LossRecoveryDiagram locale="en" />
      <P>
        A loss and a gain of the same percentage do not cancel out: after −50%, you need to double your money to
        get back to where you started. This is why experienced traders think about limiting losses first, before
        trying to maximise gains.
      </P>

      <H2 id="diversification">Diversify: don’t bet everything on one stock</H2>
      <P>
        A company can flop a product, lose a lawsuit or go bankrupt. This company-specific risk shrinks
        considerably when you spread your capital across several securities, from different sectors, countries and
        asset classes. Bad surprises from some are then partly offset by good surprises from others.
      </P>
      <P>
        Diversification has a limit: it does not protect against market risk, the kind that hits everyone at
        once. In 2008 or in March 2020, almost all stocks fell together. Mixing assets that react differently
        (stocks, bonds, gold, currencies) cushions these shocks better than piling up similar stocks.
      </P>
      <DiversificationDiagram locale="en" />

      <KeyFigure value="5 to 10%">
        A widespread rule of prudence: never commit more than 5 to 10% of your capital to a single position.
      </KeyFigure>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Build a diversified portfolio on a date in the past, then watch it go through the following sessions.
      </InlineCta>

      <H2 id="fees">Fees, the slow poison</H2>
      <P>
        Every order has a cost: brokerage fees, the spread, sometimes taxes. Taken one by one, they look tiny.
        Added up, they become one of the main causes of underperformance, especially for those who trade a lot.
      </P>
      <P>
        A simple example: with 0.1% in fees to buy and 0.1% to sell, a round trip costs 0.2% of the amount
        traded. A hundred round trips a year on your whole capital, and 20% of your capital goes on fees, before
        the first gain. Over the long run, an extra 1% in annual fees is enough to shrink your final capital by
        about a quarter after thirty years.
      </P>
      <P>
        In the game, every order pays brokerage fees, and the order ticket shows them before you confirm. It is a
        good way to feel how much trading frequency weighs on your results.
      </P>

      <FeesDiagram locale="en" />

      <H2 id="short-selling">Short selling: profiting from a fall</H2>
      <Definition term="Short selling">
        Selling a security you do not own, by borrowing it, in order to buy it back later. You gain if the price
        falls between the sale and the buyback; you lose if it rises.
      </Definition>

      <ArchiveFigure
        name="triomphe-ours-1903"
        locale="en" layout="side"
        alt="Cartoon of a bear brandishing a sword over a fallen bull, before the Wall Street crowd"
        caption="“The triumph of the bear in the Wall Street arena”: the bear, who profits from falling prices, floors the bull. Puck, 1903."
      />
      <P>
        Short selling is useful: it lets you bet against a stock you find overpriced, or hedge a portfolio. But its
        risk profile is reversed. When you buy, the maximum loss is your stake: a security cannot be worth less
        than zero. When you short, the maximum gain is 100% (if the security falls to zero), while the loss has{' '}
        <Em>no ceiling</Em>: a price can double, triple, or more.
      </P>
      <P>
        When many short sellers have to buy back at the same time, their purchases push the price even higher:
        this is a <Em>short squeeze</Em>. In January 2021, GameStop stock rose more than tenfold in a few weeks,
        partly for this reason, inflicting heavy losses on short sellers.
      </P>
      <P>
        This is why the proceeds of a short sale stay locked as collateral, and a minimum margin is required.
        FinanceQuest applies the same logic: your net value must cover half of your short positions.
      </P>

      <ShortPayoffDiagram locale="en" />

      <H2 id="leverage">Leverage and the risk of ruin</H2>
      <P>
        Leverage means committing more money than you have, by borrowing. With 10× leverage, a 1% rise earns you
        10%… and a 10% fall wipes out your entire stake. Beyond that, the broker demands more funds (a{' '}
        <Em>margin call</Em>) or closes your position automatically, at the worst possible moment.
      </P>
      <P>
        Leverage does not change the quality of a decision; it only changes how fast you win or lose. For a
        beginner, it turns ordinary mistakes into irreversible losses. European regulators actually require CFD
        brokers, who sell highly leveraged products, to display the share of retail accounts that lose money: it
        is often above 70%.
      </P>

      <H2 id="biases">Your worst enemies: your own biases</H2>
      <P>
        Behavioural finance has shown it since the work of Daniel Kahneman and Amos Tversky: we do not decide like
        calculators. A few biases keep coming up among traders.
      </P>

      <ArchiveFigure
        name="foule-wall-street-1929"
        locale="en"
        alt="Dense crowd gathered outside the New York Stock Exchange"
        caption="On 24 October 1929, “Black Thursday”, crowds gather outside the New York Stock Exchange. Panic spreads from one investor to the next."
      />
      <List>
        <li>
          <Em>Loss aversion</Em>: a loss hurts roughly twice as much as an equivalent gain pleases. So we hold on
          to losing positions “until they come back”.
        </li>
        <li>
          <Em>The disposition effect</Em>, its corollary: selling winners too early and losers too late.
        </li>
        <li>
          <Em>Overconfidence</Em>: a few successes are enough to feel smarter than the market, and to raise the
          stakes.
        </li>
        <li>
          <Em>Fear of missing out</Em>: buying what has just risen sharply, often close to a peak.
        </li>
        <li>
          <Em>Confirmation bias</Em>: only paying attention to information that proves your position right.
        </li>
      </List>
      <P>
        The best remedy is method: decide your rules in advance (position size, exit threshold, reasons to buy),
        write them down, and reread them before every order.
      </P>

      <H2 id="practice">Practise before you risk money</H2>
      <P>
        No pilot learns on a passenger jet. A simulator lets you make your mistakes without paying for them: feel
        the effect of fees, watch a concentrated portfolio dive, see a short position get out of hand, and measure
        your decisions by their return.
      </P>
      <P>
        FinanceQuest is built on a rule that keeps the exercise honest: you replay the past with real prices, but{' '}
        <Em>you never see tomorrow</Em>. You cannot use what we know today; you decide with the information of the
        moment, like an investor at the time. A good way to test your rules before applying them for real, and to
        discover your own temperament when markets rise and fall.
      </P>
    </>
  );
}
