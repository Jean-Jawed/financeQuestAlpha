/**
 * FINANCEQUEST - UI COMPONENT: Modal
 * Composant Modal avec backdrop et animations
 */

'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/client';

// ==========================================
// TYPES
// ==========================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  const { m } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);

  // Sizes
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[#050b09]/80" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'certificate relative max-h-[calc(100vh-2rem)] w-full overflow-y-auto shadow-lift',
          'animate-rise',
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
            <h2 className="font-display text-2xl font-semibold text-paper">{title}</h2>
            <button
              onClick={onClose}
              className="text-paper-dim transition-colors hover:text-paper"
              aria-label={m.common.close}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ==========================================
// MODAL SUBCOMPONENTS
// ==========================================

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
      {children}
    </div>
  );
}
