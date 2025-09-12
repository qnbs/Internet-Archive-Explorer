import React, { useState, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
// FIX: Use direct imports to prevent circular dependency issues.
import { libraryItemsAtom, userCollectionsAtom } from '../store/favorites';
import type { LibraryItem, LibraryFilter, MediaType } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { StarIcon, UsersIcon } from '../components/Icons';
import { UploaderFavoritesTab } from '../components/favorites/UploaderFavoritesTab';
import { LibrarySidebar } from '../components/library/LibrarySidebar';
// FIX: Correct import for LibraryItemList from the new file
import { LibraryItemList } from '../components/library/LibraryItemList';
import { LibraryDetailPane } from '../components/library/LibraryDetailPane';


const LibraryEmptyState: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8 col-span-2">
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
    React.useEffect(() => {
        if (selectedItemId && !filteredItems.some(item => item.identifier === selectedItemId)) {
            setSelectedItemId(null);
        }
    }, [filter, filteredItems, selectedItemId]);

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-10rem)] animate-page-fade-in">
            <LibrarySidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filter={filter}
                setFilter={setFilter}
            />
            <main className="flex-grow flex flex-col md:flex-row gap-6 min-w-0">
                {activeTab === 'items' && (
                    <>
                        {libraryItems.length === 0 ? (
                            <LibraryEmptyState />
                        ) : (
                            <>
                                <div className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0">
                                    <LibraryItemList 
                                        items={filteredItems}
                                        filter={filter}
                                        selectedItemId={selectedItemId}
                                        onSelectItem={setSelectedItemId}
                                    />
                                </div>
                                <div className="w-full md:w-3/5 lg:w-2/3 flex-shrink-0 hidden md:block">
                                     <LibraryDetailPane 
                                        selectedItem={selectedItem}
                                     />
                                </div>
                            </>
                        )}
                    </>
                )}
                {activeTab === 'uploaders' && (
                    <div className="w-full">
                        <UploaderFavoritesTab />
                    </div>
                )}
            </main>
        </div>
    );
};

export default LibraryView;