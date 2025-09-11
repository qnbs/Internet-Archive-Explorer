import React, { useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { uploaderFavoriteSetAtom, addUploaderFavoriteAtom, removeUploaderFavoriteAtom } from '../../store';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../hooks/useLanguage';
import type { Profile, UploaderTab, UploaderStats, MediaType } from '../../types';
import { 
    StarIcon, ExternalLinkIcon, UploadIcon, CollectionIcon, PencilAltIcon, WebIcon,
    ChevronDownIcon, SortAscendingIcon, SortDescendingIcon, MovieIcon, AudioIcon, BookIcon, ImageIcon, JoystickIcon
} from '../Icons';
import { getProfileApiQuery } from '../../utils/profileUtils';

interface UploaderHeaderProps {
    profile: Profile;
    visibleTabs: UploaderTab[];
    activeTab: UploaderTab;
    setActiveTab: (tab: UploaderTab) => void;
    stats: UploaderStats | null;
    sort: string;
    setSort: (s: string) => void;
    sortDirection: 'asc' | 'desc';
    toggleSortDirection: () => void;
    activeFilter: MediaType | 'all';
    onFilterChange: (filter: MediaType | 'all') => void;
}

const TabButton: React.FC<{
    tabId: UploaderTab;
    label: string;
    icon: React.ReactNode;
    activeTab: UploaderTab;
    onClick: (tab: UploaderTab) => void;
}> = React.memo(({ tabId, label, icon, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tabId)}
        role="tab"
        aria-selected={activeTab === tabId}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === tabId
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700/50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
));

const UploadsFilterControls: React.FC<Pick<UploaderHeaderProps, 'stats' | 'activeFilter' | 'onFilterChange' | 'sort' | 'setSort' | 'sortDirection' | 'toggleSortDirection'>> = ({
    stats, activeFilter, onFilterChange, sort, setSort, sortDirection, toggleSortDirection
}) => {
    const { t } = useLanguage();

    const SORT_OPTIONS = useMemo(() => ({
        'downloads': t('uploaderDetail:sortCriteria.downloads'),
        'week': t('uploaderDetail:sortCriteria.week'),
        'publicdate': t('uploaderDetail:sortCriteria.publicdate'),
        'addeddate': t('uploaderDetail:sortCriteria.addeddate'),
    }), [t]);

    const statItems = useMemo(() => ([
        { key: 'total', type: 'all', icon: <CollectionIcon className="w-4 h-4"/>, label: t('uploaderDetail:filters.allTypes') },
        { key: 'movies', type: 'movies', icon: <MovieIcon className="w-4 h-4"/>, label: t('uploaderDetail:stats.movies') },
        { key: 'audio', type: 'audio', icon: <AudioIcon className="w-4 h-4"/>, label: t('uploaderDetail:stats.audio') },
        { key: 'texts', type: 'texts', icon: <BookIcon className="w-4 h-4"/>, label: t('uploaderDetail:stats.texts') },
        { key: 'image', type: 'image', icon: <ImageIcon className="w-4 h-4"/>, label: t('uploaderDetail:stats.images') },
        { key: 'software', type: 'software', icon: <JoystickIcon className="w-4 h-4"/>, label: t('uploaderDetail:stats.software') },
    ] as { key: keyof UploaderStats; icon: React.ReactNode; label: string, type: MediaType | 'all' }[]), [t]);
    
    return (
        <div className="border-t border-gray-700/80 pt-4 mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm text-gray-400 font-medium mr-2 shrink-0">Filter:</span>
                 {statItems.map(stat => {
                    const count = stats ? stats[stat.key as keyof UploaderStats] : 0;
                    if (count === 0 && stat.key !== 'total') return null;
                    return (
                        <button
                            key={stat.key}
                            onClick={() => onFilterChange(stat.type)}
                            disabled={count === 0}
                            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeFilter === stat.type ? 'bg-cyan-500 text-white' : 'bg-gray-900/50 hover:bg-gray-700/80 text-gray-200'}`}
                        >
                            {stat.icon}
                            <span>{stat.label}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFilter === stat.type ? 'bg-white/20' : 'bg-gray-800/60'}`}>{count > 0 ? count.toLocaleString() : '0'}</span>
                        </button>
                    )
                })}
            </div>
             <div className="flex items-center justify-start lg:justify-end gap-2 shrink-0">
                <span className="text-sm text-gray-400">{t('uploaderDetail:sortBy')}:</span>
                <div className="relative">
                    <select 
                        value={sort} 
                        onChange={e => setSort(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md py-1.5 px-3 text-sm focus:ring-cyan-500 focus:border-cyan-500 appearance-none pr-8"
                        aria-label={t('uploaderDetail:sortBy')}
                    >
                        {Object.entries(SORT_OPTIONS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <button 
                    onClick={toggleSortDirection}
                    className="p-2 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
                    aria-label={t('uploaderDetail:toggleSort', { direction: sortDirection === 'asc' ? t('uploaderDetail:ascending') : t('uploaderDetail:descending') })}
                >
                    {sortDirection === 'asc' ? <SortAscendingIcon className="w-5 h-5"/> : <SortDescendingIcon className="w-5 h-5"/>}
                </button>
            </div>
        </div>
    );
};

export const UploaderHeader: React.FC<UploaderHeaderProps> = (props) => {
    const { profile, visibleTabs, activeTab, setActiveTab, ...controls } = props;
    const { t } = useLanguage();
    const { addToast } = useToast();
    
    const favoriteUploaderSet = useAtomValue(uploaderFavoriteSetAtom);
    const addUploaderFavorite = useSetAtom(addUploaderFavoriteAtom);
    const removeUploaderFavorite = useSetAtom(removeUploaderFavoriteAtom);
    
    const isFavorite = favoriteUploaderSet.has(profile.searchIdentifier);
    
    const handleFavoriteClick = () => {
        if (isFavorite) {
            removeUploaderFavorite(profile.searchIdentifier);
            addToast(t('favorites:uploaderRemoved'), 'info');
        } else {
            addUploaderFavorite(profile.searchIdentifier);
            addToast(t('favorites:uploaderAdded'), 'success');
        }
    };
    
    const uploaderUrl = `https://archive.org/search?query=${encodeURIComponent(getProfileApiQuery(profile))}`;
    
    const TABS_CONFIG: Record<UploaderTab, { label: string; icon: React.ReactNode }> = {
        uploads: { label: t('uploaderDetail:tabs.uploads'), icon: <UploadIcon className="w-5 h-5" /> },
        collections: { label: t('uploaderDetail:tabs.collections'), icon: <CollectionIcon className="w-5 h-5" /> },
        favorites: { label: t('uploaderDetail:tabs.favorites'), icon: <StarIcon className="w-5 h-5" /> },
        reviews: { label: t('uploaderDetail:tabs.reviews'), icon: <PencilAltIcon className="w-5 h-5" /> },
        posts: { label: t('uploaderDetail:tabs.posts'), icon: <PencilAltIcon className="w-5 h-5" /> },
        webArchive: { label: t('uploaderDetail:tabs.webArchive'), icon: <WebIcon className="w-5 h-5" /> },
    };

    return (
        <header className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50">
            <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white truncate">{profile.name}</h1>
                    {profile.type === 'uploader' && (
                        <button 
                            onClick={handleFavoriteClick} 
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-full"
                        >
                            <StarIcon filled={isFavorite} className="w-5 h-5" />
                        </button>
                    )}
                    <a 
                        href={uploaderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-full"
                        aria-label="View on Archive.org"
                    >
                        <ExternalLinkIcon className="w-5 h-5" />
                    </a>
                </div>
                <div className="w-full sm:w-auto overflow-x-auto">
                    <div className="flex flex-nowrap gap-2" role="tablist" aria-label={t('uploaderDetail:aria.profileSections')}>
                        {visibleTabs.map(tabId => (
                            <TabButton 
                                key={tabId}
                                tabId={tabId}
                                label={TABS_CONFIG[tabId].label}
                                icon={TABS_CONFIG[tabId].icon}
                                activeTab={activeTab}
                                onClick={setActiveTab}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className={`grid transition-all duration-300 ease-in-out ${activeTab === 'uploads' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <UploadsFilterControls {...controls} />
                </div>
            </div>
        </header>
    );
};