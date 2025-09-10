import React, { useState, useMemo } from 'react';
import { ResultsGrid } from '../components/ResultsGrid';
import { useFavorites } from '../contexts/FavoritesContext';
import { useUploaderFavorites } from '../contexts/UploaderFavoritesContext';
import type { ArchiveItemSummary } from '../types';
import { StarIcon, UsersIcon, CollectionIcon } from '../components/Icons';
import { UploaderCard } from '../components/UploaderCard';
import { UPLOADER_DATA } from './uploaderData';
import { useLanguage } from '../contexts/LanguageContext';

interface FavoritesViewProps {
    onSelectItem: (item: ArchiveItemSummary) => void;
    onSelectUploader: (uploaderName: string) => void;
}

type FavoriteTab = 'items' | 'uploaders' | 'collections';

const TabButton: React.FC<{label: string; isActive: boolean; onClick: () => void}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}
        role="tab"
        aria-selected={isActive}
    >
        {label}
    </button>
);


export const FavoritesView: React.FC<FavoritesViewProps> = ({ onSelectItem, onSelectUploader }) => {
    const { favorites } = useFavorites();
    const { favoriteUploaders } = useUploaderFavorites();
    const [activeTab, setActiveTab] = useState<FavoriteTab>('items');
    const { t } = useLanguage();

    const favoritedUploaderDetails = useMemo(() => {
        return UPLOADER_DATA.filter(uploader => favoriteUploaders.includes(uploader.searchUploader));
    }, [favoriteUploaders]);
    
    const renderContent = () => {
        switch (activeTab) {
            case 'items':
                return favorites.length > 0 ? (
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
                        <h2 className="text-2xl font-bold text-white">{t('favorites.noFavItems')}</h2>
                        <p className="text-gray-400 mt-2">{t('favorites.noFavItemsDesc')}</p>
                    </div>
                );
            case 'uploaders':
                 return favoritedUploaderDetails.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {favoritedUploaderDetails.map((uploader, index) => (
                            <UploaderCard 
                                key={uploader.searchUploader}
                                uploader={uploader}
                                onClick={() => onSelectUploader(uploader.searchUploader)}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-800/60 rounded-lg">
                        <UsersIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h2 className="text-2xl font-bold text-white">{t('favorites.noFavUploaders')}</h2>
                        <p className="text-gray-400 mt-2">{t('favorites.noFavUploadersDesc')}</p>
                    </div>
                );
            case 'collections':
                 return (
                    <div className="text-center py-20 bg-gray-800/60 rounded-lg">
                        <CollectionIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h2 className="text-2xl font-bold text-white">{t('favorites.comingSoon')}</h2>
                        <p className="text-gray-400 mt-2">{t('favorites.comingSoonDesc')}</p>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="space-y-8">
            <header className="p-6 bg-gray-800/60 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-cyan-400 mb-2 flex items-center">
                    <StarIcon className="w-8 h-8 mr-3 text-yellow-400" filled /> {t('favorites.title')}
                </h1>
                <p className="text-gray-300">{t('favorites.description')}</p>
            </header>

            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton label={t('favorites.items')} isActive={activeTab === 'items'} onClick={() => setActiveTab('items')} />
                    <TabButton label={t('favorites.uploaders')} isActive={activeTab === 'uploaders'} onClick={() => setActiveTab('uploaders')} />
                    <TabButton label={t('favorites.collections')} isActive={activeTab === 'collections'} onClick={() => setActiveTab('collections')} />
                </nav>
            </div>

            <div className="animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};