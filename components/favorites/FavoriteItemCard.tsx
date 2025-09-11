import React from 'react';
import type { LibraryItem } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface LibraryItemCardProps {
  item: LibraryItem;
  isSelected: boolean;
  onSelect: () => void;
  isSelectMode: boolean;
  isDetailViewTarget: boolean; // Is this the item currently shown in the detail pane?
}

export const FavoriteItemCard: React.FC<LibraryItemCardProps> = React.memo(({ item, isSelected, onSelect, isSelectMode, isDetailViewTarget }) => {
  const { t } = useLanguage();
  
  const creatorName = Array.isArray(item.creator) ? item.creator.join(', ') : item.creator || t('itemCard:unknownCreator');

  return (
    <article
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      aria-pressed={isDetailViewTarget}
      aria-selected={isSelectMode ? isSelected : undefined}
      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
        isDetailViewTarget 
          ? 'bg-cyan-500/20 border-cyan-500' 
          : 'bg-gray-800/60 border-transparent hover:bg-gray-700/80'
      } ${isSelectMode && isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-cyan-400' : ''}`}
    >
        {isSelectMode && (
             <div className="flex-shrink-0 mt-1 w-5 h-5 bg-gray-900/50 border-2 border-gray-400 rounded-md flex items-center justify-center">
                {isSelected && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </div>
        )}
      <img
        src={`https://archive.org/services/get-item-image.php?identifier=${item.identifier}`}
        alt=""
        className="w-12 h-16 object-cover rounded-sm flex-shrink-0 bg-gray-700"
        loading="lazy"
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
      <div className="flex-grow min-w-0">
        <h3 className={`font-semibold text-sm truncate ${isDetailViewTarget ? 'text-white' : 'text-gray-200'}`} title={item.title}>
          {item.title}
        </h3>
        <p className="text-xs text-gray-400 truncate" title={creatorName}>{creatorName}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-gray-700 text-cyan-300 px-1.5 py-0.5 rounded">
                    {tag}
                </span>
            ))}
        </div>
      </div>
    </article>
  );
});