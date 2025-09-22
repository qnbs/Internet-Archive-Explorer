

import React, { useState, useRef, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { userCollectionsAtom, allTagsAtom, deleteCollectionAtom, updateCollectionNameAtom, libraryCountsAtom } from '../../store/favorites';
import { modalAtom } from '../../store/app';
import { toastAtom } from '../../store/toast';
import type { LibraryFilter, UserCollection } from '../../types';
import { MediaType } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { 
    StarIcon, UsersIcon, CollectionIcon, TagIcon, PlusIcon, CloseIcon,
    PencilAltIcon, TrashIcon, BookIcon, MovieIcon, AudioIcon, ImageIcon, JoystickIcon, CompassIcon
} from '../Icons';

interface LibrarySidebarProps {
    activeTab: 'items' | 'uploaders';
    setActiveTab: (tab: 'items' | 'uploaders') => void;
    filter: LibraryFilter;
    setFilter: (filter: LibraryFilter) => void;
    onClose?: () => void;
}

const FilterButton: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void; count?: number; }> = ({ label, icon, isActive, onClick, count }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between text-left pr-2 pl-3 py-2 text-sm rounded-md group transition-colors ${
            isActive ? 'bg-gray-700/80 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
        }`}
    >
        <div className="flex items-center space-x-2 truncate">
            {icon}
            <span className="truncate">{label}</span>
        </div>
         {typeof count === 'number' && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${isActive ? 'bg-gray-600 text-gray-200' : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'}`}>
                {count}
            </span>
        )}
    </button>
);

const CollectionListItem: React.FC<{ collection: UserCollection; isActive: boolean; onClick: () => void; }> = ({ collection, isActive, onClick }) => {
    const { t } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const deleteCollection = useSetAtom(deleteCollectionAtom);
    const updateCollectionName = useSetAtom(updateCollectionNameAtom);
    // FIX: The Jotai type error was caused by a subtle circular dependency issue. Correcting the store's barrel file (`store/index.ts`) allows TypeScript to correctly infer that `toastAtom` is a `WritableAtom`.
    const setToast = useSetAtom(toastAtom);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(collection.name);
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleRename = () => {
        if (name.trim() && name.trim() !== collection.name) {
            updateCollectionName({ id: collection.id, newName: name.trim() });
            setToast({ type: 'success', message: t('favorites:collectionRenamed') });
        } else {
            setName(collection.name); // Revert if empty or unchanged
        }
        setIsEditing(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModal({
            type: 'confirmation',
            options: {
                title: t('favorites:bulkActions.deleteTitle', { count: 1 }),
                message: `Are you sure you want to delete the collection "${collection.name}"? This will not delete the items within it.`,
                onConfirm: () => deleteCollection(collection.id),
            }
        });
    };
    
    return (
        <div
            onClick={onClick}
            className={`w-full flex items-center justify-between text-left pr-1 pl-3 py-2 text-sm rounded-md group transition-colors relative ${
                isActive ? 'bg-gray-700/80 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
            }`}
        >
            <div className="flex items-center space-x-2 truncate">
                <CollectionIcon className="w-4 h-4" />
                {isEditing ? (
                     <input
                        ref={inputRef}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                            if (e.key === 'Escape') {
                                setName(collection.name);
                                setIsEditing(false);
                            }
                        }}
                        className="bg-gray-900 text-white rounded px-1 py-0.5 w-full"
                        onClick={e => e.stopPropagation()}
                    />
                ) : (
                    <span className="truncate">{collection.name}</span>
                )}
            </div>
            {!isEditing && (
                 <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity absolute right-1">
                    <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 hover:bg-gray-600 rounded" aria-label={t('favorites:renameCollection')}><PencilAltIcon className="w-4 h-4" /></button>
                    <button onClick={handleDelete} className="p-1.5 hover:bg-gray-600 rounded" aria-label={t('common:delete')}><TrashIcon className="w-5 h-5 text-red-400/80" /></button>
                </div>
            )}
        </div>
    );
};


export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({ activeTab, setActiveTab, filter, setFilter, onClose }) => {
    const { t } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const collections = useAtomValue(userCollectionsAtom);
    const tags = useAtomValue(allTagsAtom);
    const counts = useAtomValue(libraryCountsAtom);

    const mediaTypeFilters: { type: MediaType, label: string, icon: React.ReactNode, count: number }[] = [
        { type: MediaType.Texts, label: t('uploaderDetail:stats.texts'), icon: <BookIcon className="w-5 h-5" />, count: counts.texts },
        { type: MediaType.Movies, label: t('uploaderDetail:stats.movies'), icon: <MovieIcon className="w-5 h-5" />, count: counts.movies },
        { type: MediaType.Audio, label: t('uploaderDetail:stats.audio'), icon: <AudioIcon className="w-5 h-5" />, count: counts.audio },
        { type: MediaType.Image, label: t('uploaderDetail:stats.images'), icon: <ImageIcon className="w-5 h-5" />, count: counts.image },
        { type: MediaType.Software, label: t('uploaderDetail:stats.software'), icon: <JoystickIcon className="w-5 h-5" />, count: counts.software },
    ];

    return (
        <aside className="w-full md:w-64 flex-shrink-0 bg-gray-800/60 md:bg-transparent md:p-0 p-4 rounded-xl flex flex-col h-full">
            {onClose && (
                <div className="flex justify-between items-center mb-2 flex-shrink-0 md:hidden">
                    <h2 className="text-xl font-bold text-white">{t('sideMenu:library')}</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
            )}
            <div className="flex-shrink-0 p-1 bg-gray-700/50 rounded-lg flex items-center mb-4">
                <button onClick={() => setActiveTab('items')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md ${activeTab === 'items' ? 'bg-gray-800 text-white shadow' : 'text-gray-300'}`}>
                    <StarIcon className="w-4 h-4" /> {t('favorites:sidebar.items')}
                </button>
                 <button onClick={() => setActiveTab('uploaders')} className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md ${activeTab === 'uploaders' ? 'bg-gray-800 text-white shadow' : 'text-gray-300'}`}>
                    <UsersIcon className="w-4 h-4" /> {t('favorites:sidebar.uploaders')}
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto -mr-4 pr-4">
                {activeTab === 'items' && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Overview</h3>
                            <FilterButton label="Dashboard" icon={<CompassIcon className="w-5 h-5" />} isActive={filter.type === 'dashboard'} onClick={() => setFilter({ type: 'dashboard' })} />
                            <FilterButton label={t('favorites:sidebar.allItems')} icon={<CollectionIcon className="w-5 h-5" />} isActive={filter.type === 'all'} onClick={() => setFilter({ type: 'all' })} count={counts.total} />
                            <FilterButton label={t('favorites:sidebar.untagged')} icon={<TagIcon className="w-5 h-5" />} isActive={filter.type === 'untagged'} onClick={() => setFilter({ type: 'untagged' })} />
                        </div>
                        <div>
                             <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Media Types</h3>
                             <div className="space-y-1">
                                {mediaTypeFilters.filter(f => f.count > 0).map(f => (
                                    <FilterButton key={f.type} label={f.label} icon={f.icon} isActive={filter.type === 'mediaType' && filter.mediaType === f.type} onClick={() => setFilter({ type: 'mediaType', mediaType: f.type })} count={f.count} />
                                ))}
                             </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center px-3 pt-3 pb-1">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('sideMenu:collections')}</h3>
                                <button onClick={() => setModal({ type: 'newCollection' })} className="p-1 text-gray-400 hover:text-white"><PlusIcon className="w-4 h-4"/></button>
                            </div>
                            <div className="space-y-1">
                                {collections.map(c => (
                                    <CollectionListItem
                                        key={c.id}
                                        collection={c}
                                        isActive={filter.type === 'collection' && filter.id === c.id}
                                        onClick={() => setFilter({ type: 'collection', id: c.id })}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('favorites:sidebar.tags')}</h3>
                             <div className="space-y-1">
                                {tags.map(tag => (
                                    <FilterButton key={tag} label={tag} icon={<TagIcon className="w-4 h-4" />} isActive={filter.type === 'tag' && filter.tag === tag} onClick={() => setFilter({ type: 'tag', tag })} />
                                ))}
                                {tags.length === 0 && <p className="px-3 text-sm text-gray-500">{t('favorites:sidebar.noTags')}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};