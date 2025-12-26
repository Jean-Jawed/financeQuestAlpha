// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex-1">
        {/* Logo centré en haut */}
        <div className="flex justify-center pt-12 pb-6">
          <Image
            src="/logo_complet_gris.jpg"
            alt="FinanceQuest"
            width={400}
            height={120}
            priority
            className="object-contain"
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4 justify-center pb-12">
          <Link
            href="/about"
            className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-purple-500/50"
          >
            Découvrir
          </Link>
          <Link
            href="/signup"
            className="px-8 py-4 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors shadow-lg hover:shadow-cyan-500/50"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
          >
            Connexion
          </Link>
        </div>

        {/* Section split gauche/droite */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
            {/* Gauche - Image courbe */}
            <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
              <Image
                src="/courbe_fond_vert.png"
                alt="Graphique de trading"
                fill
                className="object-contain"
              />
            </div>

            {/* Droite - Texte de présentation */}
            <div className="space-y-6 text-white">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Maîtrisez le trading avec des données réelles
              </h1>
              
              <p className="text-lg text-slate-300">
                FinanceQuest vous permet de simuler vos investissements avec des données historiques authentiques. 
                Testez vos stratégies, apprenez de vos erreurs, progressez sans risque.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-lg">Plus de 240 actifs disponibles</h3>
                    <p className="text-slate-400">Actions, indices et obligations avec leurs prix authentiques</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-lg">Progression jour par jour</h3>
                    <p className="text-slate-400">Avancez à votre rythme et observez l'évolution de votre portefeuille</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-lg">Système d'achievements</h3>
                    <p className="text-slate-400">Débloquez des récompenses et suivez votre progression</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}