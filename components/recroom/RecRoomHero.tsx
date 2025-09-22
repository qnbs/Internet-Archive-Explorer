import React, { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { selectItemAtom } from '../../store/app';
import type { ArchiveItemSummary } from '../../types';
import { searchArchive } from '../../services/archiveService';
import { Spinner } from '../Spinner';
import { useLanguage } from '../../hooks/useLanguage';

export const RecRoomHero: React.FC = () => {
    const [item, setItem] = useState<ArchiveItemSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();
    const selectItem = useSetAtom(selectItemAtom);

    useEffect(() => {
        const fetchFeatured = async () => {
            setIsLoading(true);
            try {
                // Fetch a random, highly-rated game to feature
                const data = await searchArchive('collection:softwarelibrary_msdos_games AND avg_rating:[4.5 TO 5]', 1, ['-random'], undefined, 1);
                if (data.response?.docs.length > 0) {
                    setItem(data.response.docs[0]);
                } else {
                     // Fallback to a popular DOS game if the rated query fails
                    const fallbackData = await searchArchive('collection:softwarelibrary_msdos_games', 1, ['-downloads'], undefined, 1);
                    if (fallbackData.response?.docs.length > 0) {
                        setItem(fallbackData.response.docs[0]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch featured game', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (isLoading) {
        return <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center animate-pulse"></div>;
    }
    
    if (!item) return null;
    
    const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;

    return (
        <div 
            className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-end p-6 sm:p-8 text-white cursor-pointer group"
            onClick={() => selectItem(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && selectItem(item)}
        >
            <img src={thumbnailUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="relative z-10">
                <p className="text-sm font-semibold text-accent-400 uppercase tracking-wider">{t('recRoom:heroFeatured')}</p>
                <h2 className="text-3xl lg:text-5xl font-bold mt-2 line-clamp-2">{item.title}</h2>
                <button className="mt-4 px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-105">
                    {t('recRoom:playNow')}
                </button>
            </div>
        </div>
    );
};