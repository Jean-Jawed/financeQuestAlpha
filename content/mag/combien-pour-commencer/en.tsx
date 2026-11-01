/**
 * LA GAZETTE - How much money do you need to start investing? (English)
 */

import { ArchiveFigure } from '@/components/mag/figures';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('en').mag;
const SIGNUP = localizePath('en', '/signup');

export const toc: TocEntry[] = [
  { id: 'minimum', title: 'The minimum, in theory' },
  { id: 'before', title: 'What comes before the market' },
  { id: 'fees', title: 'Fees, the enemy of small amounts' },
  { id: 'diversify', title: 'Diversifying with little' },
  { id: 'monthly', title: 'Investing every month' },
  { id: 'account', title: 'The right account' },
  { id: 'practice', title: 'Starting with zero' },
];

export default function Article() {
  return (
    <>
      <P>
        It is often the first question, and it hides another one. How much do you need to <Em>open</Em> an account?
        Almost nothing. How much do you need for the experience to make sense, without putting your budget at risk?
        That answer depends less on an amount than on a few simple rules, which hold for 100 as well as for 100,000.
      </P>

      <H2 id="minimum">The minimum, in theory: almost nothing</H2>
      <P>
        There is no legal minimum for investing in the stock market. Most online brokers open an account with no
        required deposit, and the only real floor is the price of one share, or one unit of an exchange-traded fund
        (ETF), which often trades between a few euros and a few hundred. Some brokers even offer{' '}
        <Em>fractional shares</Em>: you can buy a tenth of a stock that is too expensive.
      </P>
      <KeyFigure value="€0">
        The legal minimum to invest in the stock market. The real minimum is the price of one security, and above all
        what you can lose without it changing your life.
      </KeyFigure>
      <P>
        But being able to start with 20 does not mean starting any old way. Three questions matter more than the
        amount: is this money really available, how much will fees cost, and how do you avoid betting everything on
        a single stock?
      </P>

      <H2 id="before">What comes before the market</H2>
      <P>
        The stock market is for money you will not need for a long time. A stock can lose 30% in a few months, and
        it has sometimes taken years for a market to regain its peak. If an unexpected expense forces you to sell at
        the wrong time, a temporary loss becomes permanent.
      </P>
      <Definition term="Emergency fund">
        A reserve of money available at any time, in a savings account with no risk, to cover the unexpected: a
        breakdown, a job loss, medical costs. The usual advice is three to six months of expenses.
      </Definition>
      <List>
        <li>
          <Em>Build your emergency fund first.</Em> It is what lets you never sell under pressure.
        </li>
        <li>
          <Em>Pay off expensive debt</Em>, such as a revolving credit card balance. No investment reliably beats a
          borrowing rate of 15 or 20%.
        </li>
        <li>
          <Em>Only invest money you will not need for at least five years.</Em> The longer the horizon, the more
          time bad years have to be made up.
        </li>
        <li>
          <Em>Never borrow to invest</Em> as a beginner: leverage turns ordinary mistakes into irreversible losses.
        </li>
      </List>

      <H2 id="fees">Fees, the enemy of small amounts</H2>
      <P>
        With a small amount, the biggest threat to your return is not the market: it is fees. Many brokers charge a
        minimum per order, whatever its size. On a small sum, that minimum weighs heavily.
      </P>
      <Table
        head={['Order size', 'Fixed fee of €2', 'What the stock must gain to pay for buying and selling']}
        rows={[
          ['€50', '4%', '≈ 8%'],
          ['€200', '1%', '≈ 2%'],
          ['€1,000', '0.2%', '≈ 0.4%'],
          ['€5,000', '0.04%', '≈ 0.08%'],
        ]}
      />
      <P>
        A fictional but realistic example: at €2 per order, buying €50 of stock and selling it again costs €4, or 8%
        of the stake. The stock has to rise 8% just to break even. Before opening an account, read the fee schedule,
        and prefer a few orders of reasonable size to many small ones.
      </P>

      <H2 id="diversify">Diversifying with little money</H2>
      <P>
        With 300, buying ten different stocks is often neither possible nor worthwhile, because of fees. This is
        exactly where index funds help. A single unit of an{' '}
        <MagLink id="etf" locale="en">
          ETF
        </MagLink>{' '}
        tracking a global{' '}
        <MagLink id="indice" locale="en">
          index
        </MagLink>{' '}
        gives you, in one go, exposure to more than a thousand companies in dozens of countries.
      </P>
      <P>
        On the other hand, putting a small savings pot into a single stock “because it is going up” is betting on a
        company, not investing. A company can halve on bad news; a broad index rarely does.
      </P>

      <ArchiveFigure
        name="bourse-paris-xixe"
        locale="en"
        alt="The Paris stock exchange building, 19th-century engraving"
        caption="The Palais Brongniart, home of the Paris stock exchange from 1826 to 1987. For a long time, investing there meant going through a broker and buying costly paper certificates: index funds made diversification available to everyone."
      />

      <H2 id="monthly">Investing a little, but every month</H2>
      <P>
        For most savers, regularity matters more than the starting amount. Putting in a fixed sum every month has
        two advantages: you do not have to guess the right time to get in, and you automatically buy more units
        when prices are low.
      </P>
      <Definition term="Dollar cost averaging">
        Investing a fixed amount at regular intervals, whatever the level of the market.
      </Definition>
      <KeyFigure value="≈ 20,300">
        What 50 paid in every month for 20 years (12,000 in total) would become, with a constant 5% annual return,
        before fees and taxes. A theoretical calculation: real returns vary from year to year and are never
        guaranteed.
      </KeyFigure>
      <P>
        The difference comes from <Em>compound interest</Em>: each year’s gains earn gains of their own. The earlier
        you start, the more time this effect has to work, even with small sums.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Invest monthly or all at once? Test both approaches on real prices.
      </InlineCta>

      <H2 id="account">Choosing the right account</H2>
      <P>
        The type of account changes how much of your gains you keep. Many countries offer tax-advantaged accounts
        for long-term investing: the <Em>ISA</Em> in the United Kingdom, the <Em>IRA</Em> in the United States, the{' '}
        <Em>PEA</Em> in France. A standard brokerage account gives access to every market, but gains are usually
        taxed in the year you sell.
      </P>
      <P>
        Tax rules change and depend on your situation: check them with official sources before opening an account.
      </P>

      <H2 id="practice">Starting with zero</H2>
      <P>
        There is one way to start without risking anything: practice. A simulator lets you learn to place orders,
        feel the weight of fees, see what a 20% drop does to a concentrated portfolio, and above all find out how you
        yourself react, before the money is real.
      </P>
      <P>
        In PastFolio, you receive 10,000 in virtual capital and start again from a date in the past, on real prices,
        without ever seeing tomorrow. A good way to find out, before investing your first euro or dollar, whether you
        are the kind to hold on or to sell everything at the first storm. And if you already know the basics, read{' '}
        <MagLink id="avant-de-trader" locale="en">
          what to know before you start trading
        </MagLink>
        .
      </P>
    </>
  );
}
