import React, { useState, useMemo, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    libraryItemsAtom, userCollectionsAtom, allLibraryTagsAtom,
    librarySearchQueryAtom, libraryMediaTypeFilterAtom, librarySortAtom,
    selectedLibraryItemIdentifierAtom, libraryActiveFilterAtom,
    selectedLibraryItemsForBulkActionAtom,
    createCollectionAtom, deleteCollectionAtom, removeMultipleLibraryItemsAtom,
    addItemsToCollectionAtom, addTagsToMultipleItemsAtom,
    updateLibraryItemNotesAtom, updateLibraryItemTagsAtom,
    modalAtom
} from '../store';
import { StarIcon, UsersIcon, CollectionIcon, TagIcon, PlusIcon, TrashIcon, ChevronDownIcon, CloseIcon } from '../components/Icons';
import { useLanguage } from '../hooks/useLanguage';
import { useDebounce } from '../hooks/useDebounce';
import type { LibraryItem, UserCollection, LibraryFilter, SortKey, SortDirection } from '../types';

import { FavoriteItemCard } from '../components/favorites/FavoriteItemCard';
import { UploaderFavoritesTab } from '../components/favorites/UploaderFavoritesTab';
import { Spinner } from '../components/Spinner';
import { useToast } from '../contexts/ToastContext';


// --- Child Components for the 3-Pane Layout ---

const NewCollectionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const createCollection = useSetAtom(createCollectionAtom);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            createCollection(name.trim());
            onClose();
        }
    };

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start pt-20 p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-md rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-white">{t('favorites:modals.newCollectionTitle')}</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="collection-name" className="block text-sm font-medium text-gray-300 mb-1">{t('favorites:modals.newCollectionName')}</label>
                        <input
                            id="collection-name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={t('favorites:modals.newCollectionPlaceholder')}
                            className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors">
                            {t('favorites:modals.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};


const LibrarySidebar: React.FC = () => {
    const { t } = useLanguage();
    const collections = useAtomValue(userCollectionsAtom);
    const tags = useAtomValue(allLibraryTagsAtom);
    const [activeFilter, setActiveFilter] = useAtom(libraryActiveFilterAtom);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const FilterButton: React.FC<{ filter: LibraryFilter, label: string, icon: React.ReactNode }> = ({ filter, label, icon }) => {
        const isActive = JSON.stringify(activeFilter) === JSON.stringify(filter);
        return (
            <button
                onClick={() => setActiveFilter(filter)}
                className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left text-sm font-medium transition-colors ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-700/50'
                }`}
            >
                {icon}
                <span className="truncate">{label}</span>
            </button>
        );
    };

    return (
        <aside className="bg-gray-800/60 rounded-xl p-3 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
            {isModalOpen && <NewCollectionModal onClose={() => setIsModalOpen(false)} />}
            <div>
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('favorites:sidebar.collections')}</h3>
                <div className="space-y-1">
                    <FilterButton filter={{ type: 'all' }} label={t('favorites:sidebar.allitems')} icon={<CollectionIcon className="w-5 h-5" />} />
                    {collections.map(c => (
                        <FilterButton key={c.id} filter={{ type: 'collection', id: c.id }} label={c.name} icon={<CollectionIcon className="w-5 h-5" />} />
                    ))}
                    <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center space-x-3 p-2 rounded-lg text-left text-sm font-medium text-gray-400 hover:bg-gray-700/50 hover:text-cyan-400 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        <span>{t('favorites:sidebar.newCollection')}</span>
                    </button>
                </div>
            </div>
            <div className="border-t border-gray-700"></div>
            <div>
                 <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('favorites:sidebar.tags')}</h3>
                 <div className="space-y-1">
                    {tags.map(tag => (
                        <FilterButton key={tag} filter={{ type: 'tag', tag }} label={tag} icon={<TagIcon className="w-5 h-5" />} />
                    ))}
                </div>
            </div>
        </aside>
    );
};

const LibraryItemDetail: React.FC = () => {
    const { t } = useLanguage();
    const [selectedId, setSelectedId] = useAtom(selectedLibraryItemIdentifierAtom);
    const allItems = useAtomValue(libraryItemsAtom);
    const updateNotes = useSetAtom(updateLibraryItemNotesAtom);
    const updateTags = useSetAtom(updateLibraryItemTagsAtom);
    const setModal = useSetAtom(modalAtom);

    const item = useMemo(() => allItems.find(i => i.identifier === selectedId), [allItems, selectedId]);
    const [tagInput, setTagInput] = useState('');

    const handleNotesChange = useDebounce((notes: string) => {
        if (item) updateNotes({ identifier: item.identifier, notes });
    }, 500);

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (item && tagInput.trim()) {
            const newTags = [...item.tags, tagInput.trim()];
            updateTags({ identifier: item.identifier, tags: newTags });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (item) {
            const newTags = item.tags.filter(t => t !== tagToRemove);
            updateTags({ identifier: item.identifier, tags: newTags });
        }
    };

    if (!item) {
        return <div className="bg-gray-800/60 rounded-xl p-6 flex items-center justify-center h-full text-gray-500">{t('favorites:noItemSelected')}</div>;
    }

    return (
        <div className="bg-gray-800/60 rounded-xl p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-start gap-4">
                <img src={`https://archive.org/services/get-item-image.php?identifier=${item.identifier}`} alt="" className="w-24 h-32 object-cover rounded-md flex-shrink-0 bg-gray-700"/>
                <div>
                    <h3 className="font-bold text-white text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-400">{Array.isArray(item.creator) ? item.creator.join(', ') : item.creator}</p>
                    <button onClick={() => setModal({ type: 'itemDetail', item })} className="text-sm text-cyan-400 hover:underline mt-2">{t('favorites:itemDetail.viewFullDetails')}</button>
                </div>
            </div>
            <div className="border-t border-gray-700"></div>
            <div className="flex-grow flex flex-col gap-4">
                <div>
                    <h4 className="font-semibold text-gray-300 mb-2">{t('favorites:itemDetail.notes')}</h4>
                    <textarea
                        key={item.identifier} // Force re-render on item change
                        defaultValue={item.notes}
                        onChange={e => handleNotesChange(e.target.value)}
                        placeholder={t('favorites:itemDetail.notesPlaceholder')}
                        className="w-full h-32 bg-gray-900/50 text-gray-200 p-2 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-sm"
                    />
                </div>
                 <div>
                    <h4 className="font-semibold text-gray-300 mb-2">{t('favorites:itemDetail.tags')}</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {item.tags.map(tag => (
                            <span key={tag} className="flex items-center bg-gray-700 text-cyan-300 text-xs px-2 py-1 rounded-full">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 text-cyan-500 hover:text-white"><CloseIcon className="w-3 h-3"/></button>
                            </span>
                        ))}
                    </div>
                    <form onSubmit={handleAddTag} className="flex gap-2">
                        <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder={t('favorites:itemDetail.addTagPlaceholder')} className="flex-grow bg-gray-900/50 text-sm p-1.5 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500"/>
                        <button type="submit" className="px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md text-sm">{t('common:add')}</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const LibraryItemList: React.FC = () => {
    const { t } = useLanguage();
    const allItems = useAtomValue(libraryItemsAtom);
    const collections = useAtomValue(userCollectionsAtom);
    const [activeFilter] = useAtom(libraryActiveFilterAtom);
    const [searchQuery, setSearchQuery] = useAtom(librarySearchQueryAtom);
    const debouncedQuery = useDebounce(searchQuery, 300);
    const [sort, setSort] = useAtom(librarySortAtom);
    const [selectedId, setSelectedId] = useAtom(selectedLibraryItemIdentifierAtom);
    const [selectedItems, setSelectedItems] = useAtom(selectedLibraryItemsForBulkActionAtom);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const removeMultiple = useSetAtom(removeMultipleLibraryItemsAtom);
    const addItemsToColl = useSetAtom(addItemsToCollectionAtom);
    const addTagsToMulti = useSetAtom(addTagsToMultipleItemsAtom);
    const { addToast } = useToast();

    const filteredItems = useMemo(() => {
        let items = [...allItems];
        // Apply primary filter (collection or tag)
        if (activeFilter.type === 'collection') {
            const coll = collections.find(c => c.id === activeFilter.id);
            const idSet = new Set(coll?.itemIdentifiers || []);
            items = items.filter(i => idSet.has(i.identifier));
        } else if (activeFilter.type === 'tag') {
            items = items.filter(i => i.tags.includes(activeFilter.tag));
        }
        
        // Apply search query
        if (debouncedQuery) {
             const lowerQuery = debouncedQuery.toLowerCase();
             items = items.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                (item.creator && (Array.isArray(item.creator) ? item.creator.some(c => c.toLowerCase().includes(lowerQuery)) : item.creator.toLowerCase().includes(lowerQuery))) ||
                item.tags.some(t => t.toLowerCase().includes(lowerQuery))
            );
        }

        // Apply sort
        items.sort((a, b) => {
            let compare = 0;
            if (sort.key === 'title') compare = a.title.localeCompare(b.title);
            else if (sort.key === 'dateAdded') compare = b.dateAdded - a.dateAdded;
            else if (sort.key === 'creator') {
                const creatorA = Array.isArray(a.creator) ? a.creator[0] : a.creator;
                const creatorB = Array.isArray(b.creator) ? b.creator[0] : b.creator;
                compare = (creatorA || '').localeCompare(creatorB || '');
            }
            return sort.dir === 'asc' ? compare : -compare;
        });
        
        return items;
    }, [allItems, collections, activeFilter, debouncedQuery, sort]);

    useEffect(() => {
        // If the currently selected item is no longer in the filtered list, deselect it.
        if (selectedId && !filteredItems.some(i => i.identifier === selectedId)) {
            setSelectedId(null);
        }
    }, [filteredItems, selectedId, setSelectedId]);
    
    useEffect(() => { if (!isSelectMode) setSelectedItems(new Set()) }, [isSelectMode, setSelectedItems]);

    const handleSelect = (item: LibraryItem) => {
        if (isSelectMode) {
            const newSet = new Set(selectedItems);
            if (newSet.has(item.identifier)) newSet.delete(item.identifier);
            else newSet.add(item.identifier);
            setSelectedItems(newSet);
        } else {
            setSelectedId(item.identifier);
        }
    };
    
    // Bulk Actions
    const handleBulkDelete = () => {
        if(selectedItems.size === 0) return;
        // FIX: Pass an array of identifiers directly to the atom setter.
        removeMultiple(Array.from(selectedItems));
        setIsSelectMode(false);
    };
    const handleBulkAddToCollection = (collectionId: string) => {
        if(selectedItems.size === 0 || !collectionId) return;
        addItemsToColl({ collectionId, itemIdentifiers: selectedItems });
        setIsSelectMode(false);
        const collName = collections.find(c => c.id === collectionId)?.name;
        addToast(t('favorites:bulkActions.addedToCollection', { count: selectedItems.size, collectionName: collName }), 'success');

    };
    const handleBulkAddTags = () => {
        if(selectedItems.size === 0) return;
        const tagsString = prompt(t('favorites:bulkActions.addTagsPrompt'));
        if (tagsString) {
            const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
            if (tags.length > 0) {
                // FIX: Pass identifiers array and tags array directly to the atom setter.
                addTagsToMulti(Array.from(selectedItems), tags);
                addToast(t('favorites:bulkActions.tagsAdded'), 'success');
            }
        }
        setIsSelectMode(false);
    };


    return (
        <div className="bg-gray-800/60 rounded-xl p-3 flex flex-col gap-3 overflow-hidden">
            <div className="flex gap-2 items-center flex-shrink-0">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('favorites:searchPlaceholder')} className="w-full bg-gray-700/50 text-sm p-2 rounded-md border border-transparent focus:ring-cyan-500 focus:border-cyan-500"/>
                <button onClick={() => setIsSelectMode(!isSelectMode)} className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${isSelectMode ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}>
                    {isSelectMode ? t('favorites:controls.cancel') : t('favorites:controls.select')}
                </button>
            </div>
            
             {isSelectMode && (
                <div className="p-2 bg-cyan-900/50 rounded-lg flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="font-bold text-cyan-200">{t('favorites:bulkActions.itemsSelected', { count: selectedItems.size })}</span>
                    <button onClick={handleBulkDelete} disabled={selectedItems.size === 0} className="text-red-400 hover:text-red-300 disabled:opacity-50 font-semibold">{t('favorites:bulkActions.removeFromLibrary')}</button>
                    <button onClick={handleBulkAddTags} disabled={selectedItems.size === 0} className="text-cyan-300 hover:text-white disabled:opacity-50 font-semibold">{t('favorites:bulkActions.addTags')}</button>
                    <select onChange={(e) => handleBulkAddToCollection(e.target.value)} disabled={selectedItems.size === 0} className="bg-transparent text-cyan-300 hover:text-white disabled:opacity-50 font-semibold border-0 focus:ring-0">
                        <option value="">{t('favorites:bulkActions.addToCollection')}</option>
                        {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            )}
            
            <div className="flex-grow overflow-y-auto pr-1 space-y-2">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <FavoriteItemCard
                            key={item.identifier}
                            item={item}
                            onSelect={() => handleSelect(item)}
                            isSelected={selectedItems.has(item.identifier)}
                            isSelectMode={isSelectMode}
                            isDetailViewTarget={selectedId === item.identifier}
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-500 pt-16">{t('favorites:noItemsForFilter')}</div>
                )}
            </div>
        </div>
    );
};

// --- Main Library View Component ---

type LibraryTab = 'items' | 'uploaders';

export const LibraryView: React.FC = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<LibraryTab>('items');
    const allItems = useAtomValue(libraryItemsAtom);

    const TabButton: React.FC<{ tabId: LibraryTab, label: string, icon: React.ReactNode }> = ({ tabId, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabId)} role="tab" aria-selected={activeTab === tabId}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tabId ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50'
            }`}
        >{icon}<span>{label}</span></button>
    );

    if (allItems.length === 0 && activeTab === 'items') {
        return (
            <div className="text-center py-20 bg-gray-800/60 rounded-lg animate-fade-in">
                <StarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-white">{t('favorites:noItems')}</h2>
                <p className="text-gray-400 mt-2">{t('favorites:noItemsDesc')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-page-fade-in">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-3">
                     <StarIcon className="w-8 h-8 text-yellow-400" filled />
                     {t('favorites:title')}
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('favorites:description')}</p>
            </header>

            <div className="bg-gray-800/60 p-2 rounded-xl border border-gray-700/50 flex flex-wrap gap-2" role="tablist" aria-label="Library Sections">
                <TabButton tabId="items" label={t('favorites:items')} icon={<CollectionIcon className="w-5 h-5" />} />
                <TabButton tabId="uploaders" label={t('favorites:uploaders')} icon={<UsersIcon className="w-5 h-5" />} />
            </div>

            <main>
                {activeTab === 'items' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-[calc(100vh-22rem)] min-h-[500px]">
                        <div className="lg:col-span-1 xl:col-span-1 hidden lg:flex"><LibrarySidebar /></div>
                        <div className="lg:col-span-2 xl:col-span-2"><LibraryItemList /></div>
                        <div className="lg:col-span-3 xl:col-span-1 hidden xl:flex"><LibraryItemDetail /></div>
                    </div>
                ) : (
                    <UploaderFavoritesTab />
                )}
            </main>
        </div>
    );
};