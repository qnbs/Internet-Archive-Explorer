import React, { useState, useMemo, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    favoritesAtom,
    favoritesSearchQueryAtom,
    favoritesMediaTypeFilterAtom,
    favoritesSortAtom,
    selectedFavoritesForBulkActionAtom,
    removeMultipleFavoritesAtom,
    modalAtom,
} from '../../store';
import { useDebounce } from '../../hooks/useDebounce';
import { useLanguage } from '../../hooks/useLanguage';
import { MediaType } from '../../types';
import type { ArchiveItemSummary, SortKey, SortDirection } from '../../types';
import { FavoriteItemCard } from './FavoriteItemCard';
import { SearchIcon, StarIcon, SortAscendingIcon, SortDescendingIcon, TrashIcon, CloseIcon, ChevronDownIcon } from '../Icons';

const MediaFilterButton: React.FC<{
    filter: MediaType | 'all';
    label: string;
    activeFilter: MediaType | 'all';
    onClick: (filter: MediaType | 'all') => void;
}> = ({ filter, label, activeFilter, onClick }) => (
    <button
        onClick={() => onClick(filter)}
        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            activeFilter === filter
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
        }`}
    >
        {label}
    </button>
);


export const ItemFavoritesTab: React.FC = () => {
    const { t } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const allFavorites = useAtomValue(favoritesAtom);
    const removeMultipleFavorites = useSetAtom(removeMultipleFavoritesAtom);

    const [searchQuery, setSearchQuery] = useAtom(favoritesSearchQueryAtom);
    const debouncedQuery = useDebounce(searchQuery, 300);
    const [filter, setFilter] = useAtom(favoritesMediaTypeFilterAtom);
    const [sort, setSort] = useAtom(favoritesSortAtom);
    const [selectedItems, setSelectedItems] = useAtom(selectedFavoritesForBulkActionAtom);
    const [isSelectMode, setIsSelectMode] = useState(false);
    
    // Reset selection when toggling select mode off or when unmounting
    useEffect(() => {
        if (!isSelectMode) {
            setSelectedItems(new Set());
        }
        return () => {
            setSelectedItems(new Set());
        };
    }, [isSelectMode, setSelectedItems]);

    const filteredAndSortedFavorites = useMemo(() => {
        let items = [...allFavorites]; // Create a mutable copy

        // Filter by search query
        if (debouncedQuery) {
            const lowerQuery = debouncedQuery.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                (typeof item.creator === 'string' && item.creator.toLowerCase().includes(lowerQuery)) ||
                (Array.isArray(item.creator) && item.creator.some(c => c.toLowerCase().includes(lowerQuery)))
            );
        }

        // Filter by media type
        if (filter !== 'all') {
            items = items.filter(item => item.mediatype === filter);
        }

        // Sort
        items.sort((a, b) => {
            let compare = 0;
            if (sort.key === 'title') {
                compare = a.title.localeCompare(b.title);
            } else { // 'dateAdded' - since we add to the start, the natural order is newest first
                compare = 0; // Default sort is by array order
            }
            return sort.dir === 'asc' ? compare : -compare;
        });
        
        // dateAdded sort needs special handling as it's just array order
        if(sort.key === 'dateAdded' && sort.dir === 'asc') {
            items.reverse();
        }


        return items;
    }, [allFavorites, debouncedQuery, filter, sort]);
    
    const handleToggleSelect = (identifier: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(identifier)) {
            newSet.delete(identifier);
        } else {
            newSet.add(identifier);
        }
        setSelectedItems(newSet);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === filteredAndSortedFavorites.length) {
            setSelectedItems(new Set()); // Deselect all
        } else {
            setSelectedItems(new Set(filteredAndSortedFavorites.map(item => item.identifier)));
        }
    };
    
    const handleDeleteSelected = () => {
        if (selectedItems.size === 0) return;
        setModal({
            type: 'confirmation',
            options: {
                title: t('favorites:bulkDelete.title'),
                message: t('favorites:bulkDelete.message', { count: selectedItems.size }),
                confirmLabel: t('common:delete'),
                confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                onConfirm: () => {
                    removeMultipleFavorites(selectedItems);
                    setSelectedItems(new Set());
                    setIsSelectMode(false);
                }
            }
        });
    };
    
    const SORT_OPTIONS: { key: SortKey; label: string }[] = [
        { key: 'dateAdded', label: t('favorites:sort.dateAdded') },
        { key: 'title', label: t('favorites:sort.title') }
    ];

    if (allFavorites.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-800/60 rounded-lg">
                <StarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-white">{t('favorites:noFavItems')}</h2>
                <p className="text-gray-400 mt-2">{t('favorites:noFavItemsDesc')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Control Bar */}
            <div className="p-4 bg-gray-800/60 rounded-xl border border-gray-700/50 space-y-4">
                 <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('favorites:searchPlaceholder', { count: allFavorites.length })}
                            className="w-full bg-gray-700/50 border-2 border-transparent focus-within:border-cyan-500 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none transition-colors"
                        />
                    </div>
                     <button 
                        onClick={() => setIsSelectMode(!isSelectMode)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${isSelectMode ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                    >
                       {isSelectMode ? t('common:cancel') : t('favorites:selectMode')}
                    </button>
                 </div>
                 <div className="flex flex-wrap items-center gap-2">
                    <MediaFilterButton filter="all" label={t('uploaderDetail:filters.allTypes')} activeFilter={filter} onClick={setFilter} />
                    <MediaFilterButton filter={MediaType.Movies} label={t('uploaderDetail:stats.movies')} activeFilter={filter} onClick={setFilter} />
                    <MediaFilterButton filter={MediaType.Audio} label={t('uploaderDetail:stats.audio')} activeFilter={filter} onClick={setFilter} />
                    <MediaFilterButton filter={MediaType.Texts} label={t('uploaderDetail:stats.texts')} activeFilter={filter} onClick={setFilter} />
                    <MediaFilterButton filter={MediaType.Image} label={t('uploaderDetail:stats.images')} activeFilter={filter} onClick={setFilter} />
                    <MediaFilterButton filter={MediaType.Software} label={t('uploaderDetail:stats.software')} activeFilter={filter} onClick={setFilter} />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{t('uploaderDetail:sortBy')}:</span>
                    <div className="relative">
                        <select
                            value={sort.key}
                            onChange={e => setSort({ ...sort, key: e.target.value as SortKey })}
                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-cyan-500 focus:border-cyan-500 appearance-none pr-8"
                        >
                            {SORT_OPTIONS.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                        </select>
                         <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => setSort({ ...sort, dir: sort.dir === 'asc' ? 'desc' : 'asc' })}
                        className="p-2 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
                    >
                         {sort.dir === 'asc' ? <SortAscendingIcon className="w-5 h-5"/> : <SortDescendingIcon className="w-5 h-5"/>}
                    </button>
                 </div>
            </div>

            {/* Bulk Actions Bar */}
            {isSelectMode && (
                <div className="sticky top-16 z-10 p-3 bg-cyan-900/80 backdrop-blur-sm rounded-xl border border-cyan-500/30 flex justify-between items-center animate-fade-in">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDeleteSelected}
                            disabled={selectedItems.size === 0}
                            className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                            {t('favorites:bulkDelete.button')}
                        </button>
                    </div>
                     <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-cyan-200">{t('favorites:bulkDelete.selected', { count: selectedItems.size })}</span>
                         <button
                            onClick={handleSelectAll}
                            className="text-sm font-semibold text-cyan-200 hover:text-white"
                        >
                            {selectedItems.size === filteredAndSortedFavorites.length ? t('favorites:bulkDelete.deselectAll') : t('favorites:bulkDelete.selectAll', { count: filteredAndSortedFavorites.length })}
                        </button>
                    </div>
                </div>
            )}
            
            {/* Results Grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
                {filteredAndSortedFavorites.map((item, index) => (
                    <FavoriteItemCard
                        key={item.identifier}
                        item={item}
                        index={index}
                        isSelectMode={isSelectMode}
                        isSelected={selectedItems.has(item.identifier)}
                        onToggleSelect={handleToggleSelect}
                    />
                ))}
            </div>
        </div>
    );
};
