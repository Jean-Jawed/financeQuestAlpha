/**
 * FINANCEQUEST - COMPONENT: CreateGameCard
 * Card pour créer une nouvelle partie avec modal
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ==========================================
// COMPONENT
// ==========================================

export function CreateGameCard() {
  const router = useRouter();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Date min/max
  const minDate = '2020-01-01';
  const maxDate = new Date().toISOString().split('T')[0];

  async function handleCreateGame() {
    if (!startDate) {
      toast.error('Veuillez sélectionner une date de départ');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la création');
        setLoading(false);
        return;
      }

      toast.success('Partie créée avec succès !');
      setIsModalOpen(false);
      router.refresh(); // Recharger la page pour afficher la nouvelle partie
    } catch (error) {
      toast.error('Erreur réseau');
      setLoading(false);
    }
  }

  return (
    <>
      <Card
        variant="glass"
        hover
        className="bg-gradient-to-br from-cyan-900/30 to-purple-900/20 border-cyan-500/30 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <svg
                className="w-8 h-8 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-2xl">Nouvelle Partie</CardTitle>
              <CardDescription>Commencez une nouvelle simulation</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Capital initial : 10 000€
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              105 actifs disponibles
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Données historiques réelles
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !loading && setIsModalOpen(false)}
        title="Créer une nouvelle partie"
        size="md"
      >
        <div className="space-y-6">
          <p className="text-slate-300">
            Choisissez une date de départ entre 2020 et aujourd'hui. Vous commencerez avec 10 000€
            de capital et pourrez progresser jour par jour avec des données de marché réelles.
          </p>

          <Input
            type="date"
            label="Date de départ"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={minDate}
            max={maxDate}
            disabled={loading}
            helperText="La partie commencera à cette date avec les prix historiques réels"
          />

          {loading && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <LoadingSpinner size="sm" />
                <div>
                  <p className="text-cyan-400 font-medium">Préparation des données...</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Chargement des prix historiques pour 105 actifs
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleCreateGame} loading={loading} disabled={!startDate}>
            Créer la partie
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
