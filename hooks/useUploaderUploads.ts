import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ArchiveItemSummary, Uploader, MediaType } from '../types';
import { searchArchive } from '../services/archiveService';
import { useInfiniteScroll } from './useInfiniteScroll';
import { useDebounce } from './useDebounce';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

export const useUploaderUploads = (uploader: Uploader) => {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const [results, setResults] = useState<ArchiveItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter and Sort State
    const [sort, setSort] = useState<string>('downloads');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const constructedQuery = useMemo(() => {
        const parts = [`uploader:("${uploader.searchUploader}")`];
        if (mediaTypeFilter !== 'all') {
            parts.push(`mediatype:(${mediaTypeFilter})`);
        }
        if (debouncedSearchQuery.trim()) {
            parts.push(`AND (${debouncedSearchQuery.trim()})`);
        }
        return parts.join(' ');
    }, [uploader.searchUploader, mediaTypeFilter, debouncedSearchQuery]);

    const performSearch = useCallback(async (query: string, searchPage: number, currentSort: string, direction: 'asc' | 'desc') => {
        if (searchPage === 1) setIsLoading(true);
        else setIsLoadingMore(true);
        setError(null);
        
        const sortParam = `${direction === 'desc' ? '-' : ''}${currentSort}`;

        try {
            const data = await searchArchive(query, searchPage, [sortParam], undefined, settings.resultsPerPage);
            if (data?.response) {
                setTotalResults(data.response.numFound);
                setResults(prev => searchPage === 1 ? data.response.docs : [...prev, ...data.response.docs]);
            }
        } catch (err) {
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [t, settings.resultsPerPage]);

    useEffect(() => {
        setPage(1);
        performSearch(constructedQuery, 1, sort, sortDirection);
    }, [constructedQuery, sort, sortDirection, performSearch]);
    
    const handleLoadMore = useCallback(() => {
        if (isLoading || isLoadingMore) return;
        setPage(prev => {
            const nextPage = prev + 1;
            performSearch(constructedQuery, nextPage, sort, sortDirection);
            return nextPage;
        });
    }, [isLoading, isLoadingMore, performSearch, constructedQuery, sort, sortDirection]);

    const handleRetry = useCallback(() => {
        setPage(1);
        performSearch(constructedQuery, 1, sort, sortDirection);
    }, [constructedQuery, sort, sortDirection, performSearch]);

    const toggleSortDirection = () => {
        setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    const hasMore = !isLoading && results.length < totalResults;
    const lastElementRef = useInfiniteScroll({
        isLoading: isLoadingMore,
        hasMore,
        onLoadMore: handleLoadMore,
        rootMargin: '400px',
    });

    return {
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
    };
};