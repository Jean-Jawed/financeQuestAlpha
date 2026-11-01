/**
 * PASTFOLIO - COMPONENT: AvatarPicker
 * Galerie des avatars par défaut : filtres par style et par catégorie,
 * aperçu de l'avatar sélectionné, puis validation
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PlayerAvatar } from './player-avatar';
import { AVATAR_CATEGORIES, AVATAR_STYLES, AVATARS, getAvatar, type AvatarCategory, type AvatarStyle } from '@/lib/profile/avatars';
import { useI18n } from '@/lib/i18n/client';
import { cn } from '@/lib/utils/cn';

interface AvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Avatar actuel (présélectionné) */
  value: string | null;
  name: string;
  onChoose: (avatarId: string) => void;
}

const CHIP = 'shrink-0 rounded-full border px-3 py-1 font-label text-xs font-semibold uppercase tracking-label transition-colors';

export function AvatarPicker({ isOpen, onClose, value, name, onChoose }: AvatarPickerProps) {
  const { m, locale } = useI18n();
  const t = m.profile.picker;

  const [style, setStyle] = useState<AvatarStyle | null>(null);
  const [category, setCategory] = useState<AvatarCategory | null>(null);
  const [selected, setSelected] = useState<string | null>(value);

  // À chaque ouverture : repartir de l'avatar actuel
  useEffect(() => {
    if (isOpen) setSelected(value);
  }, [isOpen, value]);

  const visible = useMemo(
    () => AVATARS.filter((avatar) => (!style || avatar.style === style) && (!category || avatar.category === category)),
    [style, category]
  );
  const preview = getAvatar(selected);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.title} size="xl">
      <div className="space-y-4">
        <div role="group" aria-label={t.styleFilter} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {[null, ...AVATAR_STYLES].map((option) => (
            <button
              key={option ?? 'all'}
              type="button"
              aria-pressed={style === option}
              onClick={() => setStyle(option)}
              className={cn(
                CHIP,
                style === option ? 'border-brass bg-brass/15 text-brass' : 'border-line text-paper-dim hover:text-paper'
              )}
            >
              {option ? t.styles[option] : t.all}
            </button>
          ))}
        </div>

        <div role="group" aria-label={t.categoryFilter} className="flex flex-wrap gap-2">
          {[null, ...AVATAR_CATEGORIES].map((option) => (
            <button
              key={option ?? 'all'}
              type="button"
              aria-pressed={category === option}
              onClick={() => setCategory(option)}
              className={cn(
                CHIP,
                category === option ? 'border-brass bg-brass/15 text-brass' : 'border-line text-paper-dim hover:text-paper'
              )}
            >
              {option ? t.categories[option] : t.all}
            </button>
          ))}
        </div>

        <ul className="grid max-h-[46vh] grid-cols-4 gap-2 overflow-y-auto rounded border border-line bg-ink p-2 sm:grid-cols-6 md:grid-cols-8">
          {visible.map((avatar) => {
            const active = avatar.id === selected;
            return (
              <li key={avatar.id}>
                <button
                  type="button"
                  onClick={() => setSelected(avatar.id)}
                  onDoubleClick={() => onChoose(avatar.id)}
                  aria-pressed={active}
                  title={avatar.label[locale]}
                  className={cn(
                    'block w-full rounded-full p-0.5 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-brass',
                    active ? 'scale-105 ring-2 ring-brass' : 'hover:scale-105'
                  )}
                >
                  <PlayerAvatar avatarId={avatar.id} name={name} size={72} alt={avatar.label[locale]} className="!h-auto !w-full aspect-square" />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col items-center gap-4 border-t border-line pt-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <PlayerAvatar avatarId={selected} name={name} size={56} />
            <p className="font-display text-lg italic text-paper">{preview?.label[locale] ?? '—'}</p>
          </div>
          <Button type="button" disabled={!selected} onClick={() => selected && onChoose(selected)}>
            {t.choose}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
