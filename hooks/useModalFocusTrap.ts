import React, { useEffect, useRef } from 'react';

interface UseModalFocusTrapProps {
  modalRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

export const useModalFocusTrap = ({ modalRef, isOpen, onClose }: UseModalFocusTrapProps) => {
  // Remember which element had focus before the modal opened so we can restore it on close
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Capture the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else {
      // Restore focus to the element that was focused before the modal opened
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        // Small delay so focus is restored after the modal finishes closing
        const id = setTimeout(() => previousFocusRef.current?.focus(), 50);
        return () => clearTimeout(id);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), iframe',
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Delay focus to allow for transitions and rendering
    const focusTimeout = setTimeout(() => {
      const firstElement = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )[0];
      firstElement?.focus();
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimeout);
    };
  }, [isOpen, onClose, modalRef]);
};
