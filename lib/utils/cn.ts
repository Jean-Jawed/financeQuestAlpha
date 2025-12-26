/**
 * FINANCEQUEST - UTILITY: cn (classNames merge)
 * Utilitaire pour merger des classes Tailwind avec clsx + tailwind-merge
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merger des classes Tailwind en évitant les conflits
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // → 'py-1 px-4' (px-2 overridden)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
