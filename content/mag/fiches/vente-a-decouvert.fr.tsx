/**
 * LA GAZETTE - Fiche : La vente à découvert en 2 minutes (français)
 */

import { ShortPayoffDiagram } from '@/components/mag/diagrams';
import { Definition, Em, H2, InlineCta, List, MagLink, P, Summary } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('fr').mag;
const SIGNUP = localizePath('fr', '/signup');

export const toc: TocEntry[] = [];

export default function Article() {
  return (
    <>
      <Summary title={mag.summary}>
        <li>Vendre à découvert, c’est vendre un titre emprunté pour le racheter plus tard, moins cher.</li>
        <li>On gagne si le cours baisse, on perd s’il monte.</li>
        <li>Le gain est limité à 100 %, la perte n’a pas de plafond.</li>
        <li>Une garantie (la marge) est toujours exigée.</li>
      </Summary>

      <Definition term="Vente à découvert (short)">
        Vendre un titre que l’on ne possède pas, après l’avoir emprunté, dans l’idée de le racheter plus tard à
        un prix plus bas pour le rendre à son prêteur.
      </Definition>

      <H2 id="etapes">Le mécanisme en quatre étapes</H2>
      <List ordered>
        <li>
          <Em>Emprunter</Em> 10 actions à 100 €, auprès de son courtier, contre une petite commission.
        </li>
        <li>
          <Em>Les vendre</Em> tout de suite : on encaisse 1 000 €, qui restent bloqués en garantie.
        </li>
        <li>
          <Em>Attendre.</Em> Si le cours tombe à 80 €, racheter les 10 actions ne coûte que 800 €.
        </li>
        <li>
          <Em>Rendre</Em> les actions au prêteur. Le gain est de 200 €, moins les frais. Si le cours était monté à
          130 €, la perte aurait été de 300 €.
        </li>
      </List>

      <ShortPayoffDiagram locale="fr" />

      <H2 id="risque">Pourquoi c’est plus risqué qu’un achat</H2>
      <P>
        Un cours ne peut pas descendre sous zéro, mais il peut monter sans limite. Le vendeur à découvert gagne au
        mieux le montant vendu, et peut perdre bien davantage. Le danger le plus connu est le <Em>short squeeze</Em> : quand
        le cours grimpe, les vendeurs doivent racheter pour limiter leurs pertes, et leurs achats font monter le
        cours encore plus.
      </P>
      <P>
        En octobre 2008, une course au rachat a brièvement fait de Volkswagen l’entreprise la plus chère du monde.
        En janvier 2021, l’action GameStop a été multipliée par plus de dix en quelques semaines. Le levier et
        la marge, qui aggravent ces situations, sont expliqués dans{' '}
        <MagLink id="avant-de-trader" locale="fr">
          ce qu’il faut savoir avant de trader
        </MagLink>
        .
      </P>

      <H2 id="jeu">Dans FinanceQuest</H2>
      <P>
        Le jeu applique une règle de marge simple : votre valeur nette doit couvrir au moins la moitié de vos
        positions à découvert. Le scénario <Em>L’ours</Em> n’autorise même que les paris à la baisse : un bon
        entraînement pour sentir comment ce risque se vit.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Tentez une vente à découvert sur une vraie séance du passé, sans risquer un centime.
      </InlineCta>
    </>
  );
}
