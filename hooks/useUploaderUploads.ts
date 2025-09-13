import { useState, useEffect, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { profileSearchQueryAtom } from '../store/search';
import { resultsPerPageAtom } from '../store/settings';
import { useDebounce } from './useDebounce';
import { searchArchive } from '../services/archiveService';
import type { ArchiveItemSummary, Profile, MediaType, Facets } from '../types';
import { useInfiniteScroll } from './useInfiniteScroll';
import { getProfileApiQuery } from '../utils/profileUtils';
import { buildArchiveQuery } from '../utils/queryBuilder';

export const useUploaderUploads = (profile: Profile, mediaTypeFilter: MediaType | 'all') => {
    const resultsPerPage = useAtomValue(resultsPerPageAtom);
    const searchQuery = useAtomValue(profileSearchQueryAtom);
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const [results, setResults] = useState<ArchiveItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [sort, setSort] = useState('downloads');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const toggleSortDirection = () => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');

    const buildQuery = useCallback(() => {
        const baseQuery = getProfileApiQuery(profile);
        const facets: Partial<Facets> = {
            mediaType: mediaTypeFilter === 'all' ? new Set() : new Set([mediaTypeFilter])
        };
        return buildArchiveQuery({ base: baseQuery, text: debouncedSearchQuery, facets });
    }, [profile, mediaTypeFilter, debouncedSearchQuery]);

    const performSearch = useCallback(async (query: string, searchPage: number, currentSort: string, currentSortDir: 'asc' | 'desc') => {
        if (searchPage === 1) setIsLoading(true); else setIsLoadingMore(true);
        setError(null);

        const sortParam = `${currentSortDir === 'desc' ? '-' : ''}${currentSort}`;

        try {
            const data = await searchArchive(query, searchPage, [sortParam], undefined, resultsPerPage);
            if (data?.response) {
                setTotalResults(data.response.numFound);
                setResults(prev => searchPage === 1 ? data.response.docs : [...prev, ...data.response.docs]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [resultsPerPage]);
    
    // Reset and fetch on filter/sort/profile change
    useEffect(() => {
        setPage(1);
        const query = buildQuery();
        performSearch(query, 1, sort, sortDirection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile, debouncedSearchQuery, mediaTypeFilter, sort, sortDirection, buildQuery]);

    const handleLoadMore = useCallback(() => {
        if (isLoading || isLoadingMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        performSearch(buildQuery(), nextPage, sort, sortDirection);
    }, [isLoading, isLoadingMore, page, buildQuery, sort, sortDirection, performSearch]);

    const handleRetry = useCallback(() => {
        setPage(1);
        performSearch(buildQuery(), 1, sort, sortDirection);
    }, [buildQuery, sort, sortDirection, performSearch]);

    const hasMore = !isLoading && results.length < totalResults;
    const lastElementRef = useInfiniteScroll({
        isLoading: isLoadingMore,
        hasMore,
        onLoadMore: handleLoadMore,
        rootMargin: '400px'
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
    };
};