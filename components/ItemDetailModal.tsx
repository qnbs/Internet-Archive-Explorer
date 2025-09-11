import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import type { ArchiveItemSummary } from '../types';
import { Spinner } from './Spinner';
import { StarIcon, CloseIcon } from './Icons';
import { useAtomValue, useSetAtom } from 'jotai';
// FIX: Updated favorite atoms to library atoms to match store refactor.
import { libraryItemIdentifiersAtom, addLibraryItemAtom, removeLibraryItemAtom, enableAiFeaturesAtom } from '../store';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { useItemMetadata } from '../hooks/useItemMetadata';
import type { ItemDetailTab } from '../hooks/useItemMetadata';
import { ItemDetailSidebar } from './ItemDetailSidebar';
import { ItemDetailTabs } from './ItemDetailTabs';
import { ItemDetailDescriptionTab } from './ItemDetailDescriptionTab';
import { ItemDetailFilesTab } from './ItemDetailFilesTab';
import { ItemDetailRelatedTab } from './ItemDetailRelatedTab';
import { AIToolsTab } from './AIToolsTab';

interface ItemDetailModalProps {
  item: ArchiveItemSummary;
  onClose: () => void;
  onCreatorSelect: (creator: string) => void;
  onUploaderSelect: (searchUploader: string) => void;
  onEmulate: (item: ArchiveItemSummary) => void;
  onSelectItem: (item: ArchiveItemSummary) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onCreatorSelect, onUploaderSelect, onEmulate, onSelectItem }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId();
  
  const { addToast } = useToast();
  const { t } = useLanguage();
  
  const enableAiFeatures = useAtomValue(enableAiFeaturesAtom);
  // FIX: Use library atoms instead of deprecated favorite atoms.
  const favoriteIdentifiers = useAtomValue(libraryItemIdentifiersAtom);
  const addFavorite = useSetAtom(addLibraryItemAtom);
  const removeFavorite = useSetAtom(removeLibraryItemAtom);

  const {
      metadata,
      isLoading,
      error,
      activeTab,
      setActiveTab,
      plainText,
      isLoadingText,
      isPlaying,
      playableMedia,
      mediaRef,
      handlePlayPause,
      mediaEventListeners,
      fetchMetadata,
  } = useItemMetadata(item);

  const favoriteStatus = favoriteIdentifiers.has(item.identifier);
  
  useModalFocusTrap({ modalRef, isOpen: isMounted && !isClosing, onClose });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Duration of the animation
  }, [onClose]);

  const handleFavoriteClick = () => {
    if (favoriteStatus) {
      removeFavorite(item.identifier);
      addToast(t('favorites:removed'), 'info');
    } else {
      addFavorite(item);
      addToast(t('favorites:added'), 'success');
    }
  };

  const renderTabContent = () => {
    if (!metadata) return null;
    
    return (
      <div className="pt-2">
        {activeTab === 'description' && (
          <ItemDetailDescriptionTab description={metadata.metadata.description} />
        )}
        {activeTab === 'ai' && item.mediatype === 'texts' && enableAiFeatures && (
            <AIToolsTab 
              itemIdentifier={item.identifier} 
              textContent={plainText}
              isLoadingText={isLoadingText}
              onClose={handleClose}
            />
        )}
        {activeTab === 'files' && (
          <ItemDetailFilesTab files={metadata.files} itemIdentifier={item.identifier} />
        )}
        {activeTab === 'related' && (
          <ItemDetailRelatedTab metadata={metadata} currentItemIdentifier={item.identifier} onSelectItem={onSelectItem} />
        )}
      </div>
    );
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
                 <button onClick={handleFavoriteClick} className="flex-shrink-0 text-gray-400 hover:text-yellow-400 transition-colors rounded-full p-1" aria-label={favoriteStatus ? t('itemCard:removeFavorite') : t('itemCard:addFavorite')}>
                    <StarIcon filled={favoriteStatus} className="w-6 h-6" />
                </button>
                <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white truncate">{item.title}</h2>
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full p-1 flex-shrink-0 ml-4" aria-label={t('common:close')}>
                <CloseIcon className="w-6 h-6" />
            </button>
        </header>

        <div className="flex-grow overflow-y-auto p-6">
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && (
            <div className="flex flex-col justify-center items-center h-full text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                    onClick={fetchMetadata}
                    className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
                >
                    {t('common:retry')}
                </button>
            </div>
          )}
          {metadata && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <ItemDetailSidebar
                    item={item}
                    metadata={metadata}
                    onEmulate={onEmulate}
                    onCreatorSelect={onCreatorSelect}
                    onUploaderSelect={onUploaderSelect}
                    playableMedia={playableMedia}
                    mediaRef={mediaRef}
                    isPlaying={isPlaying}
                    handlePlayPause={handlePlayPause}
                    mediaEventListeners={mediaEventListeners}
                />
              </div>
              <div className="md:col-span-2 space-y-4">
                <ItemDetailTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    showAiTab={item.mediatype === 'texts' && enableAiFeatures}
                    uniqueId={uniqueId}
                />
                {renderTabContent()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};