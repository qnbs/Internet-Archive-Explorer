import React, { useState, useMemo, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { libraryItemsAtom, userCollectionsAtom } from '../store/favorites';
import type { LibraryItem, LibraryFilter, MediaType } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { LibrarySidebar } from '../components/library/LibrarySidebar';
import { LibraryDashboard } from '../components/library/LibraryDashboard';
import { LibraryCollectionView } from '../components/library/LibraryCollectionView';
import { UploaderFavoritesTab } from '../components/library/UploaderFavoritesTab';
import { FilterIcon } from '../components/Icons';

const LibraryView: React.FC = () => {
    const { t } = useLanguage();
    const allItems = useAtomValue(libraryItemsAtom);
    const collections = useAtomValue(userCollectionsAtom);
    
    const [activeTab, setActiveTab] = useState<'items' | 'uploaders'>('items');
    const [filter, setFilter] = useState<LibraryFilter>({ type: 'dashboard' });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const allItemsArray: LibraryItem[] = useMemo(() => Object.values(allItems), [allItems]);

    const filteredItems = useMemo(() => {
        let items = [...allItemsArray].sort((a, b) => b.addedAt - a.addedAt);
        if (activeTab !== 'items') return [];

        switch (filter.type) {
            case 'collection':
                const collection = collections.find(c => c.id === filter.id);
                const itemIds = new Set(collection?.itemIdentifiers || []);
                return items.filter(item => itemIds.has(item.identifier));
            case 'tag':
                return items.filter(item => item.tags.includes(filter.tag));
            case 'untagged':
                return items.filter(item => item.tags.length === 0);
            case 'mediaType':
                return items.filter(item => item.mediatype === filter.mediaType);
            case 'all':
                return items;
            case 'dashboard':
            default:
                return []; // Dashboard doesn't show a list
        }
    }, [allItemsArray, filter, collections, activeTab]);

    const handleSetFilter = (newFilter: LibraryFilter) => {
        setFilter(newFilter);
        setIsSidebarOpen(false); // Close sidebar on selection in mobile
    };

    const renderContent = () => {
        if (activeTab === 'uploaders') {
            return <UploaderFavoritesTab />;
        }
        
        if (filter.type === 'dashboard') {
            return <LibraryDashboard setFilter={handleSetFilter} />;
        }

        return <LibraryCollectionView items={filteredItems} filter={filter} />;
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full animate-page-fade-in">
             {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}>
                    <div className="bg-gray-900 w-72 h-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <LibrarySidebar 
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            filter={filter}
                            setFilter={handleSetFilter}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}
            <div className="hidden md:block">
                 <LibrarySidebar 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    filter={filter}
                    setFilter={handleSetFilter}
                />
            </div>
             <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-4 md:hidden">
                    <h1 className="text-2xl font-bold text-white">{t('sideMenu:library')}</h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-gray-300 bg-gray-800/60 rounded-lg hover:bg-gray-700">
                        <FilterIcon className="w-5 h-5" />
                    </button>
                </div>
                {renderContent()}
             </div>
        </div>
    );
};

export default LibraryView;