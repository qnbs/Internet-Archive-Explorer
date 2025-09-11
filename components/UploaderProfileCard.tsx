import React, { useState, useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { uploaderFavoriteSetAtom, addUploaderFavoriteAtom, removeUploaderFavoriteAtom } from '../store';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import type { Uploader, ArchiveItemSummary } from '../types';
import { StarIcon, UsersIcon, ExternalLinkIcon } from './Icons';
import { searchArchive } from '../services/archiveService';

interface UploaderProfileCardProps {
    uploader: Uploader;
    index: number;
    onSelect: (searchUploader: string) => void;
}

const MiniItemCard: React.FC<{item: ArchiveItemSummary}> = ({ item }) => (
    <div className="aspect-square bg-gray-700 rounded-md overflow-hidden relative">
        <img
            src={`https://archive.org/services/get-item-image.php?identifier=${item.identifier}`}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
        />
    </div>
);

const MiniSkeletonCard: React.FC = () => (
     <div className="aspect-square bg-gray-700 rounded-md animate-pulse"></div>
);

export const UploaderProfileCard: React.FC<UploaderProfileCardProps> = ({ uploader, index, onSelect }) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [topUploads, setTopUploads] = useState<ArchiveItemSummary[]>([]);
    const [isLoadingUploads, setIsLoadingUploads] = useState(true);

    const favoriteUploaderSet = useAtomValue(uploaderFavoriteSetAtom);
    const addUploaderFavorite = useSetAtom(addUploaderFavoriteAtom);
    const removeUploaderFavorite = useSetAtom(removeUploaderFavoriteAtom);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        const currentRef = cardRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    const getSearchQuery = (uploader: Uploader): string => {
        const field = uploader.searchField || 'uploader';
        return `${field}:("${uploader.searchUploader}")`;
    };

    useEffect(() => {
        if (!isVisible) return;

        const fetchTopUploads = async () => {
            setIsLoadingUploads(true);
            try {
                const query = getSearchQuery(uploader);
                const data = await searchArchive(query, 1, ['-downloads'], undefined, 4);
                if (data.response?.docs) {
                    setTopUploads(data.response.docs);
                }
            } catch (error) {
                console.error("Failed to fetch top uploads for card", error);
            } finally {
                setIsLoadingUploads(false);
            }
        };
        fetchTopUploads();
    }, [isVisible, uploader]);
    
    const isFavorite = favoriteUploaderSet.has(uploader.searchUploader);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFavorite) {
            removeUploaderFavorite(uploader.searchUploader);
            addToast(t('favorites:uploaderRemoved'), 'info');
        } else {
            addUploaderFavorite(uploader.searchUploader);
            addToast(t('favorites:uploaderAdded'), 'success');
        }
    };
    
    const uploaderUrl = uploader.screenname 
        ? `https://archive.org/details/@${uploader.screenname}` 
        : `https://archive.org/search?query=${encodeURIComponent(getSearchQuery(uploader))}`;

    const descriptionKey = uploader.descriptionKey || 'uploaderProfileCard:genericDescription';

    return (
        <div 
            ref={cardRef}
            onClick={() => onSelect(uploader.searchUploader)}
            className="bg-gray-800/60 p-6 rounded-xl border border-gray-700/50 flex flex-col h-full animate-fade-in cursor-pointer hover:bg-gray-700/70 transition-colors group"
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, opacity: 0 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(uploader.searchUploader)}
        >
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 bg-gray-700 p-3 rounded-full">
                    <UsersIcon className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{uploader.username}</h2>
                    <span className="text-xs font-semibold bg-gray-700 text-cyan-300 px-2 py-0.5 rounded-full">{t(`uploaderHub:categories.${uploader.category}`)}</span>
                </div>
            </div>
            <p className="text-sm text-gray-400 mt-4 flex-grow">{t(descriptionKey)}</p>
            
            <div className="mt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('uploaderCard:topUploads')}</h3>
                {isLoadingUploads ? (
                     <div className="grid grid-cols-4 gap-2">
                        {Array.from({length: 4}).map((_, i) => <MiniSkeletonCard key={i} />)}
                     </div>
                ) : topUploads.length > 0 ? (
                     <div className="grid grid-cols-4 gap-2">
                        {topUploads.map(item => <MiniItemCard key={item.identifier} item={item} />)}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">{t('uploaderCard:noPublicUploads')}</p>
                )}
            </div>

            <div className="mt-6 space-y-3">
                 <button 
                    onClick={handleFavoriteClick} 
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                >
                    <StarIcon filled={isFavorite} className="w-5 h-5" />
                    <span>{isFavorite ? t('uploaderProfileCard:unfavorite') : t('uploaderProfileCard:favorite')}</span>
                </button>
                 <a 
                    href={uploaderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                >
                    <span>{t('uploaderProfileCard:viewOnArchive')}</span>
                    <ExternalLinkIcon className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
};
