import React from 'react';
import type { ArchiveItemSummary, MediaType } from '../types';
import { useAtomValue, useSetAtom } from 'jotai';
import { libraryItemIdentifiersAtom, addLibraryItemAtom, removeLibraryItemAtom } from '../store/favorites';
import { useToast } from '../contexts/ToastContext';
import { StarIcon, InfoIcon, EyeIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';
import { formatNumber } from '../utils/formatter';

interface ItemCardProps {
  item: ArchiveItemSummary;
  onSelect: (item: ArchiveItemSummary) => void;
  index: number;
}

const getMediaTypeIconPath = (mediaType: MediaType): string => {
  switch (mediaType) {
    case 'audio': return 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-12v13c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z';
    case 'movies': return 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z';
    case 'texts': return 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253';
    case 'image': return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
    case 'software': return 'M15.5 14.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM5 12V7a2 2 0 012-2h10a2 2 0 012 2v5 M12 18V5 M12 18a2 2 0 100 4 2 2 0 000-4z';
    default: return 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 3v2m0 14v2M4.22 4.22l1.42 1.42m12.72 12.72l-1.42-1.42M3 12h2m14 0h2M4.22 19.78l1.42-1.42m12.72-12.72l-1.42 1.42 M12 8l-2 4h4l-2-4z';
  }
};


export const ItemCard: React.FC<ItemCardProps> = React.memo(({ item, onSelect, index }) => {
  const { addToast } = useToast();
  const { t } = useLanguage();
  
  const libraryItemIdentifiers = useAtomValue(libraryItemIdentifiersAtom);
  const addLibraryItem = useSetAtom(addLibraryItemAtom);
  const removeLibraryItem = useSetAtom(removeLibraryItemAtom);
  
  const getCreator = (creator: string | string[] | undefined): string => {
    if (!creator) return t('itemCard:unknownCreator');
    if (Array.isArray(creator)) return creator.join(', ');
    return creator;
  };

  const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;
  const creatorName = getCreator(item.creator);
  const publicYear = new Date(item.publicdate).getFullYear();

  const isFavorite = libraryItemIdentifiers.has(item.identifier);
  const isRestricted = item['access-restricted-item'] === 'true';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeLibraryItem(item.identifier);
      addToast(t('favorites:removed'), 'info');
    } else {
      addLibraryItem(item);
      addToast(t('favorites:added'), 'success');
    }
  };

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg dark:hover:shadow-accent-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group animate-fade-in relative border border-gray-200 dark:border-transparent"
      style={{ animationDelay: `${Math.min(index % 24 * 30, 500)}ms`, opacity: 0 }}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(item)}
      aria-label={t('itemCard:viewDetails', { title: item.title })}
    >
      <button 
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-white hover:text-yellow-400 transition-colors"
        aria-label={isFavorite ? t('itemCard:removeFavorite') : t('itemCard:addFavorite')}
      >
        <StarIcon className="w-5 h-5" filled={isFavorite} />
      </button>

      {isRestricted && (
        <div className="absolute top-2 left-2 z-10 p-1.5 bg-black/60 rounded-full" title={t('modals:details.restrictedItemTooltip')}>
          <InfoIcon className="w-4 h-4 text-yellow-400" />
        </div>
      )}

      <div className="relative aspect-w-3 aspect-h-4">
        <img
          src={thumbnailUrl}
          alt={`Thumbnail for ${item.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallbackUrl = `https://archive.org/download/${item.identifier}/__ia_thumb.jpg`;
            
            if (target.src.includes('__ia_thumb.jpg')) {
                // The fallback also failed, switch to SVG placeholder
                target.onerror = null;
                const iconPath = getMediaTypeIconPath(item.mediatype);
                const placeholderSvg = `<svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg"><rect fill="#374151" width="300" height="400"/><g transform="translate(114, 164) scale(3)"><path d="${iconPath}" stroke="#9CA3AF" stroke-width="0.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
                target.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(placeholderSvg)}`;
            } else {
                // The primary failed, switch to fallback
                target.src = fallbackUrl;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end p-4">
            <div>
                 <h3 className="text-md font-semibold text-white group-hover:text-accent-400 transition-colors line-clamp-3" title={item.title}>
                    {item.title}
                </h3>
                <p className="text-sm text-gray-300 truncate mt-1" title={creatorName}>{creatorName}</p>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">{publicYear || 'N/A'}</p>
                    {typeof item.downloads === 'number' && item.downloads > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400" title={`${item.downloads.toLocaleString()} downloads`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            <span>{formatNumber(item.downloads)}</span>
                        </div>
                    )}
                    <span className="text-xs capitalize bg-gray-700/80 text-accent-300 px-2 py-1 rounded-full">{item.mediatype}</span>
                </div>
            </div>
        </div>
      </div>
    </article>
  );
});