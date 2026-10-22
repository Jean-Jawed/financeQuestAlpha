/**
 * FINANCEQUEST - ADRESSE INCONNUE
 * Toute adresse sans page sous /fr ou /en : page 404 dans la bonne langue
 */

import { notFound } from 'next/navigation';

export default function CatchAll() {
  notFound();
}
