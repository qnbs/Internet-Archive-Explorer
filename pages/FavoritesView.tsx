import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
// FIX: Correct import path for jotai atom.
import { activeViewAtom } from '../store';
import { StarIcon, UsersIcon, CollectionIcon, BookIcon } from '../components/Icons';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';

// Import the new tab components
import { ItemFavoritesTab } from '../components/favorites/ItemFavoritesTab';
import { UploaderFavoritesTab } from '../components/favorites/UploaderFavoritesTab';
import { CollectionsFavoritesTab } from '../components/favorites/CollectionsFavoritesTab';

type FavoriteTab = 'items' | 'uploaders' | 'collections';

const TabButton: React.FC<{
    tabId: FavoriteTab;
    label: string;
    icon: React.ReactNode;
    activeTab: FavoriteTab;
    onClick: (tab: FavoriteTab) => void;
}> = ({ tabId, label, icon, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tabId)}
        role="tab"
        aria-selected={activeTab === tabId}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === tabId
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700/50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export const FavoritesView: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<FavoriteTab>('items');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'items':
                return <ItemFavoritesTab />;
            case 'uploaders':
                return <UploaderFavoritesTab />;
            case 'collections':
                return <CollectionsFavoritesTab />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-page-fade-in">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-3">
                     <StarIcon className="w-8 h-8 text-yellow-400" filled />
                     {t('favorites:title')}
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('favorites:description')}</p>
            </header>

            <div className="bg-gray-800/60 p-2 rounded-xl border border-gray-700/50 flex flex-wrap gap-2" role="tablist" aria-label={t('favorites:aria.librarySections')}>
                <TabButton 
                    tabId="items"
                    label={t('favorites:items')}
                    icon={<CollectionIcon className="w-5 h-5" />}
                    activeTab={activeTab}
                    onClick={setActiveTab}
                />
                <TabButton 
                    tabId="uploaders"
                    label={t('favorites:uploaders')}
                    icon={<UsersIcon className="w-5 h-5" />}
                    activeTab={activeTab}
                    onClick={setActiveTab}
                />
                 <TabButton 
                    tabId="collections"
                    label={t('favorites:collections')}
                    icon={<BookIcon className="w-5 h-5" />}
                    activeTab={activeTab}
                    onClick={setActiveTab}
                />
            </div>

            <main>
                {renderTabContent()}
            </main>
        </div>
    );
};