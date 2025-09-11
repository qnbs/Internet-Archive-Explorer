import React from 'react';
import type { ArchiveItemSummary, ArchiveMetadata } from '../types';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';
import { JoystickIcon, PlayIcon, PauseIcon } from './Icons';
import { formatIdentifierForDisplay } from '../utils/formatter';

interface ItemDetailSidebarProps {
    item: ArchiveItemSummary;
    metadata: ArchiveMetadata;
    onEmulate: (item: ArchiveItemSummary) => void;
    onCreatorSelect: (creator: string) => void;
    onUploaderSelect: (uploader: string) => void;
    audioUrl: string | null;
    audioRef: React.RefObject<HTMLAudioElement>;
    isPlaying: boolean;
    handlePlayPause: () => void;
    audioEventListeners: {
        onPlay: () => void;
        onPause: () => void;
        onEnded: () => void;
    };
}

const MetadataRow: React.FC<{ label: string; children: React.ReactNode; isButton?: boolean }> = ({ label, children, isButton }) => (
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
);

export const ItemDetailSidebar: React.FC<ItemDetailSidebarProps> = ({
    item, metadata, onEmulate, onCreatorSelect, onUploaderSelect,
    audioUrl, audioRef, isPlaying, handlePlayPause, audioEventListeners
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
            <div className="rounded-lg overflow-hidden aspect-[3/4] shadow-md bg-gray-200 dark:bg-gray-700">
                <img src={thumbnailUrl} alt={`Cover for ${item.title}`} className="w-full h-full object-cover" />
            </div>
            
            {item.mediatype === 'software' && (
                <button 
                    onClick={() => onEmulate(item)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shadow-lg"
                >
                    <JoystickIcon />
                    <span>{t('recRoom:card.start')}</span>
                </button>
            )}
            
            {item.mediatype === 'audio' && audioUrl && (
                 <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <button onClick={handlePlayPause} className="p-3 bg-cyan-500 text-white rounded-full hover:bg-cyan-400 transition-colors">
                        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    </button>
                    <div className="flex-grow">
                         <p className="font-semibold text-sm truncate text-gray-800 dark:text-white">{item.title}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{t('common:audioPreview')}</p>
                    </div>
                    <audio ref={audioRef} src={audioUrl} {...audioEventListeners} className="hidden" />
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
            </div>
        </div>
    );
};