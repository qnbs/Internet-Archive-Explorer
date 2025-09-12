import React, { useState, useMemo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { removeLibraryItemsAtom, modalAtom } from '../../store';
import type { LibraryItem, LibraryFilter, SortKey, SortDirection } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { useDebounce } from '../../hooks/useDebounce';
import { FavoriteItemCard } from '../favorites/FavoriteItemCard';
import { 
    SearchIcon, SortAscendingIcon, SortDescendingIcon, ChevronDownIcon, 
    CollectionIcon, TagIcon, TrashIcon
} from '../Icons';

interface LibraryItemListProps {
    items: LibraryItem[];
    filter: LibraryFilter;
    selectedItemId: string | null;
    onSelectItem: (id: string | null) => void;
}

const SortOptions: React.FC<{
    sortKey: SortKey;
    setSortKey: (k: SortKey) => void;
    sortDirection: SortDirection;
    setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;
}> = ({ sortKey, setSortKey, sortDirection, setSortDirection }) => {
    const { t } = useLanguage();
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{t('favorites:controls.sort')}</span>
            <div className="relative">
                <select
                    value={sortKey}
                    onChange={e => setSortKey(e.target.value as SortKey)}
                    className="bg-gray-700 border border-gray-600 rounded-md py-1.5 px-3 text-sm text-white focus:ring-cyan-500 focus:border-cyan-500 appearance-none pr-8"
                >
                    <option value="dateAdded">{t('favorites:controls.dateAdded')}</option>
                    <option value="title">{t('favorites:controls.title')}</option>
                    <option value="creator">{t('favorites:controls.creator')}</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button
                onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
            >
                {sortDirection === 'asc' ? <SortAscendingIcon /> : <SortDescendingIcon />}
            </button>
        </div>
    );
}

const BulkActionBar: React.FC<{ selectedIds: Set<string>, onClear: () => void }> = ({ selectedIds, onClear }) => {
    const { t } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const removeItems = useSetAtom(removeLibraryItemsAtom);

    const handleRemove = () => {
        // Here you would typically show a confirmation modal
        removeItems(Array.from(selectedIds));
        onClear();
    };
    
    const handleAddToCollection = () => setModal({ type: 'addToCollection', itemIds: Array.from(selectedIds) });
    const handleAddTags = () => setModal({ type: 'addTags', itemIds: Array.from(selectedIds) });

    return (
        <div className="p-2 bg-gray-700 rounded-lg flex items-center justify-between animate-fade-in">
            <span className="text-sm font-medium text-white pl-2">
                {t('favorites:bulkActions.itemsSelected', { count: selectedIds.size })}
            </span>
            <div className="flex items-center gap-2">
                <button onClick={handleAddToCollection} className="p-2 rounded-md hover:bg-gray-600" title={t('favorites:bulkActions.addToCollection')}><CollectionIcon /></button>
                <button onClick={handleAddTags} className="p-2 rounded-md hover:bg-gray-600" title={t('favorites:bulkActions.addTags')}><TagIcon /></button>
                <button onClick={handleRemove} className="p-2 rounded-md hover:bg-red-500/20 text-red-400" title={t('favorites:bulkActions.removeFromLibrary')}><TrashIcon /></button>
            </div>
        </div>
    );
};


export const LibraryItemList: React.FC<LibraryItemListProps> = ({ items, filter, selectedItemId, onSelectItem }) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 300);
    const [sortKey, setSortKey] = useState<SortKey>('dateAdded');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    const sortedAndFilteredItems = useMemo(() => {
        let filtered = [...items];
        if (debouncedQuery) {
            const lowerQuery = debouncedQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.creator?.toString().toLowerCase().includes(lowerQuery) ||
                item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }
        return filtered.sort((a, b) => {
            const valA = a[sortKey] || '';
            const valB = b[sortKey] || '';
            const comparison = String(valA).localeCompare(String(valB));
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [items, debouncedQuery, sortKey, sortDirection]);

    const handleItemSelect = (id: string) => {
        if (isSelectMode) {
            setSelectedIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(id)) newSet.delete(id);
                else newSet.add(id);
                return newSet;
            });
        } else {
            onSelectItem(id);
        }
    };

    const toggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedIds(new Set());
    }

    return (
        <div className="bg-gray-800/60 rounded-xl p-2 md:p-4 flex flex-col h-full">
            <div className="relative mb-4 flex-shrink-0">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('favorites:searchPlaceholder')}
                    className="w-full bg-gray-900/50 border-2 border-gray-700/50 focus-within:border-cyan-500 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none transition-colors"
                />
            </div>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <SortOptions {...{ sortKey, setSortKey, sortDirection, setSortDirection }} />
                <button onClick={toggleSelectMode} className="px-3 py-1.5 text-sm font-semibold bg-gray-700 hover:bg-gray-600 rounded-md">
                    {isSelectMode ? t('favorites:controls.cancel') : t('favorites:controls.select')}
                </button>
            </div>

             {isSelectMode && <div className="mb-2 flex-shrink-0"><BulkActionBar selectedIds={selectedIds} onClear={() => setSelectedIds(new Set())} /></div>}

            <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                {sortedAndFilteredItems.length > 0 ? sortedAndFilteredItems.map(item => (
                    <FavoriteItemCard
                        key={item.identifier}
                        item={item}
                        onSelect={() => handleItemSelect(item.identifier)}
                        isSelected={selectedIds.has(item.identifier)}
                        isSelectMode={isSelectMode}
                        isDetailViewTarget={!isSelectMode && selectedItemId === item.identifier}
                    />
                )) : (
                    <p className="text-center text-gray-500 pt-10">{t('favorites:noItemsForFilter')}</p>
                )}
            </div>
        </div>
    );
};