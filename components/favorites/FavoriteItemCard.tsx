import React from 'react';
import type { ArchiveItemSummary } from '../../types';
import { useSetAtom } from 'jotai';
// FIX: Correct import path for jotai atoms.
import { addFavoriteAtom, removeFavoriteAtom, modalAtom } from '../../store';
import { useToast } from '../../contexts/ToastContext';
import { StarIcon, CloseIcon } from '../Icons';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../../hooks/useLanguage';
import { useSetAtom as useSetModalAtom } from 'jotai';

interface FavoriteItemCardProps {
  item: ArchiveItemSummary;
  index: number;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (identifier: string) => void;
}

export const FavoriteItemCard: React.FC<FavoriteItemCardProps> = React.memo(({ item, index, isSelectMode, isSelected, onToggleSelect }) => {
  const { addToast } = useToast();
  const { t } = useLanguage();
  
  const setModal = useSetModalAtom(modalAtom);
  const removeFavorite = useSetAtom(removeFavoriteAtom);

  const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;
  const creatorName = Array.isArray(item.creator) ? item.creator.join(', ') : item.creator || t('itemCard:unknownCreator');
  const publicYear = new Date(item.publicdate).getFullYear();

  const handleCardClick = () => {
    if (isSelectMode) {
      onToggleSelect(item.identifier);
    } else {
      setModal({ type: 'itemDetail', item });
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavorite(item.identifier);
    addToast(t('favorites:removed'), 'info');
  };

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg dark:hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group animate-fade-in relative border border-gray-200 dark:border-transparent"
      style={{ animationDelay: `${Math.min(index % 24 * 30, 500)}ms`, opacity: 0 }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
      aria-label={t('itemCard:viewDetails', { title: item.title })}
      aria-selected={isSelected}
    >
      {!isSelectMode && (
        <button 
          onClick={handleRemoveClick}
          className="absolute top-2 right-2 z-20 p-2 bg-black/50 rounded-full text-white hover:text-red-400 transition-colors"
          aria-label={t('itemCard:removeFavorite')}
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      )}

      <div className="relative aspect-w-3 aspect-h-4">
        <img
          src={thumbnailUrl}
          alt={`Thumbnail for ${item.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
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
        
        {isSelectMode && (
            <div className={`absolute inset-0 transition-all duration-200 ${isSelected ? 'bg-cyan-500/40' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}>
                <div className="absolute top-2 left-2 w-6 h-6 bg-gray-900/50 border-2 border-white rounded-md flex items-center justify-center">
                    {isSelected && <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </div>
            </div>
        )}
      </div>
    </article>
  );
});