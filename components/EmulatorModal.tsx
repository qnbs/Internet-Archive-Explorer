import React, { useEffect, useState, useRef } from 'react';
import type { ArchiveItemSummary } from '../types';
import { Spinner } from './Spinner';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon } from './Icons';

interface EmulatorModalProps {
  item: ArchiveItemSummary;
  onClose: () => void;
}

export const EmulatorModal: React.FC<EmulatorModalProps> = ({ item, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLanguage();
  const firstFocusableElementRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setIsMounted(true);
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
        if (event.key === 'Tab' && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), iframe'
            );
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    firstFocusableElementRef.current?.focus();
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const embedUrl = `https://archive.org/embed/${item.identifier}`;

  return (
    <div
      ref={modalRef}
      className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col p-4 sm:p-8 transition-opacity duration-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emulator-title"
    >
      <header className="flex items-center justify-between pb-4 flex-shrink-0">
        <h2 id="emulator-title" className="text-xl font-bold text-white truncate pr-4">{item.title}</h2>
        <button
          ref={firstFocusableElementRef}
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors rounded-full p-2 bg-gray-800/50 hover:bg-gray-700"
          aria-label={t('modals.emulator.close')}
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>
      <div className="flex-grow bg-gray-900 rounded-lg overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/20">
        <div className="text-center text-gray-400 text-sm p-2 bg-gray-800 border-b border-gray-700">
          <p>{t('modals.emulator.providedBy')}</p>
          <p className="text-xs text-gray-500">{t('modals.emulator.escToExit')}</p>
        </div>
        <div className="flex-grow w-full h-full bg-black relative">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col justify-center items-center space-y-4">
                <Spinner size="lg" />
                <p className="text-gray-400">{t('modals.emulator.loading')}</p>
              </div>
            )}
            <iframe
                src={embedUrl}
                className={`w-full h-full border-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                title={`Emulator for ${item.title}`}
                onLoad={() => setIsLoading(false)}
                allowFullScreen
            ></iframe>
        </div>
      </div>
    </div>
  );
};
