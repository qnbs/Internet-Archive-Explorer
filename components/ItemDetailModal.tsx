import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ArchiveItemSummary, ArchiveMetadata, ArchiveFile } from '../types';
import { getItemMetadata, getItemPlainText } from '../services/archiveService';
import { Spinner } from './Spinner';
import { JoystickIcon, StarIcon, FileIcon, CloseIcon, PlayIcon, PauseIcon } from './Icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { RelatedItems } from './RelatedItems';
import { AIToolsTab } from './AIToolsTab';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

interface ItemDetailModalProps {
  item: ArchiveItemSummary;
  onClose: () => void;
  onCreatorSelect: (creator: string) => void;
  onUploaderSelect: (searchUploader: string) => void;
  onEmulate: (item: ArchiveItemSummary) => void;
  onSelectItem: (item: ArchiveItemSummary) => void;
}

type Tab = 'description' | 'ai' | 'files' | 'related';

const formatUploaderName = (uploader: string | undefined): string => {
  if (!uploader) return '';
  return uploader.split('@')[0];
};

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onCreatorSelect, onUploaderSelect, onEmulate, onSelectItem }) => {
  const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>(item.mediatype === 'texts' && settings.enableAiFeatures ? settings.defaultAiTab : 'description');
  const [plainText, setPlainText] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
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
    setTimeout(onClose, 300); // Duration of the animation
  }, [onClose]);
  
  const handlePlayPause = () => {
    if (isPlaying) {
        audioRef.current?.pause();
    } else {
        audioRef.current?.play().catch(e => console.error("Playback failed:", e));
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
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

    if (item.mediatype === 'audio' && settings.autoplayMedia) {
        setTimeout(() => {
            audioRef.current?.play().catch(e => console.error("Autoplay failed:", e));
        }, 300);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, item.mediatype, settings.autoplayMedia]);

  const fetchMetadata = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMetadata(null);
    setPlainText(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setActiveTab(item.mediatype === 'texts' && settings.enableAiFeatures ? settings.defaultAiTab : 'description');
    try {
      const data = await getItemMetadata(item.identifier);
      setMetadata(data);
      if (data.metadata.mediatype === 'audio') {
        const audioFile = data.files.find(f => f.format.includes('VBR MP3') || f.format.includes('MP3') || f.name.endsWith('.mp3'));
        if (audioFile) {
            setAudioUrl(`https://archive.org/download/${item.identifier}/${audioFile.name}`);
        }
      }
    } catch (err) {
      setError(t('common:error'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [item.identifier, item.mediatype, settings.defaultAiTab, settings.enableAiFeatures, t]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
      if (activeTab === 'ai' && item.mediatype === 'texts' && !plainText && !isLoadingText) {
          setIsLoadingText(true);
          getItemPlainText(item.identifier)
            .then(setPlainText)
            .catch(() => setPlainText("Could not load text."))
            .finally(() => setIsLoadingText(false));
      }
  }, [activeTab, item.identifier, item.mediatype, plainText, isLoadingText]);

  const renderDescription = (desc: string | string[] | undefined) => {
    if (!desc) return <p className="text-gray-400">{t('common:noDescription')}</p>;
    const descriptionText = (Array.isArray(desc) ? desc.join('\n') : desc)
        .replace(/<br\s*\/?>/gi, '\n');
    const paragraphs = descriptionText.split(/\n\s*\n*/g).map(p => p.trim()).filter(p => p.length > 0);
    return (
        <div className="text-gray-300 leading-relaxed space-y-3">
            {paragraphs.map((p, index) => (<p key={index} dangerouslySetInnerHTML={{ __html: p }} />))}
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

  const TabButton: React.FC<{tab: Tab, label: string}> = ({tab, label}) => (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
      >{label}</button>
  );

  const creators = metadata?.metadata?.creator ? (Array.isArray(metadata.metadata.creator) ? metadata.metadata.creator : [metadata.metadata.creator]) : [];
  const collections = metadata?.metadata?.collection ? (Array.isArray(metadata.metadata.collection) ? metadata.metadata.collection : [metadata.metadata.collection]) : [];
  const uploader = metadata?.metadata?.uploader;
  const formattedUploaderName = formatUploaderName(uploader);

  const renderMedia = () => {
    switch (item.mediatype) {
        case 'movies':
            return (
                <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-md">
                    <iframe
                        src={`https://archive.org/embed/${item.identifier}${settings.autoplayMedia ? '?autoplay=1' : ''}`}
                        width="100%" height="100%" frameBorder="0"
                        allow="autoplay; fullscreen" title={`Video player for ${item.title}`}
                    ></iframe>
                </div>
            );
        case 'audio':
            return (
                <div className="bg-gray-900/50 p-4 rounded-lg shadow-md border border-gray-700">
                    <img
                        src={`https://archive.org/services/get-item-image.php?identifier=${item.identifier}`}
                        alt={`Cover for ${item.title}`} className="w-full rounded-lg shadow-md mb-4"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/400?grayscale'; }}
                    />
                    {audioUrl && (
                        <audio ref={audioRef} src={audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} className="hidden" />
                    )}
                    <div className="flex items-center justify-center space-x-4">
                        <button onClick={handlePlayPause} disabled={!audioUrl} className="w-14 h-14 bg-cyan-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                        </button>
                    </div>
                </div>
            );
        default:
            return (
                 <img
                    src={`https://archive.org/services/get-item-image.php?identifier=${item.identifier}`}
                    alt={`Cover for ${item.title}`} className="w-full rounded-lg shadow-md"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/600?grayscale'; }}
                />
            );
    }
  }

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
                 <button ref={firstFocusableElementRef} onClick={handleFavoriteClick} className="flex-shrink-0 text-gray-400 hover:text-yellow-400 transition-colors rounded-full p-1" aria-label={favoriteStatus ? t('itemCard:removeFavorite') : t('itemCard:addFavorite')}>
                    <StarIcon filled={favoriteStatus} className="w-6 h-6" />
                </button>
                <h2 id="modal-title" className="text-xl font-bold text-white truncate">{item.title}</h2>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1 flex-shrink-0 ml-4" aria-label={t('common:close')}>
                <CloseIcon className="w-6 h-6" />
            </button>
        </header>

        <div className="flex-grow overflow-y-auto p-6">
          {isLoading && <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>}
          {error && (
            <div className="flex flex-col justify-center items-center h-full text-center">
                <p className="text-red-400 mb-4">{error}</p>
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
              <div className="md:col-span-1 md:sticky md:top-6 self-start">
                {renderMedia()}
                 {item.mediatype === 'software' && (
                    <div className="mt-4">
                        <button onClick={() => onEmulate(item)} className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-md font-semibold rounded-lg transition-all duration-200 bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg">
                            <JoystickIcon className="w-6 h-6" />
                            <span>{t('common:startInRecRoom')}</span>
                        </button>
                    </div>
                )}
                 <div className="mt-4 space-y-2 text-sm">
                    <p><strong className="text-gray-400 font-semibold">{t('common:creator')}:</strong>{' '}
                        {creators.length > 0 ? creators.map((c, i) => (
                            <React.Fragment key={c}>
                                <button onClick={() => onCreatorSelect(c)} className="text-cyan-400 hover:underline transition-colors" aria-label={t('modals:details.searchByCreator', { creator: c })}>{c}</button>
                                {i < creators.length - 1 && ', '}
                            </React.Fragment>
                        )) : <span className="text-gray-300">{t('common:na')}</span>}
                    </p>
                    {uploader && (
                        <p><strong className="text-gray-400 font-semibold">{t('common:uploader')}:</strong>{' '}
                            <button onClick={() => onUploaderSelect(uploader)} className="text-cyan-400 hover:underline transition-colors" aria-label={t('modals:details.viewUploaderProfile', { uploader: formattedUploaderName })}>{formattedUploaderName}</button>
                        </p>
                    )}
                    <p><strong className="text-gray-400 font-semibold">{t('common:published')}:</strong> <span className="text-gray-300">{new Date(metadata.metadata.publicdate).toLocaleDateString(language)}</span></p>
                    <p><strong className="text-gray-400 font-semibold">{t('common:collection')}:</strong> <span className="text-gray-300">{collections.slice(0, 2).join(', ') || t('common:na')}</span></p>
                    {metadata.metadata.licenseurl && <p><strong className="text-gray-400 font-semibold">{t('common:license')}:</strong> <a href={metadata.metadata.licenseurl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{t('common:viewLicense')}</a></p>}
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-2 border-b border-gray-700 pb-2">
                    <TabButton tab="description" label={t('common:description')} />
                    {item.mediatype === 'texts' && settings.enableAiFeatures && <TabButton tab="ai" label={t('common:aiAnalysis')} />}
                    <TabButton tab="files" label={t('common:files')} />
                    <TabButton tab="related" label={t('common:related')} />
                </div>
                <div className="pt-2">
                    {activeTab === 'description' && renderDescription(metadata.metadata.description)}
                    {activeTab === 'ai' && item.mediatype === 'texts' && settings.enableAiFeatures && (
                        <AIToolsTab 
                          itemIdentifier={item.identifier} 
                          textContent={plainText}
                          isLoadingText={isLoadingText}
                          onClose={handleClose}
                        />
                    )}
                    {activeTab === 'files' && (
                        <div className="max-h-80 overflow-y-auto bg-gray-900/50 rounded-lg p-2 space-y-2 border border-gray-700">
                          {metadata.files.filter(f => f.format !== 'Metadata' && f.format !== 'Item Image').map((file: ArchiveFile) => (
                            <a key={file.name} href={`https://archive.org/download/${item.identifier}/${file.name}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">
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
                    )}
                    {activeTab === 'related' && <RelatedItems metadata={metadata} currentItemIdentifier={item.identifier} onSelectItem={onSelectItem} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};