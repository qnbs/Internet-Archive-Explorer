import React from 'react';
import { MediaType } from '../../types';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../../hooks/useLanguage';
import { ChevronDownIcon, SortAscendingIcon, SortDescendingIcon, SearchIcon } from '../Icons';

interface UploadsFilterBarProps {
    sort: string;
    setSort: (s: string) => void;
    sortDirection: 'asc' | 'desc';
    toggleSortDirection: () => void;
    mediaTypeFilter: MediaType | 'all';
    setMediaTypeFilter: (m: MediaType | 'all') => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    totalResults: number;
}

export const UploadsFilterBar: React.FC<UploadsFilterBarProps> = ({
    sort, setSort, sortDirection, toggleSortDirection,
    mediaTypeFilter, setMediaTypeFilter, searchQuery, setSearchQuery, totalResults
}) => {
    const { t } = useLanguage();
    
    const SORT_OPTIONS = {
        'downloads': t('uploaderDetail:sortCriteria.downloads'),
        'week': t('uploaderDetail:sortCriteria.week'),
        'publicdate': t('uploaderDetail:sortCriteria.publicdate'),
        'addeddate': t('uploaderDetail:sortCriteria.addeddate'),
    };
    
    const MEDIA_TYPE_OPTIONS = [
        { value: 'all', label: t('uploaderDetail:filters.allTypes') },
        { value: MediaType.Movies, label: t('uploaderDetail:stats.movies') },
        { value: MediaType.Audio, label: t('uploaderDetail:stats.audio') },
        { value: MediaType.Texts, label: t('uploaderDetail:stats.texts') },
        { value: MediaType.Image, label: t('uploaderDetail:stats.images') },
        { value: MediaType.Software, label: t('uploaderDetail:stats.software') },
    ];

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // The search is already live via state change, but this prevents page reload.
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('uploaderDetail:searchInUploads')}
                    className="w-full bg-gray-700/50 border-2 border-transparent focus-within:border-cyan-500 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none transition-colors"
                />
            </form>
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select 
                            value={mediaTypeFilter} 
                            onChange={e => setMediaTypeFilter(e.target.value as MediaType | 'all')}
                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-cyan-500 focus:border-cyan-500 appearance-none pr-8"
                        >
                            {MEDIA_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{t('uploaderDetail:sortBy')}:</span>
                    <div className="relative">
                        <select 
                            value={sort} 
                            onChange={e => setSort(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-sm focus:ring-cyan-500 focus:border-cyan-500 appearance-none pr-8"
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
        </div>
    );
};