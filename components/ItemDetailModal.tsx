import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArchiveItemSummary } from '@/types';
import { StarIcon, CloseIcon } from './Icons';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  libraryItemIdentifiersAtom,
  addLibraryItemAtom,
  removeLibraryItemAtom,
} from '@/store/favorites';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useModalFocusTrap } from '@/hooks/useModalFocusTrap';
import { ItemDetailProvider, useItemDetailContext } from '@/contexts/ItemDetailContext';
import { ItemDetailLayout } from './ItemDetailLayout';

interface ItemDetailModalProps {
  item: ArchiveItemSummary;
  onClose: () => void;
  onCreatorSelect: (creator: string) => void;
  onUploaderSelect: (searchUploader: string) => void;
  onEmulate: (item: ArchiveItemSummary) => void;
}

const TheaterIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    className="w-5 h-5"
    fill={active ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    {active ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    )}
  </svg>
);

const ItemDetailModalContent: React.FC<Omit<ItemDetailModalProps, 'item'>> = ({
  onClose,
  onCreatorSelect,
  onUploaderSelect,
  onEmulate,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const { addToast } = useToast();
  const { t } = useLanguage();

  const libraryItemIdentifiers = useAtomValue(libraryItemIdentifiersAtom);
  const addLibraryItem = useSetAtom(addLibraryItemAtom);
  const removeLibraryItem = useSetAtom(removeLibraryItemAtom);
  const { item } = useItemDetailContext();

  const isFavorite = libraryItemIdentifiers.has(item.identifier);

  useModalFocusTrap({ modalRef, isOpen: isMounted && !isClosing, onClose });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeLibraryItem(item.identifier);
      addToast(t('favorites:removed'), 'info');
    } else {
      addLibraryItem(item);
      addToast(t('favorites:added'), 'success');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-2 md:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: isMounted && !isClosing ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <motion.div
          ref={modalRef}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all ${
            theaterMode
              ? 'w-full h-full max-w-full max-h-full rounded-none md:rounded-2xl'
              : 'w-full max-w-4xl max-h-[90vh]'
          }`}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          layout
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                onClick={handleFavoriteClick}
                className="flex-shrink-0 text-gray-400 hover:text-yellow-400 transition-colors rounded-full p-1"
                aria-label={isFavorite ? t('itemCard:removeFavorite') : t('itemCard:addFavorite')}
              >
                <StarIcon filled={isFavorite} className="w-6 h-6" />
              </button>
              <h2
                id="modal-title"
                className="text-xl font-bold text-gray-900 dark:text-white truncate"
              >
                {item.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {/* Theater mode toggle */}
              <button
                onClick={() => setTheaterMode((v) => !v)}
                className={`p-1.5 rounded-lg transition-colors ${
                  theaterMode
                    ? 'bg-accent-500/20 text-accent-500'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white'
                }`}
                aria-label={theaterMode ? (t('modals:theaterModeOff') || 'Exit Theater Mode') : (t('modals:theaterModeOn') || 'Theater Mode')}
                title={theaterMode ? 'Kino-Modus beenden' : 'Kino-Modus'}
              >
                <TheaterIcon active={theaterMode} />
              </button>

              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full p-1"
                aria-label={t('common:close')}
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
          </header>

          <ItemDetailLayout
            onCreatorSelect={onCreatorSelect}
            onUploaderSelect={onUploaderSelect}
            onEmulate={onEmulate}
            onClose={handleClose}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const ItemDetailModal: React.FC<ItemDetailModalProps> = (props) => (
  <ItemDetailProvider item={props.item}>
    <ItemDetailModalContent {...props} />
  </ItemDetailProvider>
);

