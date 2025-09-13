
import React, { useState, useMemo, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { libraryItemsAtom, userCollectionsAtom } from '../store/favorites';
import { UploaderFavoritesTab } from '../components/favorites/UploaderFavoritesTab';
import type { LibraryItem, LibraryFilter } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { LibrarySidebar } from '../components/library/LibrarySidebar';
import { LibraryItemList } from '../components/library/LibraryItemList';
import { LibraryDetailPane } from '../components/library/LibraryDetailPane';
import { StarIcon, FilterIcon } from '../components/Icons';

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
    const allItems = useAtomValue(libraryItemsAtom);
    const collections = useAtomValue(userCollectionsAtom);
    
    const [activeTab, setActiveTab] = useState<'items' | 'uploaders'>('items');
    const [filter, setFilter] = useState<LibraryFilter>({ type: 'all' });
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const filteredItems = useMemo(() => {
        let items = [...allItems].sort((a, b) => b.addedAt - a.addedAt);
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
            case 'all':
            default:
                return items;
        }
    }, [allItems, filter, collections, activeTab]);

    const selectedItem = useMemo(() => {
        return allItems.find(item => item.identifier === selectedItemId) || null;
    }, [allItems, selectedItemId]);

    // When filter changes, deselect item if it's not in the new filtered list
    useEffect(() => {
        if (selectedItemId && !filteredItems.some(i => i.identifier === selectedItemId)) {
            setSelectedItemId(null);
        }
    }, [filteredItems, selectedItemId]);

    const renderContent = () => {
        if (activeTab === 'uploaders') {
            return <UploaderFavoritesTab />;
        }
        
        if (allItems.length === 0) {
            return (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <LibraryEmptyState />
                </div>
            );
        }

        return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[calc(100vh-12rem)]">
                <div className="lg:col-span-1">
                    <LibraryItemList
                        items={filteredItems}
                        filter={filter}
                        selectedItemId={selectedItemId}
                        onSelectItem={setSelectedItemId}
                        onOpenFilters={() => setIsSidebarOpen(true)}
                    />
                </div>
                <div className="hidden lg:block lg:col-span-2">
                    <LibraryDetailPane selectedItem={selectedItem} onBack={() => setSelectedItemId(null)} />
                </div>
                {selectedItem && (
                    <div className="fixed inset-0 bg-gray-900 z-20 p-4 md:p-6 lg:hidden animate-fade-in-left">
                        <LibraryDetailPane selectedItem={selectedItem} onBack={() => setSelectedItemId(null)} />
                    </div>
                )}
            </div>
        );
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
                            setFilter={setFilter}
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
                    setFilter={setFilter}
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
