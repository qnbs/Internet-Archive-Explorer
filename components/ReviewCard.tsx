import React from 'react';
import type { ArchiveItemSummary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { StarIcon } from './Icons';

interface ReviewCardProps {
    item: ArchiveItemSummary;
    onItemSelect: (item: ArchiveItemSummary) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ item, onItemSelect }) => {
    const { t, language } = useLanguage();
    const reviewDate = item.reviewdate ? new Date(item.reviewdate).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    
    // A simple star rating simulation
    const renderStars = () => {
        const rating = Math.floor(Math.random() * 3) + 3; // Random 3-5 stars
        return Array.from({length: 5}).map((_, i) => (
            <StarIcon key={i} className="w-4 h-4 text-yellow-400" filled={i < rating} />
        ));
    };

    return (
        <article className="bg-gray-800/60 p-5 rounded-lg border border-gray-700/50">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center mb-1">{renderStars()}</div>
                    <h3 className="font-bold text-white text-lg">{item.reviewtitle}</h3>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-4">{reviewDate}</span>
            </div>
            <p className="text-sm text-gray-300 mt-3 line-clamp-4">{item.reviewbody}</p>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-500 mb-1">{t('reviewCard.reviewOf')}:</p>
                <button 
                    onClick={() => onItemSelect(item)} 
                    className="text-sm font-semibold text-cyan-400 hover:underline text-left"
                >
                    {item.title}
                </button>
            </div>
        </article>
    );
};
