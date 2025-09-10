import React from 'react';
import type { ArchiveItemSummary } from '../../types';
import { Spinner } from '../Spinner';
import { useLanguage } from '../../contexts/LanguageContext';
import { PlayIcon } from '../Icons';

interface HeroSectionProps {
    item: ArchiveItemSummary | null;
    isLoading: boolean;
    onSelectItem: (item: ArchiveItemSummary) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ item, isLoading, onSelectItem }) => {
    const { t } = useLanguage();

    if (isLoading) {
        return (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-800 animate-pulse flex items-center justify-center">
                 <Spinner size="lg" />
            </div>
        );
    }

    if (!item) {
        return null; // Or some fallback
    }
    
    const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;
    const publicYear = new Date(item.publicdate).getFullYear();

    return (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-2xl shadow-black/30">
            <img 
                src={thumbnailUrl} 
                alt={`Backdrop for ${item.title}`} 
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://picsum.photos/1280/720?grayscale';
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 text-white">
                <div className="max-w-xl">
                    <span className="text-sm font-bold uppercase tracking-widest text-cyan-400">{t('cinematheque.heroFeatured')}</span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold mt-2 leading-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>{item.title}</h1>
                    <p className="text-lg font-medium text-gray-300 mt-1">{publicYear} &bull; {Array.isArray(item.creator) ? item.creator[0] : item.creator}</p>
                    <button 
                        onClick={() => onSelectItem(item)}
                        className="mt-6 inline-flex items-center space-x-3 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 transition-colors font-bold rounded-lg shadow-lg"
                    >
                       <PlayIcon className="w-6 h-6" />
                       <span>{t('cinematheque.watchNow')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};