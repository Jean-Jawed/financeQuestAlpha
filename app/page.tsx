// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/backgrounds/background.png"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Overlay sombre + blur (moins intense) */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>

      {/* Contenu */}
      <div className="relative flex flex-col min-h-screen">

        {/* HERO CENTER */}
        <div className="flex flex-col items-center justify-center flex-1 px-4">

          {/* Carte centrale */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/logo_complet_gris.jpg"
                alt="FinanceQuest"
                width={320}
                height={100}
                priority
                className="object-contain"
              />
            </div>

            {/* Titre */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Deviens maître des marchés
            </h1>

            {/* Sous-texte */}
            <p className="text-slate-300 mb-8">
              Simule tes investissements, teste tes stratégies et progresse sans risque.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/about"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg hover:shadow-purple-500/50"
              >
                Découvrir
              </Link>

              <Link
                href="/signup"
                className="px-8 py-4 bg-cyan-500 text-white rounded-xl font-bold text-lg hover:bg-cyan-400 transition transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
              >
                Commencer gratuitement
              </Link>

              <Link
                href="/login"
                className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition"
              >
                Connexion
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION BAS (conservée mais allégée visuellement) */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">

            {/* Image */}
            <div className="relative h-[300px] md:h-[400px]">
              <Image
                src="/courbe_fond_vert.png"
                alt="Graphique de trading"
                fill
                className="object-contain opacity-80"
              />
            </div>

            {/* Texte */}
            <div className="space-y-6 text-white">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Apprends à investir intelligemment
              </h2>

              <p className="text-slate-300">
                Entraîne-toi avec des données historiques réelles et développe tes stratégies sans aucun risque financier.
              </p>

              <div className="space-y-4">

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 bg-cyan-400 rounded-full"></div>
                  <p className="text-slate-300">
                    +240 actifs disponibles (actions, indices, obligations)
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 bg-cyan-400 rounded-full"></div>
                  <p className="text-slate-300">
                    Simulation réaliste avec progression jour par jour
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 bg-cyan-400 rounded-full"></div>
                  <p className="text-slate-300">
                    Système d'achievements et progression
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}