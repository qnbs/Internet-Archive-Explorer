import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ArchiveItemSummary, ArchiveMetadata, ArchiveFile } from '../types';
import { getItemMetadata } from '../services/archiveService';
import { Spinner } from './Spinner';
import { useFavorites } from '../contexts/FavoritesContext';
import { StarIcon, PlayIcon, PauseIcon, CloseIcon } from './Icons';
import { RelatedItems } from './RelatedItems';
import { useLanguage } from '../contexts/LanguageContext';

interface AudioDetailModalProps {
  item: ArchiveItemSummary;
  onClose: () => void;
  onCreatorSelect: (creator: string) => void;
  onUploaderSelect: (uploader: string) => void;
  onSelectItem: (item: ArchiveItemSummary) => void;
}

const PLAYABLE_FORMATS = new Set(['VBR MP3', 'MP3', 'OGG', 'FLAC', 'MPEG4', 'Derivative MP3']);

const formatUploaderName = (uploader: string | undefined): string => {
  if (!uploader) return '';
  return uploader.split('@')[0];
};

export const AudioDetailModal: React.FC<AudioDetailModalProps> = ({ item, onClose, onCreatorSelect, onUploaderSelect, onSelectItem }) => {
  const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [currentTrack, setCurrentTrack] = useState<ArchiveFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
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
    setTimeout(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    setIsMounted(true);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusableElements.length) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey) {
            if (document.activeElement === firstElement) { lastElement.focus(); event.preventDefault(); }
        } else {
            if (document.activeElement === lastElement) { firstElement.focus(); event.preventDefault(); }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    firstFocusableElementRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const playableFiles = useMemo(() => {
    return metadata?.files.filter(file => PLAYABLE_FORMATS.has(file.format)).sort((a,b) => (b.size || "0").localeCompare(a.size || "0")) || [];
  }, [metadata]);

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
  
  useEffect(() => {
    if (playableFiles.length > 0 && !currentTrack) {
        setCurrentTrack(playableFiles[0]);
    }
  }, [playableFiles, currentTrack]);

  const togglePlay = (track: ArchiveFile) => {
    if (currentTrack?.name === track.name) {
        if (isPlaying) audioRef.current?.pause();
        else audioRef.current?.play();
        setIsPlaying(!isPlaying);
    } else {
        setCurrentTrack(track);
        setIsPlaying(true);
    }
  };

  const renderDescription = (desc: string | string[] | undefined) => {
    if (!desc) return <p className="text-gray-400">{t('common.noDescription')}</p>;
    const descriptionText = (Array.isArray(desc) ? desc.join('\n') : desc).replace(/<br\s*\/?>/gi, '\n');
    return <p className="text-gray-300 whitespace-pre-wrap">{descriptionText}</p>;
  };
  
  const creators = metadata?.metadata?.creator ? (Array.isArray(metadata.metadata.creator) ? metadata.metadata.creator : [metadata.metadata.creator]) : [];
  const uploader = metadata?.metadata?.uploader;
  const formattedUploaderName = formatUploaderName(uploader);

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isMounted && !isClosing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ${isMounted && !isClosing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <button ref={firstFocusableElementRef} onClick={handleFavoriteClick} className="flex-shrink-0 text-gray-400 hover:text-yellow-400 transition-colors rounded-full p-1" aria-label={favoriteStatus ? t('itemCard.removeFavorite') : t('itemCard.addFavorite')}>
              <StarIcon filled={favoriteStatus} className="w-6 h-6" />
            </button>
            <h2 id="modal-title" className="text-xl font-bold text-white truncate">{item.title}</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1 flex-shrink-0 ml-4" aria-label={t('common.close')}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto p-6">
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && <p className="text-center text-red-400">{error}</p>}
          {metadata && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 md:sticky md:top-6 self-start">
                <img
                  src={`https://archive.org/services/get-item-image.php?identifier=${item.identifier}`}
                  alt={`Cover for ${item.title}`}
                  className="w-full rounded-lg shadow-md aspect-square object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/400?grayscale'; }}
                />
                <div className="mt-4 space-y-2 text-sm">
                    <p><strong className="text-gray-400 font-semibold">{t('common.creator')}:</strong>{' '}
                        {creators.length > 0 ? creators.map((c, i) => (
                            <React.Fragment key={c}>
                                <button onClick={() => onCreatorSelect(c)} className="text-cyan-400 hover:underline">{c}</button>
                                {i < creators.length - 1 && ', '}
                            </React.Fragment>
                        )) : <span className="text-gray-300">{t('common.na')}</span>}
                    </p>
                    {uploader && (
                        <p><strong className="text-gray-400 font-semibold">{t('common.uploader')}:</strong>{' '}
                            <button onClick={() => onUploaderSelect(uploader)} className="text-cyan-400 hover:underline">{formattedUploaderName}</button>
                        </p>
                    )}
                     <p><strong className="text-gray-400 font-semibold">{t('common.published')}:</strong> <span className="text-gray-300">{new Date(metadata.metadata.publicdate).toLocaleDateString(language)}</span></p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                 <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-cyan-400">{t('audioModal.playlist')}</h3>
                     <div className="max-h-60 overflow-y-auto bg-gray-900/50 rounded-lg p-2 space-y-1 border border-gray-700">
                         {playableFiles.length > 0 ? playableFiles.map(file => (
                             <button key={file.name} onClick={() => togglePlay(file)} className={`w-full text-left flex items-center p-2 rounded-md transition-colors ${currentTrack?.name === file.name ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}>
                                 <div className="mr-3">
                                     {currentTrack?.name === file.name && isPlaying ? <PauseIcon className="w-5 h-5 text-cyan-400" /> : <PlayIcon className="w-5 h-5 text-gray-400" />}
                                 </div>
                                 <div className="truncate flex-grow">
                                     <p className={`text-sm truncate ${currentTrack?.name === file.name ? 'text-cyan-300' : 'text-gray-300'}`}>{file.name}</p>
                                     <p className="text-xs text-gray-500">{file.format}</p>
                                 </div>
                                  <span className="text-sm text-gray-400">{file.length}</span>
                             </button>
                         )) : <p className="p-4 text-center text-sm text-gray-500">{t('audioModal.noTracks')}</p>}
                     </div>
                 </div>

                 {renderDescription(metadata.metadata.description)}
                 
                 <div className="pt-4 border-t border-gray-700">
                    <RelatedItems metadata={metadata} currentItemIdentifier={item.identifier} onSelectItem={onSelectItem} />
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <audio ref={audioRef} src={currentTrack ? `https://archive.org/download/${item.identifier}/${currentTrack.name}` : ''} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
    </div>
  );
};
