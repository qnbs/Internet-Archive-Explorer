import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { ArchiveItemSummary, ArchiveMetadata, ArchiveFile } from '../types';
import { Spinner } from './Spinner';
import { useFavorites } from '../contexts/FavoritesContext';
import { StarIcon, FileIcon, CloseIcon } from './Icons';
import { getItemMetadata } from '../services/archiveService';
import { RelatedItems } from './RelatedItems';
import { useLanguage } from '../contexts/LanguageContext';

interface VideoDetailModalProps {
  item: ArchiveItemSummary;
  onClose: () => void;
  onCreatorSelect: (creator: string) => void;
  onUploaderSelect: (uploader: string) => void;
  onSelectItem: (item: ArchiveItemSummary) => void;
}

const formatUploaderName = (uploader: string | undefined): string => {
  if (!uploader) return '';
  return uploader.split('@')[0];
};

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ item, onClose, onCreatorSelect, onUploaderSelect, onSelectItem }) => {
  const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableElementRef = useRef<HTMLButtonElement>(null);

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { t, language } = useLanguage();
  
  const favoriteStatus = isFavorite(item.identifier);

  const handleFavoriteClick = () => {
    if (favoriteStatus) {
      removeFavorite(item.identifier);
    } else {
      addFavorite(item);
    }
  };

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Animation duration
  }, [onClose]);

  useEffect(() => {
    setIsMounted(true);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
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
  }, [handleClose]);

  useEffect(() => {
    const fetchMetadata = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getItemMetadata(item.identifier);
            setMetadata(data);
        } catch (err) {
            setError(t('common.error'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    fetchMetadata();
  }, [item.identifier, t]);
  
  const renderDescription = (desc: string | string[] | undefined) => {
    if (!desc) return <p className="text-gray-400">{t('common.noDescription')}</p>;
    const descriptionText = (Array.isArray(desc) ? desc.join('\n') : desc).replace(/<br\s*\/?>/gi, '\n');
    const paragraphs = descriptionText.split(/\n\s*\n*/g).map(p => p.trim()).filter(p => p.length > 0);
    return (
        <div className="text-gray-300 leading-relaxed space-y-3">
            {paragraphs.map((p, index) => <p key={index} dangerouslySetInnerHTML={{ __html: p }} />)}
        </div>
    );
  };
  
  const formatBytes = (bytesStr?: string, decimals = 2) => {
    const bytes = Number(bytesStr);
    if (!bytes || isNaN(bytes) || bytes === 0) return 'N/A';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const creators = metadata?.metadata?.creator
    ? (Array.isArray(metadata.metadata.creator) ? metadata.metadata.creator : [metadata.metadata.creator])
    : [];

  const collections = metadata?.metadata?.collection
    ? (Array.isArray(metadata.metadata.collection) ? metadata.metadata.collection : [metadata.metadata.collection])
    : [];
  
  const uploader = metadata?.metadata?.uploader;
  const formattedUploaderName = formatUploaderName(uploader);

  const embedUrl = `https://archive.org/embed/${item.identifier}`;

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isMounted && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-title"
    >
      <div
        ref={modalRef}
        className={`bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ${isMounted && !isClosing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
           <div className="flex items-center space-x-3 min-w-0">
              <button
                  ref={firstFocusableElementRef}
                  onClick={handleFavoriteClick}
                  className="flex-shrink-0 text-gray-400 hover:text-yellow-400 transition-colors rounded-full p-1"
                  aria-label={t(favoriteStatus ? 'itemCard.removeFavorite' : 'itemCard.addFavorite')}
              >
                  <StarIcon filled={favoriteStatus} className="w-6 h-6" />
              </button>
              <h2 id="video-title" className="text-xl font-bold text-white truncate">{item.title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors rounded-full p-2 bg-gray-800/50 hover:bg-gray-700 flex-shrink-0 ml-4"
            aria-label={t('common.close')}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="flex-grow overflow-y-auto">
            {isLoading && <div className="flex justify-center items-center h-full p-8"><Spinner size="lg" /></div>}
            {error && <p className="text-center text-red-400 p-8">{error}</p>}
            {metadata && (
                <div>
                    <div className="w-full aspect-video bg-black">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full border-0"
                            title={`Videoplayer für ${item.title}`}
                            allowFullScreen
                            allow="autoplay"
                        ></iframe>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">{t('videoModal.description')}</h3>
                                    {renderDescription(metadata.metadata.description)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">{t('videoModal.downloadFiles')}</h3>
                                    <div className="max-h-60 overflow-y-auto bg-gray-900/50 rounded-lg p-2 space-y-2 border border-gray-700">
                                        {metadata.files.filter(f => f.format !== 'Metadata' && f.format !== 'Item Image').map((file: ArchiveFile) => (
                                        <a
                                            key={file.name}
                                            href={`https://archive.org/download/${item.identifier}/${file.name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                                        >
                                            <div className="flex items-center space-x-3 truncate">
                                            <FileIcon />
                                            <span className="truncate text-gray-300 text-sm" title={file.name}>{file.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                                            <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
                                            <span className="text-xs font-mono bg-gray-600 text-cyan-300 px-2 py-0.5 rounded">{file.format}</span>
                                            </div>
                                        </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-1 space-y-2 text-sm">
                                <h3 className="text-lg font-semibold text-cyan-400 mb-2">{t('videoModal.details')}</h3>
                                <p><strong className="text-gray-400 font-semibold">{t('common.creator')}:</strong>{' '}
                                    {creators.length > 0 ? creators.map((c, i) => (
                                        <React.Fragment key={c}>
                                            <button
                                                onClick={() => onCreatorSelect(c)}
                                                className="text-cyan-400 hover:underline transition-colors"
                                                aria-label={t('modals.details.searchByCreator', { creator: c })}
                                            >
                                                {c}
                                            </button>
                                            {i < creators.length - 1 && ', '}
                                        </React.Fragment>
                                    )) : <span className="text-gray-300">{t('common.na')}</span>}
                                </p>
                                {uploader && (
                                    <p><strong className="text-gray-400 font-semibold">{t('common.uploader')}:</strong>{' '}
                                        <button
                                            onClick={() => onUploaderSelect(uploader)}
                                            className="text-cyan-400 hover:underline transition-colors"
                                            aria-label={t('modals.details.viewUploaderProfile', { uploader: formattedUploaderName })}
                                        >
                                            {formattedUploaderName}
                                        </button>
                                    </p>
                                )}
                                <p><strong className="text-gray-400 font-semibold">{t('common.published')}:</strong> <span className="text-gray-300">{new Date(metadata.metadata.publicdate).toLocaleDateString(language)}</span></p>
                                <p><strong className="text-gray-400 font-semibold">{t('common.collection')}:</strong> <span className="text-gray-300">{collections.slice(0, 3).join(', ') || t('common.na')}</span></p>
                                {metadata.metadata.licenseurl && <p><strong className="text-gray-400 font-semibold">{t('common.license')}:</strong> <a href={metadata.metadata.licenseurl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{t('common.viewLicense')}</a></p>}
                            </div>
                        </div>
                        <div className="pt-6 mt-6 border-t border-gray-700">
                             <RelatedItems metadata={metadata} currentItemIdentifier={item.identifier} onSelectItem={onSelectItem} />
                        </div>
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};
