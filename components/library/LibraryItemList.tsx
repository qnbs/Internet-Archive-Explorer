import React, { useState, useMemo, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { removeLibraryItemsAtom } from '../../store/favorites';
import { modalAtom } from '../../store/app';
import type { LibraryItem, LibraryFilter } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { LibraryItemCard } from './LibraryItemCard';
import { CollectionIcon, TagIcon, SparklesIcon, TrashIcon, CloseIcon, FilterIcon, SearchIcon } from '../Icons';

interface LibraryItemListProps {
    items: LibraryItem[];
    filter: LibraryFilter;
    selectedItemId: string | null;
    onSelectItem: (id: string | null) => void;
    onOpenFilters: () => void;
}

const BulkActionsToolbar: React.FC<{ selectedIds: string[], onClear: () => void }> = ({ selectedIds, onClear }) => {
    const { t } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const removeItems = useSetAtom(removeLibraryItemsAtom);
    const count = selectedIds.length;

    const handleDelete = () => {
        setModal({
            type: 'confirmation',
            options: {
                title: t('favorites:bulkActions.deleteTitle', { count }),
                message: t('favorites:bulkActions.deleteMessage'),
                confirmLabel: t('common:delete'),
                confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                onConfirm: () => {
                    removeItems(selectedIds);
                    onClear();
                },
            },
        });
    };

    return (
        <div className="flex-shrink-0 p-2 bg-gray-700/50 rounded-lg flex items-center justify-between animate-fade-in">
            <span className="text-sm font-semibold text-white pl-2">{t('favorites:bulkActions.selected', { count })}</span>
            <div className="flex items-center gap-1">
                <button onClick={() => setModal({ type: 'addToCollection', itemIds: selectedIds })} title={t('favorites:bulkActions.addToCollection')} className="p-2 rounded hover:bg-gray-600"><CollectionIcon className="w-5 h-5" /></button>
                <button onClick={() => setModal({ type: 'addTags', itemIds: selectedIds })} title={t('favorites:bulkActions.addTags')} className="p-2 rounded hover:bg-gray-600"><TagIcon className="w-5 h-5" /></button>
                <button onClick={() => setModal({ type: 'magicOrganize', itemIds: selectedIds })} title={t('favorites:bulkActions.magicOrganize')} className="p-2 rounded hover:bg-gray-600"><SparklesIcon className="w-5 h-5" /></button>
                <div className="w-px h-6 bg-gray-600 mx-1"></div>
                <button onClick={handleDelete} title={t('common:delete')} className="p-2 rounded hover:bg-red-500/20 text-red-400"><TrashIcon className="w-5 h-5" /></button>
                <button onClick={onClear} title={t('common:clearSelection')} className="p-2 rounded hover:bg-gray-600"><CloseIcon className="w-5 h-5" /></button>
            </div>
        </div>
    );
};

export const LibraryItemList: React.FC<LibraryItemListProps> = ({ items, filter, selectedItemId, onSelectItem, onOpenFilters }) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const isSelectMode = selectedIds.size > 0;

    // Clear selection and search when filter changes
    useEffect(() => {
        setSelectedIds(new Set());
        setSearchQuery('');
    }, [filter]);

    const searchedItems = useMemo(() => {
        if (!searchQuery) return items;
        const lowerQuery = searchQuery.toLowerCase();
        return items.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) ||
            (Array.isArray(item.creator) ? item.creator.join(' ') : item.creator || '').toLowerCase().includes(lowerQuery) ||
            item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            item.notes.toLowerCase().includes(lowerQuery)
        );
    }, [items, searchQuery]);

    const handleItemClick = (item: LibraryItem) => {
        if (isSelectMode) {
            const newIds = new Set(selectedIds);
            if (newIds.has(item.identifier)) {
                newIds.delete(item.identifier);
            } else {
                newIds.add(item.identifier);
            }
            setSelectedIds(newIds);
        } else {
            onSelectItem(selectedItemId === item.identifier ? null : item.identifier);
        }
    };

    return (
        <div className="bg-gray-800/60 rounded-xl h-full flex flex-col p-4">
            <div className="flex-shrink-0 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">{t('favorites:sidebar.items')}</h2>
                     <button 
                      onClick={() => setSelectedIds(new Set(items.map(i => i.identifier)))}
                      className="text-sm font-medium text-cyan-400 hover:underline"
                    >
                      {t('common:selectAll')}
                    </button>
                </div>
                 <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search in collection..."
                        className="w-full bg-gray-700/50 border-2 border-transparent focus:border-cyan-500 rounded-lg text-sm pl-9 pr-3 py-1.5 focus:outline-none"
                    />
                </div>
            </div>
            
            {isSelectMode && <div className="mt-2"><BulkActionsToolbar selectedIds={Array.from(selectedIds)} onClear={() => setSelectedIds(new Set())} /></div>}
            
            <div className="flex-grow overflow-y-auto space-y-2 pr-1 mt-2">
                {searchedItems.length > 0 ? searchedItems.map(item => (
                    <LibraryItemCard
                        key={item.identifier}
                        item={item}
                        onSelect={() => handleItemClick(item)}
                        isSelected={selectedIds.has(item.identifier)}
                        isSelectMode={isSelectMode}
                        isDetailViewTarget={selectedItemId === item.identifier}
                    />
                )) : (
                  <div className="text-center text-gray-500 pt-16">
                    <p>{t('common:noResultsFound')}</p>
                  </div>
                )}
            </div>
        </div>
    );
};