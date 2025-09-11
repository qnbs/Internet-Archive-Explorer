import React, { useState, useEffect } from 'react';
import type { ArchiveItemSummary } from '../../types';
import { searchArchive } from '../../services/archiveService';
import { Spinner } from '../Spinner';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../../hooks/useLanguage';

interface HeroSectionProps {
  onSelectItem: (item: ArchiveItemSummary) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectItem }) => {
    const [item, setItem] = useState<ArchiveItemSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchFeatured = async () => {
            setIsLoading(true);
            try {
                // A query for highly-rated, popular feature films
                const data = await searchArchive('collection:feature_films AND reviewdate:[1980-01-01 TO *]', 1, ['-downloads'], undefined, 1);
                if (data.response?.docs.length > 0) {
                    setItem(data.response.docs[0]);
                }
            } catch (error) {
                console.error('Failed to fetch featured film', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (isLoading) {
        return <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center"><Spinner size="lg" /></div>;
    }
    
    if (!item) return null;
    
    const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;
    const creator = Array.isArray(item.creator) ? item.creator.join(', ') : item.creator;

    return (
        <div 
            className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-end p-8 text-white cursor-pointer group"
            onClick={() => onSelectItem(item)}
        >
            <img src={thumbnailUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="relative z-10">
                <p className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">{t('cinematheque:heroFeatured')}</p>
                <h2 className="text-3xl lg:text-5xl font-bold mt-2 line-clamp-2">{item.title}</h2>
                <p className="text-lg text-gray-300 mt-2">{creator}</p>
                <button className="mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg transition-colors">
                    {t('cinematheque:watchNow')}
                </button>
            </div>
        </div>
    );
};