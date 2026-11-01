/**
 * LA GAZETTE - When should you sell a stock? (English)
 */

import { ArchiveFigure } from '@/components/mag/figures';
import { StopLossDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('en').mag;
const SIGNUP = localizePath('en', '/signup');

export const toc: TocEntry[] = [
  { id: 'trap', title: 'The purchase price trap' },
  { id: 'disposition', title: 'The disposition effect' },
  { id: 'reasons', title: 'Five good reasons to sell' },
  { id: 'stop', title: 'The stop, an exit decided in advance' },
  { id: 'bad', title: 'The bad reasons' },
  { id: 'rule', title: 'Writing your exit rule' },
];

export default function Article() {
  return (
    <>
      <P>
        Buying is easy: you have an idea, a hope, a story. Selling is much harder, because selling forces a decision.
        With a gain, you fear leaving too early; with a loss, you refuse to admit it. Most beginners do not have bad
        buying ideas; they simply have no exit plan.
      </P>

      <ArchiveFigure
        name="courtier-telescripteur-1894"
        locale="en"
        alt="A man in a top hat reads the tape of a stock ticker"
        caption="In 1894, a broker reads prices off a ticker tape. The question has not changed since: hold, or sell?"
        layout="side"
      />

      <H2 id="trap">The purchase price trap</H2>
      <P>
        The market does not know what price you paid, and does not care. Yet that price takes up almost all the room
        in an investor’s head: you wait to “get back to even” before selling a loser, or you sell a winner as soon as
        it shows a nice percentage.
      </P>
      <P>
        The only useful question looks forward: <Em>if I did not own this stock today, would I buy it at this
        price?</Em> If the answer is no, holding it amounts to buying it again every day.
      </P>

      <H2 id="disposition">The disposition effect: selling winners, holding losers</H2>
      <Definition term="Disposition effect">
        The tendency to sell stocks that have risen too early and to hold those that have fallen too long. Described
        by Hersh Shefrin and Meir Statman in 1985, it stems from loss aversion: realising a loss hurts more than
        leaving it “on paper”.
      </Definition>
      <P>
        Terrance Odean measured it in 1998 on 10,000 US retail accounts: investors sold their winners about one and a
        half times more readily than their losers. And it was a bad bet.
      </P>
      <KeyFigure value="3.4 pts">
        Over the following year, the winners sold beat the losers kept by about 3.4 percentage points (Odean, 1998).
        Investors were holding on to precisely the wrong ones.
      </KeyFigure>

      <H2 id="reasons">Five good reasons to sell</H2>
      <List ordered>
        <li>
          <Em>The reason you bought no longer exists.</Em> You bought for the growth of a product that has been
          dropped, for a CEO who is leaving, for a contract that was lost: the story has changed, the stock must be
          reassessed.
        </li>
        <li>
          <Em>Your loss threshold has been hit.</Em> The level at which you decided, before buying, to admit you were
          wrong.
        </li>
        <li>
          <Em>The position has grown too big.</Em> A stock that has doubled can take up an outsized share of the
          portfolio. Trimming it back to your target allocation is{' '}
          <MagLink id="avant-de-trader" locale="en">
            diversification
          </MagLink>{' '}
          in practice.
        </li>
        <li>
          <Em>You have found something better.</Em> Money tied up in one stock is not working elsewhere. A better
          idea, clearly argued, is a valid reason to switch.
        </li>
        <li>
          <Em>You need the money.</Em> Hence the value of only investing sums you will not need in the short term, so
          that this reason comes as late as possible.
        </li>
      </List>

      <H2 id="stop">The stop: an exit decided in advance</H2>
      <P>
        The simplest way to escape biases is to decide your exit <Em>before</Em> you get in, with a cool head. That is
        what a stop is for.
      </P>
      <Definition term="Stop-loss order">
        A sell order that triggers automatically if the price falls below a level chosen in advance. It caps the loss
        on a position without having to watch the screen.
      </Definition>
      <P>
        A <Em>fixed stop</Em> stays at a set level, for example 10% below the purchase price. A{' '}
        <Em>trailing stop</Em> rises with the price: it always stays 10% below the highest level reached, and never
        moves down. It protects both against losses and against giving back all your gains.
      </P>
      <StopLossDiagram locale="en" />
      <P>
        Two limits to know. A stop set too tight triggers on plain noise: place it with the stock’s{' '}
        <MagLink id="volatilite" locale="en">
          volatility
        </MagLink>{' '}
        in mind. And a stop does not guarantee the price: if the stock opens sharply lower after bad news, the order
        fills at the first available price, sometimes well below the threshold.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Set your exit thresholds and stick to them, session after session, on real prices.
      </InlineCta>

      <H2 id="bad">The bad reasons to sell (or to hold)</H2>
      <Table
        head={['What you tell yourself', 'What really happens']}
        rows={[
          ['“I’ll wait to get back to my purchase price”', 'Your purchase price has no influence on the future price'],
          ['“I’ll lock in my gain, that’s good enough”', 'You sometimes cut your best ideas too early'],
          ['“Everyone is selling, so am I”', 'Panics make people sell near the lows'],
          ['“It has risen too much, it has to fall”', 'A rising stock can keep rising for a long time'],
          ['“I’ll stop looking, it will come back eventually”', 'Some stocks never come back'],
        ]}
      />
      <P>
        Finally, think about tax: selling a winning position realises a capital gain, usually taxable depending on the
        type of account and the country. It is a cost to factor in, never a good enough reason to hold a stock you no
        longer want.
      </P>

      <H2 id="rule">Writing your exit rule</H2>
      <P>The best selling decision is made when you buy. Before each order, write down three lines:</P>
      <List>
        <li>
          <Em>Why I am buying</Em>: the idea, in one sentence.
        </li>
        <li>
          <Em>How I will know I am wrong</Em>: a price threshold, or an event.
        </li>
        <li>
          <Em>What I will do if all goes well</Em>: trim beyond a certain weight, or follow with a stop.
        </li>
      </List>
      <P>
        PastFolio does not execute automatic orders: it is up to you to apply your threshold at each session, watching
        how your positions moved. An excellent exercise in discipline, with no risk at all, before doing it with real
        money.
      </P>
    </>
  );
}
