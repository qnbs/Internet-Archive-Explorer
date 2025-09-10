import React from 'react';
import type { ArchiveItemSummary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const getCreator = (creator: string | string[] | undefined, t: (key: string) => string): string => {
    if (!creator) return t('itemCard.unknownCreator');
    if (Array.isArray(creator)) return creator.join(', ');
    return creator;
};

export const ReviewCard: React.FC<{ item: ArchiveItemSummary, onSelect: (item: ArchiveItemSummary) => void, index: number }> = ({ item, onSelect, index }) => {
    const { t, language } = useLanguage();

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const isoDate = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
        return new Date(isoDate).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;
    const creatorName = getCreator(item.creator, t);
    
    return (
        <div 
            className="bg-gray-800 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col sm:flex-row space-x-0 sm:space-x-4 p-4 animate-fade-in"
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, opacity: 0 }}
            onClick={() => onSelect(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(item)}
            aria-label={`View item ${item.title} and its review`}
        >
            <div className="flex-shrink-0 w-24 h-32 sm:w-28 sm:h-36 bg-gray-700 rounded-md overflow-hidden mx-auto sm:mx-0">
                <img 
                    src={thumbnailUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // prevent infinite loop
                        target.src = 'https://picsum.photos/200/300?grayscale';
                    }}
                />
            </div>
            <div className="flex-1 mt-4 sm:mt-0 text-center sm:text-left">
                <p className="text-sm text-gray-400">{t('reviewCard.reviewOf')}</p>
                <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2" title={item.title}>{item.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-1 truncate" title={creatorName}>{creatorName}</p>

                <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="font-semibold text-cyan-400 line-clamp-2" title={item.reviewtitle}>{item.reviewtitle || t('reviewCard.noTitle')}</h4>
                    <p className="text-xs text-gray-500 mb-2">{formatDate(item.reviewdate)}</p>
                    <p className="text-sm text-gray-300 line-clamp-3">{item.reviewbody}</p>
                </div>
            </div>
        </div>
    );
};