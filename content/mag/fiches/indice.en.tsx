/**
 * LA GAZETTE - Fiche: What is a stock market index? (English)
 */

import { IndexDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, MagLink, P, Summary, Table } from '@/components/mag/prose';
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
        <li>An index sums up, in a single number, how a group of stocks is doing.</li>
        <li>Most weight each company by its size on the stock market.</li>
        <li>The Dow Jones and the Nikkei 225 are exceptions: they weight by share price.</li>
        <li>You cannot buy an index directly, but you can buy an ETF that tracks it.</li>
      </Summary>

      <Definition term="Stock market index">
        A weighted average of the prices of a set of stocks, calculated continuously during the session. It acts
        as a market’s thermometer, and as a benchmark to judge performance.
      </Definition>

      <H2 id="calculation">How it is calculated</H2>
      <P>
        An index starts from a base value on a chosen date: 1,000 points on 31 December 1987 for France’s CAC 40.
        It then rises or falls with the stocks it contains, each counting for its <Em>weight</Em>.
      </P>

      <IndexDiagram locale="en" />

      <P>
        In most modern indices, such as the S&amp;P 500 or the CAC 40, the weight depends on{' '}
        <Em>market capitalisation</Em>: the more a company is worth on the market, the more it moves the index. A
        few giants can therefore weigh very heavily. The Dow Jones, created in 1896 with twelve stocks, and the
        Nikkei 225 are <Em>price-weighted</Em>: a $500 share counts more than a $50 share, whatever the size of the
        companies.
      </P>

      <H2 id="major-indices">The indices worth knowing</H2>
      <Table
        head={['Index', 'Market', 'Stocks']}
        rows={[
          ['S&P 500', 'Large US companies', '500'],
          ['Dow Jones', 'US blue chips', '30'],
          ['Nasdaq Composite', 'Nasdaq exchange, tech-heavy', 'over 3,000'],
          ['CAC 40', 'Paris stock exchange', '40'],
          ['DAX', 'Frankfurt stock exchange', '40'],
          ['Nikkei 225', 'Tokyo stock exchange', '225'],
        ]}
      />

      <H2 id="dividends">A trap: dividends</H2>
      <P>
        Most indices quoted in the news are <Em>price</Em> indices: they leave out the{' '}
        <MagLink id="dividende" locale="en">
          dividends
        </MagLink>{' '}
        paid. Yet over the long run, those dividends make up a large part of a shareholder’s gain. For a fair
        comparison, look at the “total return” version, with dividends reinvested.
      </P>
      <P>
        You cannot buy an index: it is a calculation, not a security. To follow one, you buy an{' '}
        <MagLink id="etf" locale="en">
          ETF
        </MagLink>{' '}
        that tracks it.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        The game’s market journal shows the S&amp;P 500, the CAC 40 and the Nikkei every day of the simulated date.
      </InlineCta>
    </>
  );
}
