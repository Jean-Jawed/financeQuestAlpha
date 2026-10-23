/**
 * LA GAZETTE - Currency: when the exchange rate decides your return (English)
 */

import { FxDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('en').mag;
const SIGNUP = localizePath('en', '/signup');

export const toc: TocEntry[] = [
  { id: 'reading', title: 'Reading an exchange rate' },
  { id: 'two-bets', title: 'Two bets in one' },
  { id: 'examples', title: '2017 and 2022: two real examples' },
  { id: 'protection', title: 'Can you protect yourself?' },
  { id: 'game', title: 'Currency in FinanceQuest' },
];

export default function Article() {
  return (
    <>
      <P>
        When a European saver buys an American, Japanese or Swiss stock, they are not only taking a risk on the
        company. They first exchange their euros for another currency, and one day they will have to make the
        return trip. In between, that currency will have moved, sometimes as much as the stock itself.
      </P>

      <H2 id="reading">Reading an exchange rate</H2>
      <Definition term="EUR/USD exchange rate">
        The number of dollars needed to buy one euro. At 1.10, one euro is worth 1.10 dollars, and one dollar is
        worth about 0.91 euros.
      </Definition>
      <P>
        When EUR/USD rises, the euro strengthens: each dollar you hold is worth fewer euros. When it falls, the
        opposite happens. These moves depend mostly on interest rates set by central banks, on growth and on
        crises: in a panic, investors often take refuge in the dollar, the Swiss franc or the yen.
      </P>

      <H2 id="two-bets">Two bets in one</H2>
      <P>
        The return on a foreign investment, measured in euros, combines two moves: that of the asset in its own
        currency, and that of the currency against the euro. They roughly add up.
      </P>
      <FxDiagram locale="en" />
      <P>
        A stock that does not move in New York can therefore lose money for a European investor, simply because the
        dollar has fallen. Conversely, a strengthening dollar can cushion a fall.
      </P>

      <H2 id="examples">2017 and 2022: two real examples</H2>
      <Table
        head={['Year', 'S&P 500 in dollars', 'EUR/USD over the year', 'S&P 500 in euros']}
        rows={[
          ['2017', '+19%', 'from 1.05 to 1.20', 'about +5%'],
          ['2022', '−19%', 'from 1.14 to 1.07', 'about −14%'],
        ]}
      />
      <P>
        In 2017, the US index gained nearly 20%, but the euro soared: a European saver kept only about a quarter of
        it. In 2022, the opposite happened. The index lost nearly 20%, but the dollar strengthened so much that the
        euro fell below parity in the summer: in euros, the loss was only about 14%.
      </P>
      <KeyFigure value="−3/4">
        In 2017, currency moves wiped out about three quarters of the S&amp;P 500’s rise for a euro-based investor.
      </KeyFigure>

      <H2 id="protection">Can you protect yourself?</H2>
      <List>
        <li>
          <Em>Hedged funds</Em>: some{' '}
          <MagLink id="etf" locale="en">
            ETFs
          </MagLink>{' '}
          come in a “currency-hedged” version. They neutralise most exchange-rate moves, at a cost that depends on
          the interest-rate gap between the two currencies.
        </li>
        <li>
          <Em>Diversification</Em>: holding assets in several currencies stops any single one from weighing on the
          whole portfolio.
        </li>
        <li>
          <Em>Time</Em>: over long periods, currency effects tend to partly cancel out, with no guarantee that they
          will.
        </li>
      </List>
      <P>
        Watch the fees too: many brokers take a commission on each conversion, often a few tenths of a percent, on
        top of{' '}
        <MagLink id="avant-de-trader" locale="en">
          trading fees
        </MagLink>
        .
      </P>

      <H2 id="game">Currency in FinanceQuest</H2>
      <P>
        Each game has its own game currency, chosen at the start. Assets stay priced in their home currency: dollars
        for Wall Street, yen for Tokyo, pounds for London. Your balance, average costs and performance are converted
        at the real exchange rate of the simulated day. A US stock can therefore rise in New York and weigh on your
        euro portfolio, exactly as in real life. The scenario called <Em>The Orient</Em>, with its Asian exchanges, is
        especially sensitive to it.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Choose your game currency and buy abroad: currency moves will do the rest.
      </InlineCta>
    </>
  );
}
