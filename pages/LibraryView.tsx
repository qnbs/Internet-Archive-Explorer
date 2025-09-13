import React, { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { libraryItemsAtom } from '../store/favorites';
import { modalAtom } from '../store/app';
import type { ArchiveItemSummary } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { StarIcon, UsersIcon } from '../components/Icons';
import { UploaderFavoritesTab } from '../components/favorites/UploaderFavoritesTab';
import { ResultsGrid } from '../components/ResultsGrid';

const LibraryEmptyState: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8 col-span-full">
            <StarIcon className="w-16 h-16 text-gray-700 mb-4" />
            <h2 className="text-xl font-bold text-white">{t('favorites:noItemsTitle')}</h2>
            <p className="mt-2 max-w-sm">{t('favorites:noItemsDesc')}</p>
        </div>
    );
};

const LibraryView: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'items' | 'uploaders'>('items');
    const libraryItems = useAtomValue(libraryItemsAtom);
    const setModal = useSetAtom(modalAtom);

    const handleSelectItem = (item: ArchiveItemSummary) => {
        setModal({ type: 'itemDetail', item });
    };

    return (
        <div className="space-y-6 animate-page-fade-in">
            <header>
                <h1 className="text-3xl font-bold text-white">{t('sideMenu:library')}</h1>
            </header>
            
            <div className="p-1 bg-gray-800/60 rounded-lg flex items-center mb-4 max-w-sm">
                <button onClick={() => setActiveTab('items')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'items' ? 'bg-gray-700 text-white shadow' : 'text-gray-300'}`}>
                    <StarIcon className="w-4 h-4" /> {t('favorites:sidebar.items')}
                </button>
                 <button onClick={() => setActiveTab('uploaders')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'uploaders' ? 'bg-gray-700 text-white shadow' : 'text-gray-300'}`}>
                    <UsersIcon className="w-4 h-4" /> {t('favorites:sidebar.uploaders')}
                </button>
            </div>

            {activeTab === 'items' ? (
                libraryItems.length === 0 ? (
                     <div className="flex items-center justify-center min-h-[50vh]">
                        <LibraryEmptyState />
                    </div>
                ) : (
                    <ResultsGrid
                        results={libraryItems}
                        isLoading={false}
                        isLoadingMore={false}
                        error={null}
                        onSelectItem={handleSelectItem}
                        hasMore={false}
                        totalResults={libraryItems.length}
                    />
                )
            ) : (
                <UploaderFavoritesTab />
            )}
        </div>
    );
};

export default LibraryView;
