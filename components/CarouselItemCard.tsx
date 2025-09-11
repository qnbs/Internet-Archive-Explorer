import React from 'react';
import type { ArchiveItemSummary } from '../types';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';

export type AspectRatio = 'video' | 'square' | 'portrait';

interface CarouselItemCardProps {
  item: ArchiveItemSummary;
  onSelect: (item: ArchiveItemSummary) => void;
  aspectRatio: AspectRatio;
  index: number;
}

export const CarouselItemCard: React.FC<CarouselItemCardProps> = React.memo(({ item, onSelect, aspectRatio, index }) => {
  const { t } = useLanguage();
  const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;
  const publicYear = new Date(item.publicdate).getFullYear();

  const aspectClasses = {
    portrait: 'aspect-[3/4]',
    video: 'aspect-video',
    square: 'aspect-square',
  };

  const creatorName = Array.isArray(item.creator) ? item.creator.join(', ') : item.creator || t('itemCard:unknownCreator');

  return (
    <div
      className="flex-shrink-0 w-40 sm:w-48 cursor-pointer group focus-within:ring-2 focus-within:ring-cyan-400 rounded-lg scroll-snap-align-start"
      style={{ animationDelay: `${Math.min(index % 20 * 30, 600)}ms`}}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(item)}
      aria-label={t('itemCard:viewDetails', { title: item.title })}
    >
      <div className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/30 transition-shadow duration-300 ${aspectClasses[aspectRatio]}`}>
        <img
          src={thumbnailUrl}
          alt={`Thumbnail for ${item.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // prevent infinite loop
            target.src = 'https://picsum.photos/400/400?grayscale';
          }}
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <div className="pt-2 px-1">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors h-10 line-clamp-2" title={item.title}>
          {item.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={creatorName}>{publicYear || 'N/A'}</p>
      </div>
    </div>
  );
});