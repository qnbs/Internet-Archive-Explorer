import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { userCollectionsAtom, allTagsAtom, deleteCollectionAtom, modalAtom } from '../../store';
import { type LibraryFilter, MediaType } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { 
    StarIcon, UsersIcon, CollectionIcon, TagIcon, PlusIcon, TrashIcon,
    BookIcon, MovieIcon, AudioIcon, ImageIcon, JoystickIcon
} from '../Icons';

interface LibrarySidebarProps {
    activeTab: 'items' | 'uploaders';
    setActiveTab: (tab: 'items' | 'uploaders') => void;
    filter: LibraryFilter;
    setFilter: (filter: LibraryFilter) => void;
}

const NavButton: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void; }> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
            isActive
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'text-gray-300 hover:bg-gray-700/50'
        }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

const FilterButton: React.FC<{ label: string; icon?: React.ReactNode; isActive: boolean; onClick: () => void; onDelete?: () => void; }> = ({ label, icon, isActive, onClick, onDelete }) => (
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
        {onDelete && (
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1 rounded-full text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete ${label}`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        )}
    </button>
);

// FIX: Replaced string literals with MediaType enum members to match the expected type.
const mediaTypeFilters: { type: MediaType; labelKey: string; icon: React.ReactNode }[] = [
    { type: MediaType.Texts, labelKey: 'favorites:sidebar.mediaTypeTexts', icon: <BookIcon className="w-4 h-4" /> },
    { type: MediaType.Movies, labelKey: 'favorites:sidebar.mediaTypeMovies', icon: <MovieIcon className="w-4 h-4" /> },
    { type: MediaType.Audio, labelKey: 'favorites:sidebar.mediaTypeAudio', icon: <AudioIcon className="w-4 h-4" /> },
    { type: MediaType.Image, labelKey: 'favorites:sidebar.mediaTypeImage', icon: <ImageIcon className="w-4 h-4" /> },
    { type: MediaType.Software, labelKey: 'favorites:sidebar.mediaTypeSoftware', icon: <JoystickIcon className="w-4 h-4" /> },
];

export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({ activeTab, setActiveTab, filter, setFilter }) => {
    const { t } = useLanguage();
    const collections = useAtomValue(userCollectionsAtom);
    const allTags = useAtomValue(allTagsAtom);
    const setModal = useSetAtom(modalAtom);
    const deleteCollection = useSetAtom(deleteCollectionAtom);
    
    const handleNewCollection = () => setModal({ type: 'newCollection' });

    return (
        <aside className="w-full md:w-64 flex-shrink-0 bg-gray-800/60 p-4 rounded-xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 px-2">{t('sideMenu:library')}</h2>
            <nav className="space-y-1 mb-4">
                <NavButton label={t('favorites:tabs.items')} icon={<StarIcon className="w-5 h-5"/>} isActive={activeTab === 'items'} onClick={() => setActiveTab('items')} />
                <NavButton label={t('favorites:tabs.uploaders')} icon={<UsersIcon className="w-5 h-5"/>} isActive={activeTab === 'uploaders'} onClick={() => setActiveTab('uploaders')} />
            </nav>

            {activeTab === 'items' && (
                <div className="flex-grow overflow-y-auto space-y-4">
                    <div className="space-y-1">
                        <FilterButton label={t('favorites:sidebar.allitems')} isActive={filter.type === 'all'} onClick={() => setFilter({ type: 'all' })} />
                        <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('favorites:sidebar.mediaTypes')}</h3>
                        {mediaTypeFilters.map(f => (
                             <FilterButton 
                                key={f.type}
                                label={t(f.labelKey)} 
                                icon={f.icon}
                                isActive={filter.type === 'mediaType' && filter.mediaType === f.type} 
                                onClick={() => setFilter({ type: 'mediaType', mediaType: f.type })} 
                            />
                        ))}
                    </div>
                    <div>
                        <div className="flex justify-between items-center px-3 pt-3 pb-1">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('favorites:sidebar.collections')}</h3>
                            <button onClick={handleNewCollection} className="text-cyan-400 hover:text-cyan-300" aria-label={t('favorites:sidebar.newCollection')}>
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-1">
                             <FilterButton 
                                label={t('favorites:sidebar.untagged')} 
                                isActive={filter.type === 'untagged'} 
                                onClick={() => setFilter({ type: 'untagged' })} 
                            />
                            {collections.map(c => (
                                <FilterButton 
                                    key={c.id} 
                                    label={c.name} 
                                    icon={<CollectionIcon className="w-4 h-4"/>} 
                                    isActive={filter.type === 'collection' && filter.id === c.id} 
                                    onClick={() => setFilter({ type: 'collection', id: c.id })}
                                    onDelete={() => deleteCollection(c.id)}
                                />
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('favorites:sidebar.tags')}</h3>
                        <div className="space-y-1">
                            {allTags.length > 0 ? allTags.map(tag => (
                                <FilterButton 
                                    key={tag} 
                                    label={tag} 
                                    icon={<TagIcon className="w-4 h-4"/>} 
                                    isActive={filter.type === 'tag' && filter.tag === tag} 
                                    onClick={() => setFilter({ type: 'tag', tag: tag })} 
                                />
                            )) : <p className="px-3 text-sm text-gray-500">{t('favorites:sidebar.noTags')}</p>}
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};