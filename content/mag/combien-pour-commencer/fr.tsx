/**
 * LA GAZETTE - Combien d'argent faut-il pour commencer en bourse ? (français)
 */

import { ArchiveFigure } from '@/components/mag/figures';
import { Definition, Em, H2, InlineCta, KeyFigure, List, MagLink, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('fr').mag;
const SIGNUP = localizePath('fr', '/signup');

export const toc: TocEntry[] = [
  { id: 'minimum', title: 'Le minimum, en théorie' },
  { id: 'avant', title: 'Ce qui passe avant la bourse' },
  { id: 'frais', title: 'Les frais, ennemis des petites sommes' },
  { id: 'diversifier', title: 'Diversifier avec peu' },
  { id: 'regulier', title: 'Investir chaque mois' },
  { id: 'enveloppe', title: 'Le bon compte' },
  { id: 'entrainement', title: 'Commencer à zéro euro' },
];

export default function Article() {
  return (
    <>
      <P>
        C’est souvent la première question, et elle en cache une autre. Combien faut-il pour <Em>ouvrir</Em> un
        compte ? Presque rien. Combien faut-il pour que l’expérience ait un sens, sans mettre en danger son budget ?
        Là, la réponse dépend moins d’un montant que de quelques règles simples, qui valent pour 100 € comme pour
        100 000 €.
      </P>

      <H2 id="minimum">Le minimum, en théorie : presque rien</H2>
      <P>
        Il n’existe aucun montant minimum légal pour investir en bourse. La plupart des courtiers en ligne ouvrent
        un compte sans dépôt imposé, et le seul vrai plancher est le prix d’une action, ou d’une part de fonds
        indiciel (ETF), qui se négocie souvent entre quelques euros et quelques centaines d’euros. Certains
        courtiers proposent même des <Em>fractions d’action</Em> : on peut acheter un dixième d’un titre trop cher.
      </P>
      <KeyFigure value="0 €">
        Le minimum légal pour investir en bourse. Le vrai minimum, c’est le prix d’un titre, et surtout ce que vous
        pouvez perdre sans que cela change votre vie.
      </KeyFigure>
      <P>
        Mais pouvoir commencer avec 20 € ne veut pas dire qu’il faut commencer n’importe comment. Trois questions
        comptent davantage que le montant : cet argent est-il vraiment disponible, combien vont coûter les frais, et
        comment éviter de tout miser sur une seule valeur ?
      </P>

      <H2 id="avant">Ce qui passe avant la bourse</H2>
      <P>
        La bourse est faite pour l’argent dont on n’aura pas besoin avant longtemps. Une action peut perdre 30 % en
        quelques mois, et il a parfois fallu des années pour qu’un marché retrouve son sommet. Si une dépense
        imprévue oblige à vendre au mauvais moment, la perte temporaire devient définitive.
      </P>
      <Definition term="Épargne de précaution">
        Une réserve d’argent disponible à tout moment, sur un livret ou un compte sans risque, pour faire face aux
        imprévus : panne, perte d’emploi, frais de santé. On conseille souvent l’équivalent de trois à six mois de
        dépenses.
      </Definition>
      <List>
        <li>
          <Em>Constituer d’abord son épargne de précaution.</Em> C’est elle qui permet de ne jamais vendre sous la
          contrainte.
        </li>
        <li>
          <Em>Rembourser ses crédits chers</Em>, comme un crédit renouvelable. Aucun placement n’offre de façon fiable
          un rendement supérieur à un taux d’emprunt de 15 ou 20 %.
        </li>
        <li>
          <Em>N’investir que l’argent dont on n’a pas besoin avant cinq ans au moins.</Em> Plus l’horizon est long,
          plus les mauvaises années ont le temps d’être compensées.
        </li>
        <li>
          <Em>Ne jamais emprunter pour investir</Em> quand on débute : l’effet de levier transforme les erreurs
          ordinaires en pertes irréversibles.
        </li>
      </List>

      <H2 id="frais">Les frais, ennemis des petites sommes</H2>
      <P>
        Avec un petit montant, ce ne sont pas les marchés qui menacent le plus votre rendement : ce sont les frais.
        Beaucoup de courtiers facturent un minimum par ordre, quel que soit le montant. Sur une petite somme, ce
        minimum pèse lourd.
      </P>
      <Table
        head={['Montant de l’ordre', 'Frais fixes de 2 €', 'Ce que le titre doit gagner pour rembourser l’achat et la revente']}
        rows={[
          ['50 €', '4 %', '≈ 8 %'],
          ['200 €', '1 %', '≈ 2 %'],
          ['1 000 €', '0,2 %', '≈ 0,4 %'],
          ['5 000 €', '0,04 %', '≈ 0,08 %'],
        ]}
      />
      <P>
        Exemple fictif, mais réaliste : avec 2 € par ordre, un achat de 50 € puis sa revente coûtent 4 €, soit 8 %
        de la mise. Il faut donc que le titre progresse de 8 % juste pour revenir à zéro. Avant d’ouvrir un compte,
        regardez la grille tarifaire, et préférez peu d’ordres, de taille raisonnable, à beaucoup de petits ordres.
      </P>

      <H2 id="diversifier">Diversifier avec peu d’argent</H2>
      <P>
        Avec 300 €, acheter dix actions différentes n’est souvent ni possible, ni rentable, à cause des frais. C’est
        justement là que les fonds indiciels sont utiles. Une seule part d’un{' '}
        <MagLink id="etf" locale="fr">
          ETF
        </MagLink>{' '}
        qui réplique un{' '}
        <MagLink id="indice" locale="fr">
          indice
        </MagLink>{' '}
        mondial donne accès, d’un coup, à plus d’un millier d’entreprises de dizaines de pays.
      </P>
      <P>
        À l’inverse, mettre toute une petite épargne sur une seule action « parce qu’elle monte » revient à parier
        sur une entreprise, pas à investir. Une société peut chuter de moitié sur une mauvaise nouvelle ; un indice
        large, rarement.
      </P>

      <ArchiveFigure
        name="bourse-paris-xixe"
        locale="fr"
        alt="Le palais de la Bourse de Paris, gravure du XIXe siècle"
        caption="Le palais Brongniart, siège de la Bourse de Paris de 1826 à 1987. Longtemps, investir y passait par un agent de change et des titres papier coûteux : les fonds indiciels ont rendu la diversification accessible à tous."
      />

      <H2 id="regulier">Investir un peu, mais chaque mois</H2>
      <P>
        Pour la plupart des épargnants, la régularité compte plus que le montant de départ. Verser une somme fixe
        chaque mois a deux avantages : on n’a pas à deviner le bon moment pour entrer, et on achète mécaniquement
        plus de parts quand les prix sont bas.
      </P>
      <Definition term="Investissement programmé">
        Investir une somme fixe à intervalle régulier, quel que soit le niveau du marché. On l’appelle aussi
        lissage, ou <Em>dollar cost averaging</Em> en anglais.
      </Definition>
      <KeyFigure value="≈ 20 300 €">
        Ce que deviendraient 50 € versés chaque mois pendant 20 ans (12 000 € au total), avec un rendement constant
        de 5 % par an, frais et impôts non compris. Un calcul théorique : les rendements réels varient d’une année à
        l’autre et ne sont jamais garantis.
      </KeyFigure>
      <P>
        La différence vient des <Em>intérêts composés</Em> : les gains de chaque année produisent à leur tour des
        gains. Plus on commence tôt, plus cet effet a le temps de jouer, même avec de petites sommes.
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Investir chaque mois ou tout d’un coup ? Testez les deux approches sur les cours réels.
      </InlineCta>

      <H2 id="enveloppe">Choisir le bon compte</H2>
      <P>
        Le type de compte change ce que vous gardez de vos gains. En France, le <Em>plan d’épargne en actions</Em>{' '}
        (PEA) permet d’investir dans des actions européennes et de nombreux ETF, jusqu’à 150 000 € de versements :
        après cinq ans, les gains sont exonérés d’impôt sur le revenu, seuls les prélèvements sociaux restant dus.
        Le <Em>compte-titres ordinaire</Em>, lui, donne accès à tous les marchés, mais les gains y sont imposés
        chaque année où vous vendez.
      </P>
      <P>
        Les règles fiscales évoluent et dépendent de votre situation : vérifiez-les auprès de sources officielles
        avant d’ouvrir un compte. Ailleurs, des comptes comparables existent, comme l’ISA au Royaume-Uni ou l’IRA aux
        États-Unis.
      </P>

      <H2 id="entrainement">Commencer à zéro euro</H2>
      <P>
        Il existe une façon de commencer sans rien risquer : s’entraîner. Un simulateur permet d’apprendre à passer
        des ordres, de sentir le poids des frais, de voir ce que fait une baisse de 20 % à un portefeuille trop
        concentré, et surtout de découvrir comment on réagit soi-même, avant que l’argent soit réel.
      </P>
      <P>
        Dans PastFolio, vous recevez 10 000 € fictifs et vous repartez d’une date du passé, sur les cours réels,
        sans jamais voir le lendemain. Une bonne façon de savoir, avant d’investir votre premier euro, si vous êtes
        plutôt du genre à tenir bon ou à tout vendre au premier orage. Et si vous avez déjà des bases, lisez aussi{' '}
        <MagLink id="avant-de-trader" locale="fr">
          ce qu’il faut savoir avant de commencer à trader
        </MagLink>
        .
      </P>
    </>
  );
}
