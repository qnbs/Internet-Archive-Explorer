import React from 'react';
import type { ArchiveItemSummary } from '../../types';
import { JoystickIcon, InfoIcon, StarIcon } from './Icons';
import { useLanguage } from '../hooks/useLanguage';
import { useSetAtom } from 'jotai';
import { modalAtom } from '../store/app';

interface RecRoomItemCardProps {
  item: ArchiveItemSummary;
  index: number;
}

export const RecRoomItemCard: React.FC<RecRoomItemCardProps> = React.memo(({ item, index }) => {
  const { t } = useLanguage();
  const setModal = useSetAtom(modalAtom);
  
  const getCreator = (creator: string | string[] | undefined): string => {
    if (!creator) return t('itemCard:unknownCreator');
    if (Array.isArray(creator)) return creator.join(', ');
    return creator;
  };
  
  const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;
  const creatorName = getCreator(item.creator);
  const publicYear = new Date(item.publicdate).getFullYear();
  const isRestricted = item['access-restricted-item'] === 'true';
  const rating = item.avg_rating ? parseFloat(item.avg_rating).toFixed(1) : null;
  
  const handleSelect = () => {
      setModal({ type: 'emulator', item });
  }

  return (
    <div
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-accent-500/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group focus-within:ring-2 focus-within:ring-accent-400 animate-fade-in w-64 sm:w-72 flex-shrink-0 scroll-snap-align-start"
      style={{ animationDelay: `${Math.min(index % 24 * 30, 500)}ms`, opacity: 0 }}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect()}
      aria-label={t('recRoom:card.startItem', { title: item.title })}
    >
      <div className="relative aspect-w-4 aspect-h-3">
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
            const placeholderUrl = 'https://picsum.photos/400/300?grayscale';

            if (target.src.includes('__ia_thumb.jpg')) {
                target.onerror = null;
                target.src = placeholderUrl;
            } else {
                target.src = fallbackUrl;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end p-4">
            <div>
                <h3 className="text-md font-semibold text-white group-hover:text-accent-400 transition-colors line-clamp-2" title={item.title}>
                  {item.title}
                </h3>
                <p className="text-sm text-gray-300 truncate mt-1" title={creatorName}>{creatorName}</p>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">{publicYear || 'N/A'}</p>
                    {rating && (
                        <div className="flex items-center gap-1 text-xs text-yellow-400" title={t('recRoom:ratingTooltip', { rating })}>
                            <StarIcon className="w-3.5 h-3.5" filled />
                            <span className="font-semibold">{rating}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="flex flex-col items-center text-white">
                <JoystickIcon className="w-12 h-12" />
                <span className="mt-2 text-lg font-bold">{t('recRoom:card.start')}</span>
           </div>
        </div>
      </div>
    </div>
  );
});
