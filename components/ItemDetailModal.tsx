import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import type { ArchiveItemSummary } from '../types';
import { StarIcon, CloseIcon } from './Icons';
import { useAtomValue, useSetAtom } from 'jotai';
import { libraryItemIdentifiersAtom, addLibraryItemAtom, removeLibraryItemAtom } from '../store/favorites';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { ItemDetailProvider, useItemDetailContext } from '../contexts/ItemDetailContext';
import { ItemDetailLayout } from './ItemDetailLayout';

interface ItemDetailModalProps {
  item: ArchiveItemSummary;
  onClose: () => void;
  onCreatorSelect: (creator: string) => void;
  onUploaderSelect: (searchUploader: string) => void;
  onEmulate: (item: ArchiveItemSummary) => void;
}

const ItemDetailModalContent: React.FC<Omit<ItemDetailModalProps, 'item'>> = ({ onClose, onCreatorSelect, onUploaderSelect, onEmulate }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  
  const { addToast } = useToast();
  const { t } = useLanguage();
  
  const libraryItemIdentifiers = useAtomValue(libraryItemIdentifiersAtom);
  const addLibraryItem = useSetAtom(addLibraryItemAtom);
  const removeLibraryItem = useSetAtom(removeLibraryItemAtom);
  const { item } = useItemDetailContext(); // Get the item from context

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
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isMounted && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ${isMounted && !isClosing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
                 <button onClick={handleFavoriteClick} className="flex-shrink-0 text-gray-400 hover:text-yellow-400 transition-colors rounded-full p-1" aria-label={isFavorite ? t('itemCard:removeFavorite') : t('itemCard:addFavorite')}>
                    <StarIcon filled={isFavorite} className="w-6 h-6" />
                </button>
                <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white truncate">{item.title}</h2>
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full p-1 flex-shrink-0 ml-4" aria-label={t('common:close')}>
                <CloseIcon className="w-6 h-6" />
            </button>
        </header>

        <ItemDetailLayout 
            onCreatorSelect={onCreatorSelect}
            onUploaderSelect={onUploaderSelect}
            onEmulate={onEmulate}
            onClose={handleClose}
        />
      </div>
    </div>
  );
};

export const ItemDetailModal: React.FC<ItemDetailModalProps> = (props) => (
  <ItemDetailProvider item={props.item}>
    <ItemDetailModalContent {...props} />
  </ItemDetailProvider>
);
