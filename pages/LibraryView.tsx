import React, { useState, useMemo, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { libraryItemsAtom, userCollectionsAtom } from '../store/favorites';
import type { LibraryItem, LibraryFilter } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { StarIcon } from '../components/Icons';
import { UploaderFavoritesTab } from '../components/favorites/UploaderFavoritesTab';
import { LibrarySidebar } from '../components/library/LibrarySidebar';
import { LibraryItemList } from '../components/library/LibraryItemList';
import { LibraryDetailPane } from '../components/library/LibraryDetailPane';


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
    const [activeTab, setActiveTab] = useState<'items' | 'uploaders'>('items');
    const [filter, setFilter] = useState<LibraryFilter>({ type: 'all' });
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const libraryItems = useAtomValue(libraryItemsAtom);
    const collections = useAtomValue(userCollectionsAtom);
    const { t } = useLanguage();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredItems = useMemo(() => {
        let items = [...libraryItems];
        switch (filter.type) {
            case 'mediaType':
                items = items.filter(item => item.mediatype === filter.mediaType);
                break;
            case 'collection':
                const collection = collections.find(c => c.id === filter.id);
                const itemIds = new Set(collection?.itemIdentifiers || []);
                items = items.filter(item => itemIds.has(item.identifier));
                break;
            case 'tag':
                items = items.filter(item => item.tags.includes(filter.tag));
                break;
            case 'untagged':
                 items = items.filter(item => item.tags.length === 0);
                 break;
        }
        return items;
    }, [libraryItems, filter, collections]);

    const selectedItem = useMemo(() => 
        libraryItems.find(item => item.identifier === selectedItemId) || null,
        [selectedItemId, libraryItems]
    );

    // When filter changes, if selected item is no longer in the filtered list, deselect it.
    useEffect(() => {
        if (selectedItemId && !filteredItems.some(item => item.identifier === selectedItemId)) {
            setSelectedItemId(null);
        }
    }, [filter, filteredItems, selectedItemId]);

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full animate-page-fade-in">
            <div className="hidden md:block">
                <LibrarySidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    filter={filter}
                    setFilter={setFilter}
                />
            </div>

            {isFilterOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsFilterOpen(false)}>
                    <div className="absolute inset-y-0 left-0 w-4/5 max-w-xs bg-gray-800 shadow-xl animate-fade-in-left" onClick={e => e.stopPropagation()}>
                        <LibrarySidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            filter={filter}
                            setFilter={setFilter}
                            onClose={() => setIsFilterOpen(false)}
                         />
                    </div>
                </div>
            )}

            <main className="flex-grow flex-col md:flex-row gap-6 min-w-0 flex">
                {activeTab === 'items' ? (
                    libraryItems.length === 0 ? (
                        <LibraryEmptyState />
                    ) : (
                        <div className="relative flex-grow overflow-hidden md:flex md:gap-6">
                            {/* Item List Panel */}
                            <div className={`absolute inset-0 transition-transform duration-300 ease-in-out md:relative md:w-2/5 lg:w-1/3 md:flex-shrink-0 ${selectedItemId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                                <LibraryItemList 
                                    items={filteredItems}
                                    filter={filter}
                                    selectedItemId={selectedItemId}
                                    onSelectItem={setSelectedItemId}
                                    onOpenFilters={() => setIsFilterOpen(true)}
                                />
                            </div>

                            {/* Detail Pane */}
                            <div className={`absolute inset-0 transition-transform duration-300 ease-in-out md:relative md:w-3/5 lg:w-2/3 md:flex-shrink-0 ${selectedItemId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                                 <LibraryDetailPane 
                                    selectedItem={selectedItem}
                                    onBack={() => setSelectedItemId(null)}
                                 />
                            </div>
                        </div>
                    )
                ) : (
                    <div className="w-full">
                        <UploaderFavoritesTab />
                    </div>
                )}
            </main>
        </div>
    );
};

export default LibraryView;
