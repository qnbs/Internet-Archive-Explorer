import React from 'react';
import type { ArchiveItemSummary, ArchiveMetadata } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { JoystickIcon, PlayIcon, PauseIcon, MusicNoteIcon, ExternalLinkIcon, InfoIcon } from './Icons';
import { formatIdentifierForDisplay } from '../utils/formatter';

interface ItemDetailSidebarProps {
    item: ArchiveItemSummary;
    metadata: ArchiveMetadata;
    onEmulate: (item: ArchiveItemSummary) => void;
    onCreatorSelect: (creator: string) => void;
    onUploaderSelect: (uploader: string) => void;
    playableMedia: { url: string; type: 'audio' | 'video' } | null;
    mediaRef: React.RefObject<HTMLMediaElement>;
    isPlaying: boolean;
    handlePlayPause: () => void;
    mediaEventListeners: {
        onPlay: () => void;
        onPause: () => void;
        onEnded: () => void;
    };
}

const MetadataRow: React.FC<{ label: string; children: React.ReactNode; isButton?: boolean }> = React.memo(({ label, children, isButton }) => (
    <div className="flex justify-between items-start text-sm">
        <span className="font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0 mr-2">{label}:</span>
        {isButton ? (
             <div className="text-right">{children}</div>
        ) : (
            <span className="text-gray-800 dark:text-gray-200 text-right truncate" title={typeof children === 'string' ? children : undefined}>
                {children}
            </span>
        )}
    </div>
));

export const ItemDetailSidebar: React.FC<ItemDetailSidebarProps> = ({
    item, metadata, onEmulate, onCreatorSelect, onUploaderSelect,
    playableMedia, mediaRef, isPlaying, handlePlayPause, mediaEventListeners
}) => {
    const { t, language } = useLanguage();
    const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;
    
    const creators = Array.isArray(metadata.metadata.creator) ? metadata.metadata.creator : (metadata.metadata.creator ? [metadata.metadata.creator] : []);
    const uploader = metadata.metadata.uploader;

    const handleCreatorClick = (creator: string) => {
        onCreatorSelect(creator);
    };
    
    const handleUploaderClick = (uploader: string) => {
        onUploaderSelect(uploader);
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-4">
            <div className="rounded-lg overflow-hidden aspect-[3/4] shadow-md bg-gray-200 dark:bg-gray-700 relative group">
                {/* Video Player */}
                {playableMedia?.type === 'video' && (
                    <video
                        ref={mediaRef as React.RefObject<HTMLVideoElement>}
                        src={playableMedia.url}
                        className={`w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        onPlay={mediaEventListeners.onPlay}
                        onPause={mediaEventListeners.onPause}
                        onEnded={mediaEventListeners.onEnded}
                        controls
                    />
                )}

                {/* Thumbnail Image */}
                <img
                    src={thumbnailUrl}
                    alt={`Cover for ${item.title}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying && playableMedia?.type === 'video' ? 'opacity-0' : 'opacity-100'}`}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallbackUrl = `https://archive.org/download/${item.identifier}/__ia_thumb.jpg`;
                        const placeholderUrl = 'https://picsum.photos/300/400?grayscale';
                        if (target.src.includes('__ia_thumb.jpg')) {
                            target.onerror = null;
                            target.src = placeholderUrl;
                        } else {
                            target.src = fallbackUrl;
                        }
                    }}
                />
                
                {/* Play/Pause Overlay */}
                {playableMedia && (
                    <div
                        onClick={handlePlayPause}
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 cursor-pointer ${!isPlaying ? 'opacity-0 group-hover:opacity-100' : isPlaying && playableMedia.type === 'video' ? 'opacity-0' : 'opacity-100'}`}
                        role="button"
                        aria-label={isPlaying ? t('common:pause') : t('common:play')}
                    >
                        {isPlaying 
                            ? <PauseIcon className="w-16 h-16 text-white drop-shadow-lg" /> 
                            : <PlayIcon className="w-16 h-16 text-white drop-shadow-lg" />
                        }
                    </div>
                )}

                 {/* Audio Playback Indicator Bar */}
                {playableMedia?.type === 'audio' && isPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm pointer-events-none">
                        <div className="flex items-center text-white animate-fade-in">
                            <MusicNoteIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="text-sm font-semibold truncate flex-grow" title={item.title}>{item.title}</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Hidden Audio Player Element */}
            {playableMedia?.type === 'audio' && (
                <audio
                    ref={mediaRef as React.RefObject<HTMLAudioElement>}
                    src={playableMedia.url}
                    onPlay={mediaEventListeners.onPlay}
                    onPause={mediaEventListeners.onPause}
                    onEnded={mediaEventListeners.onEnded}
                    className="hidden"
                />
            )}

            {item.mediatype === 'software' && (
                <button 
                    onClick={() => onEmulate(item)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shadow-lg"
                >
                    <JoystickIcon />
                    <span>{t('recRoom:card.start')}</span>
                </button>
            )}

            {metadata.metadata['access-restricted-item'] === 'true' && (
                <div className="p-3 bg-yellow-500/10 text-yellow-300 rounded-lg border border-yellow-500/30 flex items-start space-x-2 text-sm">
                    <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                    <div><span className="font-bold">{t('modals:details.restrictedAccess')}</span>: {t('modals:details.restrictedAccessDesc')}</div>
                </div>
            )}

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                <MetadataRow label={t('common:mediaType')}>
                    <span className="capitalize">{item.mediatype}</span>
                </MetadataRow>
                {creators.length > 0 && (
                    <MetadataRow label={t('common:creator')} isButton>
                        <div className="flex flex-col items-end">
                            {creators.map((c, i) => (
                                <button key={i} onClick={() => handleCreatorClick(c)} className="text-cyan-600 dark:text-cyan-400 hover:underline ml-1 truncate" title={t('modals:details.searchByCreator', { creator: c })}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </MetadataRow>
                )}
                 {uploader && (
                    <MetadataRow label={t('common:uploader')} isButton>
                        <button onClick={() => handleUploaderClick(uploader)} className="text-cyan-600 dark:text-cyan-400 hover:underline truncate" title={t('modals:details.viewUploaderProfile', { uploader: formatIdentifierForDisplay(uploader) })}>
                           {formatIdentifierForDisplay(uploader)}
                        </button>
                    </MetadataRow>
                )}
                 <MetadataRow label={t('common:published')}>
                    {formatDate(item.publicdate)}
                </MetadataRow>
                {metadata.metadata.licenseurl && (
                    <MetadataRow label={t('common:license')}>
                        <a href={metadata.metadata.licenseurl} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline truncate">
                            {t('common:viewLicense')}
                        </a>
                    </MetadataRow>
                )}
                <MetadataRow label={t('common:archivePage')} isButton>
                    <a 
                        href={`https://archive.org/details/${item.identifier}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:underline"
                        title={t('common:viewOnArchive')}>
                        <span className="truncate">{t('common:viewOnArchive')}</span>
                        <ExternalLinkIcon className="w-4 h-4 ml-1 flex-shrink-0" />
                    </a>
                </MetadataRow>
            </div>
        </div>
    );
};