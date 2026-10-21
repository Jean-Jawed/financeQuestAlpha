/**
 * FINANCEQUEST - PAGE: Admin Monitoring
 * /admin/monitoring
 * Réservé aux comptes ayant le rôle `admin` (vérifié côté serveur)
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import type { MonitoringData } from '@/types/api';

// ==========================================
// PAGE
// ==========================================

export default function AdminMonitoringPage() {
  const { toast } = useToast();

  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const fetchMonitoring = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/admin/monitoring');

      if (res.status === 401 || res.status === 403) {
        setForbidden(true);
        return;
      }

      const response = await res.json();

      if (!res.ok) {
        toast.error(response.error || 'Erreur lors du chargement');
        return;
      }

      setData(response.data);
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMonitoring();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Access denied
  if (forbidden) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <Card variant="glass" className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">🔒 Accès refusé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-center">
              Cette page est réservée aux administrateurs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // No data
  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🔧 Admin Monitoring</h1>
            <p className="text-slate-400">Statistiques système et monitoring</p>
          </div>
          <Button onClick={fetchMonitoring} disabled={loading}>
            Actualiser
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white mb-2">{data.users.total}</p>
              <p className="text-sm text-slate-400">{data.users.active} actifs (30j)</p>
            </CardContent>
          </Card>

          {/* Games */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Parties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white mb-2">{data.games.total}</p>
              <p className="text-sm text-slate-400">{data.games.active} actives</p>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white mb-2">
                {data.transactions.total.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">ordres exécutés</p>
            </CardContent>
          </Card>

          {/* Assets */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white mb-2">{data.prices.assetsActive}</p>
              <p className="text-sm text-slate-400">
                actifs sur {data.prices.assetsTotal} au catalogue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Prices DB */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Base de prix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Première date</span>
              <span className="font-semibold text-white">{data.prices.oldestDate || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dernière date</span>
              <span className="font-semibold text-white">{data.prices.newestDate || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lignes de prix</span>
              <span className="font-semibold text-white">
                {data.prices.totalRows.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dernier import</span>
              <span className="font-semibold text-white">
                {data.prices.lastDataUpdate || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
