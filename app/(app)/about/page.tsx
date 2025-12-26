/**
 * FINANCEQUEST - PAGE: ABOUT
 * Présentation du jeu et de ses fonctionnalités
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Présentation - FinanceQuest',
  description: 'Découvrez FinanceQuest, le simulateur de trading historique en mode gaming',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            FinanceQuest
          </h1>
          <p className="text-xl text-slate-400">
            Simulation de trading historique en mode gaming
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 space-y-8">
          
          {/* Section 1: Concept */}
          <section>
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              🎮 Le Concept
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              FinanceQuest vous plonge dans le passé des marchés financiers pour vous permettre de tester vos stratégies de trading sans risque. Choisissez une date de départ historique et commencez votre partie avec 10 000$ virtuels.
            </p>
            <p className="text-slate-300 leading-relaxed">
              L'objectif ? Maximiser votre portfolio en achetant et vendant des actifs réels, en utilisant des données historiques authentiques des marchés financiers mondiaux.
            </p>
          </section>

          {/* Section 2: Mode Gaming */}
          <section>
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              ⚡ Mode Gaming Accéléré
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Contrairement au trading réel qui prend des mois, FinanceQuest vous permet d'<strong className="text-white">accélérer le temps</strong>. Avancez jour par jour à votre rythme et observez l'évolution de vos positions en quelques minutes.
            </p>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <p className="text-cyan-300 text-sm">
                💡 <strong>Astuce :</strong> Vous ne pouvez pas voyager dans le futur ! Votre partie s'arrête automatiquement à la date actuelle.
              </p>
            </div>
          </section>

          {/* Section 3: Actifs Disponibles */}
          <section>
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              📊 Plus de 240 Actifs Disponibles
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              Diversifiez votre portfolio avec une sélection variée d'actifs provenant des principaux marchés mondiaux :
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">📈 Actions US (90+)</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Tech : AAPL, MSFT, GOOGL, NVDA...</li>
                  <li>• Finance : JPM, GS, V, MA...</li>
                  <li>• Santé : JNJ, UNH, PFE...</li>
                  <li>• Énergie : XOM, CVX, COP...</li>
                  <li>• Et bien plus encore !</li>
                </ul>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">🇫🇷 Actions Françaises (50)</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• LVMH, L'Oréal, Hermès</li>
                  <li>• TotalEnergies, Sanofi, Air Liquide</li>
                  <li>• BNP Paribas, AXA, Société Générale</li>
                  <li>• Airbus, Safran, Schneider Electric</li>
                  <li>• LightOn, Capgemini, Dassault Systèmes</li>
                </ul>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">🇪🇺 Actions Européennes (50)</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Allemagne : Siemens, SAP, Volkswagen</li>
                  <li>• UK : Shell, BP, AstraZeneca</li>
                  <li>• Suisse : Nestlé, Roche, Novartis</li>
                  <li>• Pays-Bas : ASML, Philips, ING</li>
                  <li>• Espagne, Italie, Suède, Danemark...</li>
                </ul>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-2">📉 Indices & Obligations (40)</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• S&P 500, Dow Jones, NASDAQ, CAC 40</li>
                  <li>• DAX, FTSE 100, Nikkei 225</li>
                  <li>• US Treasury (5Y, 10Y, 30Y)</li>
                  <li>• ETFs obligataires et marchés émergents</li>
                </ul>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-yellow-500/30 md:col-span-2">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">⏳ Bientôt Disponible</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Cryptomonnaies (BTC, ETH...)</li>
                  <li>• Matières premières (Or, Pétrole...)</li>
                  <li>• Options & produits dérivés</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Fonctionnalités */}
          <section>
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              ⚙️ Fonctionnalités Clés
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Positions Long</h3>
                  <p className="text-slate-400 text-sm">Achetez des actifs et profitez de leur hausse</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📉</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Ventes à Découvert</h3>
                  <p className="text-slate-400 text-sm">Pariez sur la baisse des prix (short selling)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">💎</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Historique 30 Jours</h3>
                  <p className="text-slate-400 text-sm">Analysez les tendances avant de trader</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Classement Global</h3>
                  <p className="text-slate-400 text-sm">Comparez vos performances avec d'autres joueurs</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Achievements</h3>
                  <p className="text-slate-400 text-sm">Débloquez des badges en progressant</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Données Réelles</h3>
                  <p className="text-slate-400 text-sm">Prix historiques authentiques via MarketStack</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Préparation */}
          <section>
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              🚀 Échauffement en Conditions Réelles
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              FinanceQuest est l'outil idéal pour vous préparer avant de vous lancer dans le trading réel. Testez vos stratégies, apprenez de vos erreurs, et gagnez en confiance sans risquer un centime.
            </p>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-purple-300 text-sm">
                🎓 <strong>Parfait pour :</strong> Débutants souhaitant apprendre le trading, investisseurs voulant tester de nouvelles stratégies, ou simplement s'amuser avec les marchés financiers !
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center pt-6 border-t border-slate-700">
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold rounded-lg text-lg hover:from-cyan-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Commencer à Jouer 🎮
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>FinanceQuest est un jeu éducatif. Les performances passées ne garantissent pas les résultats futurs.</p>
        </div>
      </div>
    </div>
  );
}