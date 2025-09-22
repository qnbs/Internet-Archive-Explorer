import React, { useState, useMemo, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { libraryItemsAtom } from '../../store/favorites';
import type { LibraryItem, LibraryFilter } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { LibraryItemList } from './LibraryItemList';
import { LibraryDetailPane } from './LibraryDetailPane';
import { StarIcon } from '../Icons';

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

interface LibraryCollectionViewProps {
    items: LibraryItem[];
    filter: LibraryFilter;
}

export const LibraryCollectionView: React.FC<LibraryCollectionViewProps> = ({ items, filter }) => {
    const allItems = useAtomValue(libraryItemsAtom);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const selectedItem = useMemo(() => {
        return allItems[selectedItemId || ''] || null;
    }, [allItems, selectedItemId]);

    // When filter changes, deselect item if it's not in the new filtered list
    useEffect(() => {
        if (selectedItemId && !items.some(i => i.identifier === selectedItemId)) {
            setSelectedItemId(null);
        }
    }, [items, selectedItemId]);
    
    // Also reset if the main items array becomes empty (e.g. from deleting the last item)
    useEffect(() => {
        if (items.length === 0) {
            setSelectedItemId(null);
        }
    }, [items]);


    if (Object.keys(allItems).length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LibraryEmptyState />
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[calc(100vh-12rem)] animate-fade-in">
            <div className="lg:col-span-1">
                <LibraryItemList
                    items={items}
                    filter={filter}
                    selectedItemId={selectedItemId}
                    onSelectItem={setSelectedItemId}
                    onOpenFilters={() => { /* Handled in parent */ }}
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