/**
 * FINANCEQUEST - TYPES: parties de groupe (réponses de l'API, panneau du groupe)
 */

import type { GroupMode, GroupStatus, GroupTempo } from '@/lib/game/groups';

export interface GroupStanding {
  rank: number;
  userId: string;
  name: string;
  isYou: boolean;
  /** Date de l'instantané affiché (au plus tard celle du joueur qui regarde) */
  date: string;
  /** Le concurrent est plus loin dans le temps que vous */
  ahead: boolean;
  totalValue: number;
  returnPercentage: number;
  ordersCount: number;
  openPositions: number;
  status: 'playing' | 'finished' | 'eliminated' | 'abandoned';
  /** Course : objectif atteint en ce nombre de séances */
  reachedIn: number | null;
  /** Synchro : prêt pour la séance suivante */
  ready: boolean;
}

export interface GroupMessageView {
  id: number;
  name: string;
  body: string;
  createdAt: string;
  isYou: boolean;
}

export interface GroupView {
  group: {
    id: string;
    code: string;
    name: string;
    mode: GroupMode;
    tempo: GroupTempo;
    scenario: string;
    currency: string;
    startDate: string;
    sessionsTarget: number;
    targetReturn: number | null;
    eliminationEvery: number | null;
    syncTimeoutHours: number | null;
    maxPlayers: number;
    status: GroupStatus;
    syncDate: string | null;
    isOwner: boolean;
    playersCount: number;
  };
  viewer: {
    gameId: string;
    date: string;
    sessionsPlayed: number;
    status: 'active' | 'paused' | 'completed';
    ready: boolean;
  };
  standings: GroupStanding[];
  /** Du plus ancien au plus récent */
  messages: GroupMessageView[];
  sync: { readyCount: number; total: number; deadline: string | null } | null;
}
