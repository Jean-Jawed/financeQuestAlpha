/**
 * LA GAZETTE - Fiche: What is a dividend? (English)
 */

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
        <li>A dividend is the share of profits a company pays to its shareholders.</li>
        <li>It is never guaranteed: the company can cut it or scrap it.</li>
        <li>On the ex-dividend date, the price drops by roughly the amount paid.</li>
        <li>Reinvested, dividends weigh heavily in long-term performance.</li>
      </Summary>

      <Definition term="Dividend">
        The money a company distributes to its shareholders out of its profits, usually once a year in Europe and
        every quarter in the United States.
      </Definition>

      <H2 id="decision">Who decides, and how much</H2>
      <P>
        Every year, the company chooses what to do with its profit: keep it to invest and grow, or pay part of it
        back to its owners, the{' '}
        <MagLink id="action" locale="en">
          shareholders
        </MagLink>
        . The proportion paid out is called the <Em>payout ratio</Em>. Mature, stable companies (energy, banks,
        consumer goods) often pay out a lot; young growth companies pay little or nothing.
      </P>

      <H2 id="dates">The dates that matter</H2>
      <List>
        <li>
          <Em>The ex-dividend date</Em>: to receive the dividend, you must own the share the evening before. That
          day, the price opens lower by roughly the amount of the dividend.
        </li>
        <li>
          <Em>The payment date</Em>, a few days later: the money lands in the account.
        </li>
      </List>
      <P>
        The ex-dividend date explains a classic trap: buying just before to “collect the dividend” earns you
        nothing extra. What you receive in cash, you lose in the value of the share.
      </P>

      <H2 id="yield">Dividend yield</H2>
      <P>
        The dividend is often compared to the share price: a €3 dividend on a €60 share is a 5% yield. A very high
        yield should worry rather than delight you: it often means the price has fallen because the market doubts
        the dividend will be maintained.
      </P>
      <KeyFigure value="≈ 40%">
        The share of the S&amp;P 500’s total return that came from reinvested dividends since 1930, according to
        widely cited studies. The price indices quoted everywhere leave it out.
      </KeyFigure>

      <H2 id="reinvesting">The power of reinvesting</H2>
      <P>
        A reinvested dividend buys new shares, which in turn pay dividends. Over several decades, this snowball
        effect makes a big difference. That is why you should compare an investment with a “total return”{' '}
        <MagLink id="indice" locale="en">
          index
        </MagLink>
        , and why many{' '}
        <MagLink id="etf" locale="en">
          ETFs
        </MagLink>{' '}
        automatically reinvest what they receive.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Build a portfolio on a date from the past, and watch it live session after session.
      </InlineCta>
    </>
  );
}
