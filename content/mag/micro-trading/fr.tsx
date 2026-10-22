/**
 * LA GAZETTE - Les algorithmes de micro-trading, expliqués simplement (français)
 */

import { Definition, Em, H2, H3, InlineCta, KeyFigure, List, P, Table } from '@/components/mag/prose';
import { getSiteMessages } from '@/lib/i18n/messages';
import { localizePath } from '@/lib/i18n/paths';
import type { TocEntry } from '../index';

const mag = getSiteMessages('fr').mag;
const SIGNUP = localizePath('fr', '/signup');

export const toc: TocEntry[] = [
  { id: 'definition', title: 'De quoi parle-t-on ?' },
  { id: 'latence', title: 'La course à la microseconde' },
  { id: 'strategies', title: 'Les grandes familles de stratégies' },
  { id: 'effets', title: 'Ce qu’ils changent pour les autres' },
  { id: 'chez-soi', title: 'Et chez soi ?' },
  { id: 'lecons', title: 'Ce qu’un joueur peut en retenir' },
];

export default function Article() {
  return (
    <>
      <P>
        Le micro-trading désigne les stratégies qui passent un très grand nombre d’ordres, sur des durées très
        courtes, pour gagner une infime somme à chaque fois. Ces ordres sont décidés et envoyés par des
        algorithmes, en quelques microsecondes, sans intervention humaine. Aux États-Unis, ce trading à haute
        fréquence représente selon les estimations environ la moitié des volumes échangés sur les actions.
      </P>

      <H2 id="definition">De quoi parle-t-on ?</H2>
      <P>
        Le terme recouvre plusieurs réalités, qu’il est utile de distinguer.
      </P>
      <List>
        <li>
          <Em>Le trading algorithmique</Em> : tout ordre décidé ou exécuté par un programme. Un fonds qui découpe
          automatiquement un gros ordre en petits morceaux en fait partie, même s’il garde ses titres des années.
        </li>
        <li>
          <Em>Le trading à haute fréquence</Em> (THF, ou HFT en anglais) : une forme extrême du précédent, où la
          vitesse est l’avantage principal. Les positions durent de quelques millisecondes à quelques minutes, et
          sont presque toujours soldées avant la fin de la journée.
        </li>
        <li>
          <Em>Le scalping</Em> : la version « humaine » de l’idée, qui consiste à prendre de très petits gains
          répétés. Pratiqué par des particuliers, il se fait à l’échelle de la seconde ou de la minute, pas de la
          microseconde.
        </li>
      </List>
      <Definition term="Microseconde">
        Un millionième de seconde. Un clignement d’œil dure environ 100 000 microsecondes : le temps, pour un
        algorithme rapide, de réagir des milliers de fois.
      </Definition>

      <H2 id="latence">La course à la microseconde</H2>
      <P>
        Pour ces stratégies, arriver le premier est tout. Le délai entre le moment où une information apparaît et
        celui où l’ordre atteint la Bourse s’appelle la <Em>latence</Em>, et les sociétés de trading dépensent des
        fortunes pour la réduire.
      </P>
      <H3>La colocation</H3>
      <P>
        Les Bourses louent des emplacements dans leurs propres centres de données, à quelques mètres des
        ordinateurs qui rapprochent les ordres. Chaque mètre de câble compte : la lumière parcourt environ
        20 centimètres par nanoseconde dans une fibre optique. Les opérateurs sérieux égalisent d’ailleurs les
        longueurs de câble entre clients, pour que personne ne soit avantagé par sa place dans la salle.
      </P>
      <H3>Les liaisons entre places</H3>
      <P>
        En 2010, une société a creusé une ligne de fibre optique presque droite entre Chicago, où se négocient les
        contrats à terme, et la région de New York, où se négocient les actions. Coût estimé : environ
        300 millions de dollars, pour gagner quelques millisecondes sur l’aller-retour, autour de 13. Quelques
        années plus tard, des réseaux de tours à micro-ondes l’ont battue : dans l’air, les ondes voyagent environ
        moitié plus vite que la lumière dans le verre, et l’aller-retour est tombé autour de 8 millisecondes.
      </P>
      <Table
        head={['Délai', 'Ordre de grandeur']}
        rows={[
          ['Réaction d’un humain', '200 000 µs (0,2 s)'],
          ['Connexion internet d’un particulier vers une Bourse', '10 000 à 50 000 µs'],
          ['Aller-retour Chicago – New York par micro-ondes', 'environ 8 000 µs'],
          ['Décision d’un algorithme en colocation', 'quelques µs'],
        ]}
      />
      <P>
        Pour descendre encore, les algorithmes les plus rapides ne tournent plus sur des processeurs classiques,
        mais sur des circuits programmables (FPGA) qui réagissent directement aux données reçues par le réseau.
      </P>

      <H2 id="strategies">Les grandes familles de stratégies</H2>
      <H3>La tenue de marché</H3>
      <P>
        C’est la stratégie la plus répandue. Le teneur de marché affiche en permanence un prix d’achat et un prix
        de vente un peu plus élevé. Chaque fois qu’un acheteur et un vendeur passent par lui, il empoche l’écart,
        la fourchette : souvent une fraction de centime par action, multipliée par des millions d’échanges. Son
        risque principal : accumuler des titres juste avant que le cours ne baisse, face à quelqu’un de mieux
        informé.
      </P>
      <H3>L’arbitrage statistique</H3>
      <P>
        Certains actifs évoluent généralement ensemble : deux grandes entreprises du même secteur, un indice et les
        titres qui le composent, un fonds indiciel coté et son panier. Quand leur écart s’éloigne de son niveau
        habituel, l’algorithme vend le plus cher, achète le moins cher, et attend que l’écart se referme. Le pari
        n’est pas sans risque : un écart peut aussi refléter un vrai changement.
      </P>
      <H3>L’arbitrage de latence</H3>
      <P>
        Une même action se négocie sur plusieurs plateformes. Quand son prix bouge sur l’une, les autres mettent
        quelques microsecondes à suivre. L’algorithme le plus rapide peut acheter là où le prix n’a pas encore
        monté, juste avant qu’il ne monte. C’est la stratégie la plus contestée, parce qu’elle profite d’un retard
        technique plutôt que d’une analyse.
      </P>
      <H3>Le momentum de très court terme et la lecture des nouvelles</H3>
      <P>
        D’autres programmes repèrent les déséquilibres du carnet d’ordres ou analysent les dépêches et les
        publications officielles en quelques microsecondes, pour se placer dans le sens du mouvement qui s’amorce.
      </P>
      <H3>L’exécution algorithmique</H3>
      <P>
        Ce n’est pas du trading à haute fréquence, mais c’en est le cousin. Un fonds qui doit acheter des millions
        d’actions ne peut pas le faire d’un coup sans faire monter le prix contre lui. Ses algorithmes découpent
        donc l’ordre : en tranches égales dans le temps (<Em>TWAP</Em>, prix moyen pondéré par le temps) ou en
        suivant les volumes habituels de la journée (<Em>VWAP</Em>, prix moyen pondéré par les volumes).
      </P>

      <InlineCta href={SIGNUP} label={mag.ctaInlineLabel} button={mag.ctaInlineButton}>
        Écrivez vos propres règles, et testez-les séance après séance sur les cours réels.
      </InlineCta>

      <H2 id="effets">Ce que ces algorithmes changent pour les autres</H2>
      <P>
        Le bilan est partagé. D’un côté, la concurrence entre teneurs de marché électroniques a fortement réduit
        les fourchettes sur les grandes valeurs : acheter ou vendre coûte bien moins cher qu’à l’époque des
        corbeilles. De l’autre, cette liquidité peut disparaître d’un coup, au moment où on en a le plus besoin.
      </P>
      <KeyFigure value="6 mai 2010">
        Le « krach éclair » : en quelques minutes, le Dow Jones perd près de 1 000 points, environ 9 %, avant de
        se reprendre presque aussitôt. Des actions s’échangent un instant à un centime.
      </KeyFigure>
      <P>
        Le rapport des autorités américaines a identifié un déclencheur : un très gros ordre de vente de contrats à
        terme sur l’indice S&amp;P 500, environ 4 milliards de dollars, confié à un algorithme d’exécution qui
        vendait sans tenir compte du prix. Les algorithmes à haute fréquence ont d’abord absorbé ces ventes, puis se
        sont revendu les contrats entre eux, avant de se retirer en masse. En 2016, un trader britannique a en
        outre plaidé coupable de manipulation par <Em>spoofing</Em> (passer des ordres qu’on n’a pas l’intention
        d’exécuter), une pratique accusée d’avoir aggravé la chute.
      </P>
      <P>
        Un algorithme peut aussi se tromper tout seul. Le 1er août 2012, un logiciel mal déployé chez Knight
        Capital, l’un des plus grands teneurs de marché américains, a envoyé des millions d’ordres non voulus :
        environ 440 millions de dollars de pertes en 45 minutes. La société a dû être rachetée.
      </P>
      <P>
        Depuis, les règles se sont durcies. En Europe, la directive MiFID II impose depuis 2018 aux acteurs du
        trading à haute fréquence d’être agréés, de tester leurs algorithmes, de pouvoir les couper instantanément
        et de conserver la trace de leurs ordres. Les Bourses suspendent automatiquement la cotation d’une valeur
        dont le prix s’emballe.
      </P>

      <H2 id="chez-soi">Peut-on faire du micro-trading chez soi ?</H2>
      <P>
        Pas au sens propre. Un particulier part avec un retard de plusieurs dizaines de millisecondes, des milliers
        de fois plus que les acteurs en colocation : à cette échelle, il arrive toujours après les autres. Trois
        obstacles s’ajoutent :
      </P>
      <List>
        <li>
          <Em>Les frais</Em> : un gain moyen d’une fraction de centime par action ne couvre jamais des frais de
          courtage de particulier.
        </li>
        <li>
          <Em>Les données</Em> : les flux de cotations complets et rapides coûtent cher, et les données gratuites
          arrivent avec du retard.
        </li>
        <li>
          <Em>Le surapprentissage</Em> : une stratégie testée sur le passé peut sembler miraculeuse simplement
          parce qu’elle a été ajustée, sans le savoir, aux hasards de cette période précise.
        </li>
      </List>
      <P>
        Les plateformes qui promettent des « robots de trading » gagnants à installer chez soi méritent donc la
        plus grande méfiance.
      </P>

      <H2 id="lecons">Ce qu’un joueur peut en retenir</H2>
      <P>
        Sans viser la microseconde, les sociétés de trading algorithmique pratiquent une discipline dont tout
        investisseur peut s’inspirer.
      </P>
      <List ordered>
        <li>Des règles écrites à l’avance : quand entrer, quand sortir, combien engager.</li>
        <li>Une limite de perte par position et par jour, respectée sans exception.</li>
        <li>Un test des règles sur des données historiques, en se méfiant des résultats trop beaux.</li>
        <li>Un suivi des coûts : frais et fourchettes changent souvent un gain en perte.</li>
        <li>Un journal des ordres, relu à froid pour comprendre ce qui a marché, ou non.</li>
      </List>
      <P>
        C’est exactement l’usage d’un simulateur sur cours historiques. Dans FinanceQuest, vous appliquez vos règles
        séance par séance, sans connaître le lendemain, et vous voyez ce qu’elles donnent sur le marché réel de
        l’époque, frais compris.
      </P>
    </>
  );
}
