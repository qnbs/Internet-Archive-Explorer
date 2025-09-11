import React from 'react';
import type { ArchiveItemSummary } from '../types';
import { useAtomValue, useSetAtom } from 'jotai';
// FIX: Updated favorite atoms to library atoms to match store refactor.
import { libraryItemIdentifiersAtom, addLibraryItemAtom, removeLibraryItemAtom } from '../store';
import { useToast } from '../contexts/ToastContext';
import { StarIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';

interface ItemCardProps {
  item: ArchiveItemSummary;
  onSelect: (item: ArchiveItemSummary) => void;
  index: number;
}

export const ItemCard: React.FC<ItemCardProps> = React.memo(({ item, onSelect, index }) => {
  const { addToast } = useToast();
  const { t } = useLanguage();
  
  // FIX: Use library atoms instead of deprecated favorite atoms.
  const favoriteIdentifiers = useAtomValue(libraryItemIdentifiersAtom);
  const addFavorite = useSetAtom(addLibraryItemAtom);
  const removeFavorite = useSetAtom(removeLibraryItemAtom);
  
  const getCreator = (creator: string | string[] | undefined): string => {
    if (!creator) return t('itemCard:unknownCreator');
    if (Array.isArray(creator)) return creator.join(', ');
    return creator;
  };

  const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;
  const creatorName = getCreator(item.creator);
  const publicYear = new Date(item.publicdate).getFullYear();

  const favoriteStatus = favoriteIdentifiers.has(item.identifier);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favoriteStatus) {
      removeFavorite(item.identifier);
      addToast(t('favorites:removed'), 'info');
    } else {
      addFavorite(item);
      addToast(t('favorites:added'), 'success');
    }
  };

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg dark:hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group animate-fade-in relative border border-gray-200 dark:border-transparent"
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
        aria-label={favoriteStatus ? t('itemCard:removeFavorite') : t('itemCard:addFavorite')}
      >
        <StarIcon className="w-5 h-5" filled={favoriteStatus} />
      </button>

      <div className="relative aspect-w-3 aspect-h-4">
        <img
          src={thumbnailUrl}
          alt={`Thumbnail for ${item.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // prevent infinite loop
            target.src = 'https://picsum.photos/300/400?grayscale';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end p-4">
            <div>
                 <h3 className="text-md font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-3" title={item.title}>
                    {item.title}
                </h3>
                <p className="text-sm text-gray-300 truncate mt-1" title={creatorName}>{creatorName}</p>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">{publicYear || 'N/A'}</p>
                    <span className="text-xs capitalize bg-gray-700/80 text-cyan-300 px-2 py-1 rounded-full">{item.mediatype}</span>
                </div>
            </div>
        </div>
      </div>
    </article>
  );
});