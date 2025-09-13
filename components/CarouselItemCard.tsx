import React from 'react';
import type { ArchiveItemSummary } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { InfoIcon } from './Icons';
import { formatNumber } from '../utils/formatter';

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
  const isRestricted = item['access-restricted-item'] === 'true';

  const aspectClasses = {
    portrait: 'aspect-[3/4]',
    video: 'aspect-video',
    square: 'aspect-square',
  };

  const creatorName = Array.isArray(item.creator) ? item.creator.join(', ') : item.creator || t('itemCard:unknownCreator');

  return (
    <div
      className="flex-shrink-0 w-40 sm:w-48 cursor-pointer group focus-within:ring-2 focus-within:ring-accent-400 rounded-lg scroll-snap-align-start"
      style={{ animationDelay: `${Math.min(index % 20 * 30, 600)}ms`}}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(item)}
      aria-label={t('itemCard:viewDetails', { title: item.title })}
    >
      <div className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-accent-500/10 dark:hover:shadow-accent-500/30 transition-shadow duration-300 ${aspectClasses[aspectRatio]}`}>
        {isRestricted && (
          <div className="absolute top-2 left-2 z-10 p-1.5 bg-black/60 rounded-full" title={t('modals:details.restrictedItemTooltip')}>
            <InfoIcon className="w-4 h-4 text-yellow-400" />
          </div>
        )}
        <img
          src={thumbnailUrl}
          alt={`Thumbnail for ${item.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallbackUrl = `https://archive.org/download/${item.identifier}/__ia_thumb.jpg`;
            const placeholderUrl = 'https://picsum.photos/400/400?grayscale';

            if (target.src.includes('__ia_thumb.jpg')) {
                target.onerror = null;
                target.src = placeholderUrl;
            } else {
                target.src = fallbackUrl;
            }
          }}
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <div className="pt-2 px-1">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors h-10 line-clamp-2" title={item.title}>
          {item.title}
        </h3>
        <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={creatorName}>{publicYear || 'N/A'}</p>
            {typeof item.week === 'number' && item.week > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{formatNumber(item.week)}</p>
            )}
        </div>
      </div>
    </div>
  );
});