import React from 'react';
import type { ArchiveItemSummary, Uploader } from '../../types';
import { useUploaderUploads } from '../../hooks/useUploaderUploads';
import { ResultsGrid } from '../ResultsGrid';
import { UploadsFilterBar } from './UploadsFilterBar';

interface UploaderUploadsProps {
    uploader: Uploader;
    onSelectItem: (item: ArchiveItemSummary) => void;
}

export const UploaderUploads: React.FC<UploaderUploadsProps> = ({ uploader, onSelectItem }) => {
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
        toggleSortDirection,
        mediaTypeFilter,
        setMediaTypeFilter,
        searchQuery,
        setSearchQuery
    } = useUploaderUploads(uploader);

    return (
        <div className="space-y-4">
            <UploadsFilterBar
                sort={sort}
                setSort={setSort}
                sortDirection={sortDirection}
                toggleSortDirection={toggleSortDirection}
                mediaTypeFilter={mediaTypeFilter}
                setMediaTypeFilter={setMediaTypeFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                totalResults={totalResults}
            />
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