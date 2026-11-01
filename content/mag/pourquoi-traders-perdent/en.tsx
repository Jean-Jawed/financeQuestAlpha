/**
 * LA GAZETTE - Why most retail traders lose money (English)
 */

import { ArchiveFigure } from '@/components/mag/figures';
import { TradingFrequencyDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('en').mag;
const SIGNUP = localizePath('en', '/signup');

export const toc: TocEntry[] = [
  { id: 'numbers', title: 'What the numbers say' },
  { id: 'fees', title: 'Fees, a slope to climb' },
  { id: 'leverage', title: 'Leverage' },
  { id: 'opponents', title: 'Up against professionals' },
  { id: 'biases', title: 'Biases' },
  { id: 'method', title: 'Being in the minority' },
];

export default function Article() {
  return (
    <>
      <P>
        The ads show traders winning from their sofa. The research tells another story: across most of the markets
        and periods studied, a large majority of individuals who trade actively lose money. It is not inevitable, but
        you need to understand why before hoping to do better.
      </P>

      <H2 id="numbers">What the numbers say</H2>
      <P>
        Regulators and researchers have measured the phenomenon several times, on different products and in
        different countries. The results look alike.
      </P>
      <Table
        head={['Study', 'Population observed', 'Result']}
        rows={[
          ['AMF (France), 2014', 'Retail forex traders, 2009-2012', '89% lost money, average loss ≈ €11,000'],
          ['ESMA (Europe), 2018', 'Retail CFD accounts', '74 to 89% of accounts lose money'],
          ['Barber and Odean, 2000', '66,000 US households, 1991-1996', 'Most active: 11.4% a year, vs 17.9% for the market'],
          ['Chague et al., 2019', 'Brazilian day traders active for over 300 sessions', '97% lost money'],
        ]}
      />
      <P>
        Since 2018, European CFD brokers, who sell highly leveraged products, have had to display on their website
        the share of retail accounts that lose money. It is usually above 70%.
      </P>
      <KeyFigure value="97%">
        Of Brazilians who day traded for more than 300 days lost money; barely more than 1% earned more than the
        minimum wage (Chague, De-Losso and Giovannetti, 2019).
      </KeyFigure>

      <H2 id="fees">Fees: a slope to climb every day</H2>
      <P>
        Every order costs something: a commission, the <Em>spread</Em> between the buying and selling price,
        sometimes financing charges. One by one, these costs look negligible. Multiplied by the number of orders,
        they become the active trader’s first opponent.
      </P>
      <KeyFigure value="−39%">
        What a daily round trip costs in one year with just 0.1% in fees per order: 500 orders over 250 sessions eat
        nearly 40% of the capital, before counting any gains or losses.
      </KeyFigure>
      <P>
        That is Barber and Odean’s conclusion: the households that traded the most did not necessarily pick worse
        stocks, but their costs wiped out most of their return. Fewer orders is often better.
      </P>
      <TradingFrequencyDiagram locale="en" />

      <H2 id="leverage">Leverage, the ruin accelerator</H2>
      <P>
        The products most sold to individuals, CFDs and forex above all, work with leverage: you commit far more than
        your stake. With leverage of 20, a 5% move against you is enough to lose the whole amount committed.
      </P>
      <Definition term="CFD (contract for difference)">
        A contract that lets you bet on an asset going up or down without owning it, usually with leverage. The gain
        or loss is the price difference between opening and closing the position.
      </Definition>
      <P>
        Leverage does not improve decisions: it speeds up their consequences. Beginners are often wrong; that is
        normal. With leverage, those ordinary mistakes leave no time to learn.
      </P>

      <H2 id="opponents">Up against better-equipped professionals</H2>
      <P>
        Over short periods, trading looks like a zero-sum game before costs: what one side wins, another loses. And
        on the other side of the screen are funds, banks and{' '}
        <MagLink id="micro-trading" locale="en">
          high-frequency algorithms
        </MagLink>{' '}
        with better data, lower costs and faster execution.
      </P>
      <P>
        Trying to beat them over a few minutes means playing on their turf. Individuals have other strengths: no one
        to report to every quarter, the ability to wait, and the freedom to do nothing.
      </P>

      <ArchiveFigure
        name="panique-1907"
        locale="en"
        alt="A crowd packed into a Wall Street street during the panic of 1907"
        caption="Wall Street during the panic of October 1907. When fear takes hold of the crowd, individuals often sell at the worst moment."
      />

      <H2 id="biases">Biases: the brain against the portfolio</H2>
      <P>
        Behavioural finance has shown that our natural reflexes are poorly suited to markets. Three biases weigh
        especially on retail traders.
      </P>
      <List>
        <li>
          <Em>Overconfidence.</Em> A few wins are enough to feel gifted. You trade more, raise your stakes, and both
          fees and losses grow.
        </li>
        <li>
          <Em>The disposition effect.</Em> You sell winners quickly to “lock in” the gain and hold losers hoping to
          get back to your purchase price. The result: small gains and large losses (see{' '}
          <MagLink id="quand-vendre" locale="en">
            when to sell a stock
          </MagLink>
          ).
        </li>
        <li>
          <Em>Chasing the big hit.</Em> Following a rumour, a forum or a stock that has just jumped 50%, often too
          late, just as the first buyers start selling.
        </li>
      </List>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Measure your own biases without risking a cent: replay a crisis on real prices.
      </InlineCta>

      <H2 id="method">How to be in the minority</H2>
      <P>
        There is no guaranteed method, but the same habits show up among those who do better than average.
      </P>
      <List ordered>
        <li>
          <Em>Trade less often.</Em> Every order needs a written reason, not just an urge.
        </li>
        <li>
          <Em>Limit the risk per position.</Em> A common rule: never risk more than 1 to 2% of your capital on a
          single idea.
        </li>
        <li>
          <Em>Decide the exit before the entry</Em>: at what price you will admit you were wrong, and why.
        </li>
        <li>
          <Em>Avoid leverage</Em> until you have proven yourself without it.
        </li>
        <li>
          <Em>Keep a journal</Em>: every order, its reason, its result. You learn more from mistakes written down
          than from memories.
        </li>
        <li>
          <Em>Practise first.</Em> Mistakes cost less on a simulator.
        </li>
      </List>
      <P>
        In PastFolio, fees are charged on every order and tomorrow stays unknown, as on a real market. The end-of-game
        summary compares your result with the scenario’s index: you see whether your activity earned you something, or
        cost you.
      </P>
    </>
  );
}
