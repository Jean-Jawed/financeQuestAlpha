/**
 * LA GAZETTE - Fiche: What is a stock? (English)
 */

import { ArchiveFigure } from '@/components/mag/figures';
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
        <li>A stock, or share, is a slice of a company’s capital.</li>
        <li>It entitles you to a share of the profits (the dividend) and, usually, to a vote.</li>
        <li>Its price forms on the stock exchange, with every trade between a buyer and a seller.</li>
        <li>You can lose everything if the company goes bust, but never more than you put in.</li>
      </Summary>

      <Definition term="Stock">
        A security that represents a fraction of a company’s capital. Whoever holds it is a shareholder: they own a
        small piece of the business.
      </Definition>

      <H2 id="why">Why companies sell shares</H2>
      <P>
        To grow, a company needs money. It can borrow it, or bring in new partners by selling them a part of its
        capital. When it lists on the stock exchange, those shares become tradable by anyone: they can be bought
        and sold on every trading day.
      </P>
      <P>
        The idea is old. In 1602, the Dutch East India Company sold its shares to thousands of savers in
        Amsterdam, who could then trade them with one another. It is often seen as the birth of the stock market.
      </P>

      <H2 id="rights">What a share gives you</H2>
      <List>
        <li>
          <Em>A share of the profits</Em>, when the company decides to pay them out: this is the{' '}
          <MagLink id="dividende" locale="en">
            dividend
          </MagLink>
          .
        </li>
        <li>
          <Em>A vote</Em> at general meetings, usually one vote per share.
        </li>
        <li>
          <Em>A share of the company’s value</Em>: if it grows and earns more, its share price tends to rise.
        </li>
      </List>
      <P>
        A stock is not a <Em>bond</Em>. A bond is a loan: the company promises to pay interest and to repay on a set
        date. A stock promises nothing. It pays more on average over the long run, precisely because it is
        riskier.
      </P>

      <ArchiveFigure
        name="obligation-1887"
        locale="en"
        layout="side"
        alt="Printed bond certificate from 1887, decorated with engravings of trains, bridges and coats of arms"
        caption="An 1887 bond issued by a Catalan railway company. Before computers, stocks and bonds were printed papers, with coupons to clip."
      />

      <H2 id="price">How the price forms</H2>
      <P>
        A stock’s price is simply the price of the last trade. If more people want to buy than to sell, buyers
        have to offer more, and the price rises. In the opposite case, it falls. Company results, news, interest
        rates and the general mood shift this balance all the time.
      </P>
      <P>
        Multiply the price by the total number of shares and you get the <Em>market capitalisation</Em>: what the
        market thinks the whole company is worth, at that moment.
      </P>
      <KeyFigure value="€1bn">
        A share at €100 and 10 million shares outstanding: the market capitalisation is one billion euros.
      </KeyFigure>

      <H2 id="risk">What you risk</H2>
      <P>
        The worst case is bankruptcy: the share can then fall to zero. But your loss stops there, at the amount
        invested. That is why you avoid putting everything on a single stock, and often prefer a basket of shares,
        such as an{' '}
        <MagLink id="indice" locale="en">
          index
        </MagLink>{' '}
        or an{' '}
        <MagLink id="etf" locale="en">
          ETF
        </MagLink>
        .
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Buy your first shares on a real date from the past, with no real money.
      </InlineCta>
    </>
  );
}
