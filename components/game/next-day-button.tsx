/**
 * FINANCEQUEST - COMPONENT: NextDayButton
 * Bouton pour avancer d'un jour avec timeline
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatDateDisplay } from '@/lib/utils/dates';

// ==========================================
// TYPES
// ==========================================

interface NextDayButtonProps {
  gameId: string;
  currentDate: string;
  startDate: string;
  onDayAdvanced: () => void;
}

// ==========================================
// COMPONENT
// ==========================================

export function NextDayButton({
  gameId,
  currentDate,
  startDate,
  onDayAdvanced,
}: NextDayButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleNextDay() {
    setLoading(true);

    try {
      const res = await fetch('/api/games/next-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de l\'avancement');
        setLoading(false);
        return;
      }

      // Afficher achievements débloqués
      if (data.data.achievementsUnlocked && data.data.achievementsUnlocked.length > 0) {
        data.data.achievementsUnlocked.forEach((achievement: any) => {
          toast.success(`🏆 Achievement débloqué: ${achievement.name} (+${achievement.points} pts)`, 5000);
        });
      }

      toast.success(data.message || 'Jour avancé');
      onDayAdvanced();
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  // Timeline progress
  const start = new Date(startDate);
  const current = new Date(currentDate);
  const today = new Date();
  const totalDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const progress = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;

  return (
    <Card variant="glass" className="bg-gradient-to-br from-cyan-900/20 to-slate-800/50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Date actuelle */}
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2">Date actuelle</p>
            <p className="text-3xl font-bold text-white">
              {formatDateDisplay(currentDate)}
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>{formatDateDisplay(startDate)}</span>
              <span>{formatDateDisplay(today.toISOString().split('T')[0])}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              {elapsedDays} / {totalDays} jours ({Math.round(progress)}%)
            </p>
          </div>

          {/* Bouton */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleNextDay}
            loading={loading}
          >
            Jour Suivant
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
