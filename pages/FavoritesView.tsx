import React from 'react';
import { ResultsGrid } from '../components/ResultsGrid';
import { useFavorites } from '../contexts/FavoritesContext';
import type { ArchiveItemSummary } from '../types';
import { StarIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface FavoritesViewProps {
    onSelectItem: (item: ArchiveItemSummary) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onSelectItem }) => {
    const { favorites } = useFavorites();
    const { t } = useLanguage();
    
    return (
        <div className="space-y-8">
            <header className="p-6 bg-gray-800/60 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-cyan-400 mb-2 flex items-center">
                    <StarIcon className="w-8 h-8 mr-3 text-yellow-400" filled /> {t('favorites:title')}
                </h1>
                <p className="text-gray-300">{t('favorites:description')}</p>
            </header>

            <div className="animate-fade-in">
                {favorites.length > 0 ? (
                    <ResultsGrid
                        results={favorites}
                        isLoading={false}
                        isLoadingMore={false}
                        error={null}
                        onSelectItem={onSelectItem}
                        hasMore={false}
                        totalResults={favorites.length}
                    />
                ) : (
                    <div className="text-center py-20 bg-gray-800/60 rounded-lg">
                        <StarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h2 className="text-2xl font-bold text-white">{t('favorites:noFavItems')}</h2>
                        <p className="text-gray-400 mt-2">{t('favorites:noFavItemsDesc')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};