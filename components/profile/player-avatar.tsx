/**
 * PASTFOLIO - COMPONENT: PlayerAvatar
 * Médaillon du joueur : avatar par défaut (Supabase Storage), sinon initiales
 * sur fond laiton (identifiant inconnu, image en erreur, pas d'avatar)
 */

'use client';

import { useState } from 'react';
import { avatarUrl, getAvatar } from '@/lib/profile/avatars';
import { initials } from '@/lib/profile/rules';
import { cn } from '@/lib/utils/cn';

interface PlayerAvatarProps {
  avatarId: string | null | undefined;
  /** Pseudo : initiales de secours */
  name: string;
  /** Côté en pixels */
  size?: number;
  /** Texte alternatif ; vide par défaut (le pseudo est affiché à côté) */
  alt?: string;
  className?: string;
}

export function PlayerAvatar({ avatarId, name, size = 32, alt = '', className }: PlayerAvatarProps) {
  const avatar = getAvatar(avatarId);
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = avatar !== null && failed !== avatar.id;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-3 ring-1 ring-brass/50',
        className
      )}
      style={{ width: size, height: size }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      {showImage ? (
        // Fichiers déjà en WebP 256 px, servis par Supabase avec un an de cache : pas de next/image
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl(avatar.id)}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(avatar.id)}
        />
      ) : (
        <span
          className="font-display font-semibold text-brass"
          style={{ fontSize: Math.max(10, Math.round(size * 0.4)) }}
        >
          {initials(name)}
        </span>
      )}
    </span>
  );
}
