/**
 * FINANCEQUEST - COMPONENT: WelcomeCard
 * Card de bienvenue avec stats globales
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

// ==========================================
// TYPES
// ==========================================

interface WelcomeCardProps {
  gamesPlayed: number;
  achievementsUnlocked: number;
}

// ==========================================
// COMPONENT
// ==========================================

export function WelcomeCard({ gamesPlayed, achievementsUnlocked }: WelcomeCardProps) {
  const { user } = useAuth();

  return (
    <Card variant="glass" className="bg-gradient-to-br from-cyan-900/20 to-slate-800/50">
      <CardHeader>
        <CardTitle className="text-3xl">
          Bonjour, <span className="text-cyan-400">{user?.name}</span> 👋
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Parties jouées */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Parties jouées
            </div>
            <p className="text-3xl font-bold text-white">{gamesPlayed}</p>
          </div>

          {/* Achievements débloqués */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Achievements
            </div>
            <p className="text-3xl font-bold text-white">{achievementsUnlocked}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
