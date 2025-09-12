import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ArchiveItemSummary } from '../types';
import { Spinner } from './Spinner';
import { StarIcon, CloseIcon, ZoomInIcon, ZoomOutIcon, RotateClockwiseIcon, RotateCounterClockwiseIcon, RefreshIcon, ExpandIcon, DownloadIcon } from './Icons';
import { useAtomValue, useSetAtom } from 'jotai';
import { libraryItemIdentifiersAtom, addLibraryItemAtom, removeLibraryItemAtom } from '../store';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { useItemMetadata } from '../hooks/useItemMetadata';
import { useImageViewer } from '../hooks/useImageViewer';
import { findBestImageUrl } from '../utils/imageUtils';
import { ItemDetailSidebar } from './ItemDetailSidebar';

interface ImageDetailModalProps {
  item: ArchiveItemSummary;
  onClose: () => void;
  onCreatorSelect: (creator: string) => void;
  onUploaderSelect: (uploader: string) => void;
}

const ViewerToolbar: React.FC<{
    viewer: ReturnType<typeof useImageViewer>;
    onDownload: () => void;
    onFullscreen: () => void;
}> = ({ viewer, onDownload, onFullscreen }) => {
    const { t } = useLanguage();
    const controls = [
        { label: t('common:imageViewer.zoomIn'), action: viewer.zoomIn, icon: <ZoomInIcon /> },
        { label: t('common:imageViewer.zoomOut'), action: viewer.zoomOut, icon: <ZoomOutIcon /> },
        { label: t('common:imageViewer.rotateRight'), action: viewer.rotateCW, icon: <RotateClockwiseIcon /> },
        { label: t('common:imageViewer.rotateLeft'), action: viewer.rotateCCW, icon: <RotateCounterClockwiseIcon /> },
        { label: t('common:imageViewer.resetView'), action: viewer.reset, icon: <RefreshIcon /> },
        { label: t('common:imageViewer.fullscreen'), action: onFullscreen, icon: <ExpandIcon /> },
        { label: t('common:imageViewer.download'), action: onDownload, icon: <DownloadIcon className="w-5 h-5"/> },
    ];
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm p-2 rounded-xl flex items-center space-x-2 border border-white/20 shadow-lg">
            {controls.map(({ label, action, icon }) => (
                <button
                    key={label}
                    onClick={action}
                    title={label}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                    {icon}
                </button>
            ))}
        </div>
    );
};

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ item, onClose, onCreatorSelect, onUploaderSelect }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const { addToast } = useToast();
  const { t } = useLanguage();
  
  const libraryItemIdentifiers = useAtomValue(libraryItemIdentifiersAtom);
  const addLibraryItem = useSetAtom(addLibraryItemAtom);
  const removeLibraryItem = useSetAtom(removeLibraryItemAtom);

  const { metadata, isLoading, error, fetchMetadata } = useItemMetadata(item);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const viewer = useImageViewer();
  
  useEffect(() => {
    if (metadata?.files) {
        setIsImageLoading(true);
        setImageError(null);
        const url = findBestImageUrl(metadata.files, item.identifier);
        if (url) {
            setImageUrl(url);
        } else {
            setImageError(t('common:imageViewer.loadingError'));
            setIsImageLoading(false);
        }
    }
  }, [metadata, item.identifier, t]);

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
  
  const handleDownload = () => {
      if(imageUrl) window.open(imageUrl, '_blank');
  };

  const handleFullscreen = () => {
      imageContainerRef.current?.requestFullscreen().catch(err => console.error(err));
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isMounted && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ${isMounted && !isClosing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
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

        <div className="flex-grow flex overflow-hidden">
          {isLoading && <div className="w-full flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && (
            <div className="w-full flex flex-col justify-center items-center h-full text-center">
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
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-0">
              <div className="md:col-span-1 p-6 overflow-y-auto">
                <ItemDetailSidebar
                    item={item}
                    metadata={metadata}
                    onEmulate={() => {}}
                    onCreatorSelect={onCreatorSelect}
                    onUploaderSelect={onUploaderSelect}
                    playableMedia={null}
                    mediaRef={{current: null}}
                    isPlaying={false}
                    handlePlayPause={() => {}}
                    mediaEventListeners={{onPlay:()=>{}, onPause:()=>{}, onEnded:()=>{}}}
                />
              </div>
              <div 
                ref={imageContainerRef}
                className="md:col-span-2 relative bg-gray-900 overflow-hidden"
                onMouseDown={viewer.handleMouseDown}
                onMouseMove={viewer.handleMouseMove}
                onMouseUp={viewer.handleMouseUp}
                onMouseLeave={viewer.handleMouseUp}
                onWheel={viewer.handleWheel}
              >
                 {(isImageLoading || imageError) && (
                     <div className="absolute inset-0 flex justify-center items-center">
                         {isImageLoading ? <Spinner size="lg"/> : <p className="text-red-400">{imageError}</p>}
                     </div>
                 )}
                 {imageUrl && (
                    <>
                        <img 
                            src={imageUrl} 
                            alt={item.title}
                            onLoad={() => setIsImageLoading(false)}
                            onError={() => {
                                setIsImageLoading(false);
                                setImageError(t('common:imageViewer.loadingError'));
                            }}
                            className={`absolute top-0 left-0 max-w-full max-h-full transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'} ${viewer.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            style={{
                                transform: `translate(${viewer.offset.x}px, ${viewer.offset.y}px) scale(${viewer.zoom}) rotate(${viewer.rotation}deg)`,
                                transformOrigin: 'top left',
                                willChange: 'transform'
                            }}
                        />
                         <ViewerToolbar viewer={viewer} onDownload={handleDownload} onFullscreen={handleFullscreen} />
                    </>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};