import React, { useMemo } from 'react';
import type { UploaderStats, MediaType } from '../../types';
import { 
    ChevronDownIcon, SortAscendingIcon, SortDescendingIcon, MovieIcon, AudioIcon, BookIcon, ImageIcon, JoystickIcon, CollectionIcon
} from '../Icons';
import { useLanguage } from '../../hooks/useLanguage';

interface UploadsFilterControlsProps {
    stats: UploaderStats | null;
    activeFilter: MediaType | 'all';
    onFilterChange: (filter: MediaType | 'all') => void;
    sort: string;
    setSort: (s: string) => void;
    sortDirection: 'asc' | 'desc';
    toggleSortDirection: () => void;
}

export const UploadsFilterControls: React.FC<UploadsFilterControlsProps> = ({
    stats, activeFilter, onFilterChange, sort, setSort, sortDirection, toggleSortDirection
}) => {
    const { t } = useLanguage();

    const SORT_OPTIONS = useMemo(() => ([
        { value: 'downloads', label: t('uploaderDetail:sortCriteria.downloads') },
        { value: 'week', label: t('uploaderDetail:sortCriteria.week') },
        { value: 'publicdate', label: t('uploaderDetail:sortCriteria.publicdate') },
        { value: 'addeddate', label: t('uploaderDetail:sortCriteria.addeddate') },
        { value: 'titleSorter', label: t('uploaderDetail:sortCriteria.title') },
    ]), [t]);

    const statItems = useMemo(() => ([
        { key: 'total', type: 'all', icon: <CollectionIcon className="w-4 h-4"/>, label: t('uploaderDetail:filters.allTypes') },
        { key: 'movies', type: 'movies', icon: <MovieIcon className="w-4 h-4"/>, label: t('uploaderDetail:stats.movies') },
        { key: 'audio', type: 'audio', icon: <AudioIcon className="w-4 h-4"/>, label: t('uploaderDetail:stats.audio') },
        { key: 'texts', type: 'texts', icon: <BookIcon className="w-4 h-4"/>, label: t('uploaderDetail:stats.texts') },
        { key: 'image', type: 'image', icon: <ImageIcon className="w-4 h-4"/>, label: t('uploaderDetail:stats.images') },
        { key: 'software', type: 'software', icon: <JoystickIcon className="w-4 h-4"/>, label: t('uploaderDetail:stats.software') },
    ] as { key: keyof UploaderStats; icon: React.ReactNode; label: string, type: MediaType | 'all' }[]), [t]);
    
    return (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mr-2 shrink-0">{t('uploaderDetail:filters.title')}:</span>
                 {statItems.map(stat => {
                    // FIX: Correctly typed `stat.key` to be a valid key of UploaderStats
                    const count = stats ? stats[stat.key] : 0;
                    if (count === 0 && stat.key !== 'total') return null;
                    return (
                        <button
                            key={stat.key}
                            onClick={() => onFilterChange(stat.type)}
                            disabled={count === 0}
                            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeFilter === stat.type ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-900/50 hover:bg-gray-200 dark:hover:bg-gray-700/80 text-gray-800 dark:text-gray-200'}`}
                        >
                            {stat.icon}
                            <span>{stat.label}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFilter === stat.type ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-800/60'}`}>{count > 0 ? count.toLocaleString() : '0'}</span>
                        </button>
                    )
                })}
            </div>
             <div className="flex items-center justify-start lg:justify-end gap-2 shrink-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('uploaderDetail:sortBy')}:</span>
                <div className="relative">
                    <select 
                        value={sort} 
                        onChange={e => setSort(e.target.value)}
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-3 text-sm focus:ring-cyan-500 focus:border-cyan-500 appearance-none pr-8"
                        aria-label={t('uploaderDetail:sortBy')}
                    >
                        {SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <button 
                    onClick={toggleSortDirection}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                    aria-label={t('uploaderDetail:toggleSort', { direction: sortDirection === 'asc' ? t('uploaderDetail:ascending') : t('uploaderDetail:descending') })}
                >
                    {sortDirection === 'asc' ? <SortAscendingIcon className="w-5 h-5"/> : <SortDescendingIcon className="w-5 h-5"/>}
                </button>
            </div>
        </div>
    );
};
