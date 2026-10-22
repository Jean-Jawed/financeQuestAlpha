/**
 * FINANCEQUEST - COMPONENT: ProfileMissing
 * Affiché quand le compte Supabase Auth existe mais pas le profil (public.users)
 * Remplace l'ancienne redirection vers /login, qui bouclait avec le middleware
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/client';

// ==========================================
// COMPONENT
// ==========================================

export function ProfileMissing() {
  const { m, href } = useI18n();
  const t = m.dashboard.profileMissing;
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      // Rechargement complet : le proxy relit les cookies de session
      window.location.href = href('/login');
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card variant="certificate" className="w-full max-w-md">
        <CardHeader>
          <p className="label text-center text-loss">{t.label}</p>
          <CardTitle className="mt-2 text-center text-3xl">{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-paper-dim">{t.text}</p>
          <Button variant="primary" className="w-full" onClick={handleLogout} loading={loading}>
            {m.nav.logout}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
