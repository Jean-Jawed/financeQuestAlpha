/**
 * LA GAZETTE - Fiche: What is an ETF? (English)
 */

import { EtfDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Summary } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('en').mag;
const SIGNUP = localizePath('en', '/signup');

export const toc: TocEntry[] = [];

export default function Article() {
  return (
    <>
      <Summary title={mag.summary}>
        <li>An ETF is a fund listed on the stock exchange that tracks an index.</li>
        <li>A single share gives you exposure to dozens, even thousands, of companies.</li>
        <li>Its fees are low, often under 0.3% a year.</li>
        <li>It rises and falls with its index: it does not protect you from a crash.</li>
      </Summary>

      <Definition term="ETF (exchange-traded fund)">
        An investment fund listed on the stock exchange that aims to reproduce the performance of an index as
        closely as possible. It is also called an index tracker.
      </Definition>

      <H2 id="principle">The idea: a whole basket in one share</H2>
      <P>
        To track the{' '}
        <MagLink id="indice" locale="en">
          S&amp;P 500
        </MagLink>
        , you would need to buy the shares of 500 US companies, each in the right proportion, and rebalance all the
        time. An ETF does it for you: the manager holds those shares, and you buy units of the fund on the
        exchange, just like an ordinary stock.
      </P>

      <EtfDiagram locale="en" />

      <P>
        The first US ETF, the SPDR S&amp;P 500, was launched in January 1993. It is now one of the most traded
        securities in the world, and ETFs together manage trillions of dollars.
      </P>

      <H2 id="strengths">Why they are so popular</H2>
      <List>
        <li>
          <Em>Instant diversification</Em>: a single share spreads the risk across the whole index.
        </li>
        <li>
          <Em>Low fees</Em>: no manager picking stocks, just replication. Large ETFs often charge between 0.05% and
          0.3% a year, against 1.5 to 2% for many actively managed funds.
        </li>
        <li>
          <Em>Simplicity</Em>: you buy and sell it at any time during the session, at the market price.
        </li>
      </List>
      <KeyFigure value="0.2%">
        Typical annual fees for an ETF on a major index. Over thirty years, each point of fees avoided can amount
        to nearly a quarter of the final capital.
      </KeyFigure>

      <H2 id="limits">What an ETF does not do</H2>
      <P>
        An ETF follows its index, up and down. When the market loses 30%, the ETF loses roughly 30%. It will never
        help you beat the market: its very promise is not to. You also need to check what it holds. An ETF on a
        single sector or country is much less diversified than a global one. And if it is priced in another
        currency, you carry{' '}
        <MagLink id="change" locale="en">
          currency risk
        </MagLink>
        .
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        In FinanceQuest, major indices can be bought like a stock: the equivalent of an ETF, with no management
        fees.
      </InlineCta>
    </>
  );
}
