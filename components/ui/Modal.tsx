/**
 * Modal — IA-Retro-Glassmorphism design system
 *
 * A fully accessible, animated modal with:
 *   - backdrop-blur-xl overlay
 *   - glass panel (border-white/20)
 *   - neon-orange title glow
 *   - Framer Motion AnimatePresence transitions
 *   - focus trap via aria + autoFocus sentinel
 *   - three sizes: sm | md | lg | fullscreen
 *
 * Usage:
 *   <Modal open={open} onClose={() => setOpen(false)} title="Item Details">
 *     <p>Content here</p>
 *   </Modal>
 */

import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// ── Types ─────────────────────────────────────────────────────────────────────
export type ModalSize = 'sm' | 'md' | 'lg' | 'fullscreen';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  size?: ModalSize;
  /** Prevent closing when clicking the backdrop */
  persistent?: boolean;
  /** Extra classes on the panel */
  className?: string;
  /** Content */
  children: React.ReactNode;
  /** Footer row, rendered below children */
  footer?: React.ReactNode;
}

// ── Size map ──────────────────────────────────────────────────────────────────
const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm w-full',
  md: 'max-w-2xl w-full',
  lg: 'max-w-5xl w-full',
  fullscreen: 'w-full h-full max-w-full max-h-full rounded-none',
};

// ── Framer Motion variants ────────────────────────────────────────────────────
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 340, damping: 28, mass: 0.9 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 16,
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
};

// ── Close icon ────────────────────────────────────────────────────────────────
const CloseIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  persistent = false,
  className = '',
  children,
  footer,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Keyboard handling ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) onClose();
    },
    [onClose, persistent],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  // ── Focus: move to panel when opened ──────────────────────────────────────
  useEffect(() => {
    if (open) {
      // Small delay so the animation has started before we steal focus
      const t = setTimeout(() => panelRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const panelClasses = [
    // Glass base
    'relative flex flex-col',
    'backdrop-blur-xl',
    'bg-white/10 dark:bg-gray-900/70',
    'border border-white/20 dark:border-white/10',
    'shadow-glass',
    'rounded-2xl',
    'max-h-[90vh]',
    // Sepia theme
    'sepia:bg-sepia-50/90 sepia:border-sepia-300/50',
    // Neon orange accent on the top edge
    'before:absolute before:inset-x-6 before:top-0 before:h-px',
    'before:bg-gradient-to-r before:from-transparent before:via-ia-500/60 before:to-transparent',
    sizeMap[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={persistent ? undefined : onClose}
          aria-modal="true"
          role="dialog"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Dim layer */}
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" aria-hidden="true" />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={panelClasses}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            // Focus trap sentinel
            tabIndex={-1}
            style={{ outline: 'none' }}
          >
            {/* Header */}
            {(title || true) && (
              <div className="flex items-start justify-between gap-4 p-6 pb-4 flex-shrink-0">
                <div className="min-w-0">
                  {title && (
                    <h2
                      id="modal-title"
                      className={[
                        'text-xl font-bold leading-tight truncate',
                        'text-gray-900 dark:text-white sepia:text-sepia-900',
                        // Neon orange title glow in dark / retro mode
                        'dark:drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]',
                      ].join(' ')}
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="mt-1 text-sm text-gray-500 dark:text-gray-400 sepia:text-sepia-600"
                    >
                      {description}
                    </p>
                  )}
                </div>

                <motion.button
                  type="button"
                  onClick={onClose}
                  className={[
                    'shrink-0 mt-0.5 rounded-lg touch-target-min inline-flex items-center justify-center p-2',
                    'text-gray-400 hover:text-gray-900 dark:hover:text-white',
                    'hover:bg-white/20 dark:hover:bg-white/10',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-400 ia-focus-visible-enhanced',
                  ].join(' ')}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close modal"
                >
                  <CloseIcon />
                </motion.button>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-white/10 dark:bg-white/5 mx-6 flex-shrink-0" />

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">{children}</div>

            {/* Footer */}
            {footer && (
              <>
                <div className="h-px bg-white/10 dark:bg-white/5 mx-6 flex-shrink-0" />
                <div className="p-6 pt-4 flex items-center justify-end gap-3 flex-shrink-0">
                  {footer}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render into portal so modal always escapes stacking contexts
  return typeof document !== 'undefined' ? createPortal(modal, document.body) : null;
};
