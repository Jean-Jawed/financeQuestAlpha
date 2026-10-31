/**
 * FINANCEQUEST - PAGE: Admin Kit
 * /[locale]/admin/kit : recette de la boîte à outils « salle des machines »
 * (cadres, plaques, médaillons, instruments), en largeur bureau et téléphone
 * Réservé aux comptes ayant le rôle `admin`
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { checkAdmin } from '@/lib/auth/session';
import { KitView } from '@/components/machine/kit-view';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Boîte à outils', robots: { index: false } };

export default async function AdminKitPage() {
  if ((await checkAdmin()) !== 'ok') notFound();
  return <KitView />;
}
