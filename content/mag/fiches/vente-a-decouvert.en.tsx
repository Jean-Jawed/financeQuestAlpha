/**
 * LA GAZETTE - Fiche: Short selling in 2 minutes (English)
 */

import { ShortPayoffDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, List, MagLink, P, Summary } from '@/components/mag/prose';
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
        <li>Short selling means selling a borrowed security to buy it back later, cheaper.</li>
        <li>You gain if the price falls, you lose if it rises.</li>
        <li>The gain is capped at 100%, the loss has no ceiling.</li>
        <li>Collateral (the margin) is always required.</li>
      </Summary>

      <Definition term="Short selling">
        Selling a security you do not own, after borrowing it, with the idea of buying it back later at a lower
        price to return it to the lender.
      </Definition>

      <H2 id="steps">The mechanism in four steps</H2>
      <List ordered>
        <li>
          <Em>Borrow</Em> 10 shares at €100 from your broker, for a small fee.
        </li>
        <li>
          <Em>Sell them</Em> right away: you receive €1,000, which stays locked as collateral.
        </li>
        <li>
          <Em>Wait.</Em> If the price falls to €80, buying back the 10 shares costs only €800.
        </li>
        <li>
          <Em>Return</Em> the shares to the lender. The gain is €200, minus fees. Had the price risen to €130, the
          loss would have been €300.
        </li>
      </List>

      <ShortPayoffDiagram locale="en" />

      <H2 id="risk">Why it is riskier than buying</H2>
      <P>
        A price cannot fall below zero, but it can rise without limit. A short seller gains at best the amount
        sold, and can lose far more. The best-known danger is the <Em>short squeeze</Em>: when the price climbs,
        short sellers have to buy back to limit their losses, and their buying pushes the price even higher.
      </P>
      <P>
        In October 2008, a rush to buy back briefly made Volkswagen the most valuable company in the world. In
        January 2021, GameStop shares rose more than tenfold in a few weeks. Leverage and margin, which make these
        situations worse, are explained in{' '}
        <MagLink id="avant-de-trader" locale="en">
          what to know before you start trading
        </MagLink>
        .
      </P>

      <H2 id="game">In FinanceQuest</H2>
      <P>
        The game applies a simple margin rule: your net worth must cover at least half of your short positions.
        The scenario called <Em>The bear</Em> only allows bets on a fall: good practice to feel what this risk is like.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Try a short sale on a real session from the past, without risking a cent.
      </InlineCta>
    </>
  );
}
