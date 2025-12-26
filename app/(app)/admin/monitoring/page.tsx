/**
 * FINANCEQUEST - PAGE: Admin Monitoring
 * /admin/monitoring
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { MonitoringData } from '@/types/api';

// ==========================================
// PAGE
// ==========================================

export default function AdminMonitoringPage() {
  const { toast } = useToast();

  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMonitoring() {
    setLoading(true);

    try {
      const res = await fetch('/api/admin/monitoring');
      const response = await res.json();

      if (!res.ok) {
        toast.error(response.error || 'Erreur lors du chargement');
        setLoading(false);
        return;
      }

      setData(response.data);
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMonitoring();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate API usage percentage
  const apiUsagePercent = ((100 - data.api.marketStackRemaining) / 100) * 100;
  const apiUsageVariant =
    apiUsagePercent < 50 ? 'success' : apiUsagePercent < 80 ? 'warning' : 'danger';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🔧 Admin Monitoring</h1>
            <p className="text-slate-400">Statistiques système et monitoring</p>
          </div>
          <Button onClick={fetchMonitoring}>
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
              <p className="text-sm text-slate-400">{data.users.active} actifs</p>
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

          {/* Cache Records */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Cache</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white mb-2">
                {data.cache.totalRecords.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">
                {data.cache.uniqueSymbols} symboles
              </p>
            </CardContent>
          </Card>

          {/* API Remaining */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">API MarketStack</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white mb-2">
                {data.api.marketStackRemaining}
              </p>
              <p className="text-sm text-slate-400">requêtes restantes</p>
              <Badge variant={apiUsageVariant} size="sm" className="mt-2">
                {apiUsagePercent.toFixed(0)}% utilisé
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Database */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Base de Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Taille totale</span>
                <span className="font-semibold text-white">{data.database.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cache records</span>
                <span className="font-semibold text-white">
                  {data.database.cacheRecords.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taille cache estimée</span>
                <span className="font-semibold text-white">
                  {data.database.estimatedSizeMB.toFixed(2)} MB
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cache Details */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Détails Cache</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Symboles uniques</span>
                <span className="font-semibold text-white">{data.cache.uniqueSymbols}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date la plus ancienne</span>
                <span className="font-semibold text-white">
                  {data.cache.oldestDate || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date la plus récente</span>
                <span className="font-semibold text-white">
                  {data.cache.newestDate || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warnings */}
        {apiUsagePercent > 80 && (
          <div className="mt-6">
            <Card variant="glass" className="border-red-500/50 bg-red-900/20">
              <CardContent className="pt-6">
                <p className="text-red-400 font-semibold">
                  ⚠️ Attention : Plus de 80% du quota API MarketStack utilisé !
                </p>
                <p className="text-sm text-red-300 mt-2">
                  Restant: {data.api.marketStackRemaining}/{data.api.marketStackLimit} requêtes ce mois
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
