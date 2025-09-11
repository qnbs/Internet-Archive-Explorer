import React, { useState, useMemo } from 'react';
import type { ArchiveItemSummary, Profile, MediaType, UploaderStats } from '../../types';
import { useUploaderUploads } from '../../hooks/useUploaderUploads';
import { ResultsGrid } from '../ResultsGrid';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../../hooks/useLanguage';
import { useUploaderStats } from '../../hooks/useUploaderStats';
import { Spinner } from '../Spinner';
import { 
    ChevronDownIcon, SortAscendingIcon, SortDescendingIcon, 
    CollectionIcon, MovieIcon, AudioIcon, BookIcon, ImageIcon, JoystickIcon 
} from '../Icons';

// --- SUB-COMPONENTS ---

const UploadsSortControl: React.FC<{
    sort: string;
    setSort: (s: string) => void;
    sortDirection: 'asc' | 'desc';
    toggleSortDirection: () => void;
}> = React.memo(({ sort, setSort, sortDirection, toggleSortDirection }) => {
    const { t } = useLanguage();

    const SORT_OPTIONS = useMemo(() => ({
        'downloads': t('uploaderDetail:sortCriteria.downloads'),
        'week': t('uploaderDetail:sortCriteria.week'),
        'publicdate': t('uploaderDetail:sortCriteria.publicdate'),
        'addeddate': t('uploaderDetail:sortCriteria.addeddate'),
    }), [t]);

    return (
        <div className="flex items-center justify-end gap-2">
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
    );
});

const MediaTypeFilter: React.FC<{ 
    stats: UploaderStats | null; 
    isLoading: boolean; 
    activeFilter: MediaType | 'all'; 
    onFilterChange: (filter: MediaType | 'all') => void 
}> = React.memo(({ stats, isLoading, activeFilter, onFilterChange }) => {
    const { t } = useLanguage();
    
    const statItems = useMemo(() => ([
        { key: 'total', type: 'all', icon: <CollectionIcon className="w-5 h-5"/>, label: t('uploaderDetail:filters.allTypes') },
        { key: 'movies', type: 'movies', icon: <MovieIcon className="w-5 h-5"/>, label: t('uploaderDetail:stats.movies') },
        { key: 'audio', type: 'audio', icon: <AudioIcon className="w-5 h-5"/>, label: t('uploaderDetail:stats.audio') },
        { key: 'texts', type: 'texts', icon: <BookIcon className="w-5 h-5"/>, label: t('uploaderDetail:stats.texts') },
        { key: 'image', type: 'image', icon: <ImageIcon className="w-5 h-5"/>, label: t('uploaderDetail:stats.images') },
        { key: 'software', type: 'software', icon: <JoystickIcon className="w-5 h-5"/>, label: t('uploaderDetail:stats.software') },
    ] as { key: keyof UploaderStats; icon: React.ReactNode; label: string, type: MediaType | 'all' }[]), [t]);

    if (isLoading) {
        return <div className="h-12 flex items-center"><Spinner /></div>;
    }
    
    return (
      <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/50 flex flex-wrap gap-3">
        {statItems.map(item => {
           const count = stats ? stats[item.key] : 0;
           if (count === 0 && item.key !== 'total') return null;

           const isActive = activeFilter === item.type;

           return (
             <button
                key={item.key}
                onClick={() => onFilterChange(item.type)}
                disabled={count === 0}
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-cyan-500 text-white shadow-md' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
             >
                {item.icon}
                <span>{item.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-800/60'}`}>{count.toLocaleString()}</span>
             </button>
           )
        })}
      </div>
    );
});

// --- MAIN COMPONENT ---

interface UploaderUploadsProps {
    profile: Profile;
    onSelectItem: (item: ArchiveItemSummary) => void;
}

export const UploaderUploads: React.FC<UploaderUploadsProps> = ({ profile, onSelectItem }) => {
    const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType | 'all'>('all');
    const { stats, isLoading: isLoadingStats } = useUploaderStats(profile);
    
    const {
        results,
        isLoading,
        isLoadingMore,
        error,
        totalResults,
        hasMore,
        lastElementRef,
        handleRetry,
        sort,
        setSort,
        sortDirection,
        toggleSortDirection
    } = useUploaderUploads(profile, mediaTypeFilter);

    return (
        <div className="space-y-4 animate-fade-in">
            <MediaTypeFilter 
                stats={stats} 
                isLoading={isLoadingStats}
                activeFilter={mediaTypeFilter}
                onFilterChange={setMediaTypeFilter}
            />
            <div className="min-h-[44px]">
              {!isLoading && results.length > 0 && (
                <UploadsSortControl
                    sort={sort}
                    setSort={setSort}
                    sortDirection={sortDirection}
                    toggleSortDirection={toggleSortDirection}
                />
              )}
            </div>
            <ResultsGrid
                results={results}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                error={error}
                onSelectItem={onSelectItem}
                hasMore={hasMore}
                totalResults={totalResults}
                lastElementRef={lastElementRef}
                onRetry={handleRetry}
            />
        </div>
    );
};