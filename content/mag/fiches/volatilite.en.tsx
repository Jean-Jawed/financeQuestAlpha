/**
 * LA GAZETTE - Fiche: What is volatility? (English)
 */

import { VolatilityDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, KeyFigure, MagLink, P, Summary, Table } from '@/components/mag/prose';
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
        <li>Volatility measures how widely a price swings, up as well as down.</li>
        <li>It is expressed as an annual percentage: about 15 to 20% for a major index.</li>
        <li>High volatility does not mean a loss, but deeper dips along the way.</li>
        <li>The VIX, the “fear index”, measures the volatility expected on the S&amp;P 500.</li>
      </Summary>

      <Definition term="Volatility">
        The standard deviation of an asset’s returns, usually scaled to a year. The larger it is, the faster and
        further the price strays from its trend.
      </Definition>

      <H2 id="reading">How to read it</H2>
      <P>
        A volatility of 20% a year means, roughly, that two years out of three, the return lands within 20 points
        of its average, above or below. Scaled down to a single session, it gives daily moves of about 1.3%. It is
        only an order of magnitude: markets have more extreme days than the formulas predict.
      </P>

      <VolatilityDiagram locale="en" />

      <H2 id="levels">Typical levels</H2>
      <Table
        head={['Asset', 'Usual annual volatility']}
        rows={[
          ['Major index (S&P 500, CAC 40)', '15 to 20%'],
          ['Large-company stock', '20 to 35%'],
          ['Small company, biotech', '40% and more'],
          ['Bitcoin', 'often 50 to 80%'],
        ]}
      />

      <H2 id="fear">The VIX, the fear index</H2>
      <P>
        The VIX, calculated by the Chicago exchange from option prices, measures the volatility the market{' '}
        <Em>expects</Em> for the S&amp;P 500 over the next thirty days. In calm times, it hovers around 12 to 20.
        It soars during panics.
      </P>
      <KeyFigure value="82.69">
        The VIX’s record close, on 16 March 2020, at the height of the Covid panic. It had reached 80.86 in November
        2008.
      </KeyFigure>

      <H2 id="risk">Volatility and risk</H2>
      <P>
        Volatility is not a permanent loss: a very choppy index can end sharply higher. But it matters, because you
        may be forced to sell at the worst moment, and because a deep fall takes an even bigger rise to recover.
        The great{' '}
        <MagLink id="krachs" locale="en">
          crashes
        </MagLink>{' '}
        are the moments when it explodes.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        In the game, every security’s sheet shows its annualised volatility: compare an index and a crypto.
      </InlineCta>
    </>
  );
}
