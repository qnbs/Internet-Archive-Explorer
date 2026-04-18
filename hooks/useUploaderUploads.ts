import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useInfiniteQuery } from '@tanstack/react-query';
import { profileSearchQueryAtom } from '@/store/search';
import { resultsPerPageAtom } from '@/store/settings';
import { useDebounce } from './useDebounce';
import { searchArchive } from '@/services/archiveService';
import type { ArchiveItemSummary, Profile, MediaType, Facets } from '@/types';
import { useInfiniteScroll } from './useInfiniteScroll';
import { getProfileApiQuery } from '@/utils/profileUtils';
import { buildArchiveQuery } from '@/utils/queryBuilder';

export const useUploaderUploads = (profile: Profile, mediaTypeFilter: MediaType | 'all') => {
  const resultsPerPage = useAtomValue(resultsPerPageAtom);
  const searchQuery = useAtomValue(profileSearchQueryAtom);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const [sort, setSort] = useState('downloads');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const toggleSortDirection = () => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));

  const baseQuery = getProfileApiQuery(profile);
  const facets: Partial<Facets> = {
    mediaType: mediaTypeFilter === 'all' ? new Set() : new Set([mediaTypeFilter]),
  };
  const queryString = buildArchiveQuery({ base: baseQuery, text: debouncedSearchQuery, facets });
  const sortParam = `${sortDirection === 'desc' ? '-' : ''}${sort}`;

  const { data, isLoading, isFetchingNextPage, error, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['uploaderUploads', profile.searchIdentifier, queryString, sortParam],
      queryFn: async ({ pageParam }) => {
        return searchArchive(
          queryString,
          pageParam as number,
          [sortParam],
          undefined,
          resultsPerPage,
        );
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const total = lastPage?.response?.numFound ?? 0;
        const loaded = allPages.reduce((acc, p) => acc + (p?.response?.docs?.length ?? 0), 0);
        return loaded < total ? allPages.length + 1 : undefined;
      },
    });

  const results: ArchiveItemSummary[] = data?.pages.flatMap((p) => p?.response?.docs ?? []) ?? [];
  const totalResults = data?.pages[0]?.response?.numFound ?? 0;
  const hasMore = hasNextPage ?? false;
  const isLoadingMore = isFetchingNextPage;

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const handleRetry = useCallback(() => refetch(), [refetch]);

  const lastElementRef = useInfiniteScroll({
    isLoading: isFetchingNextPage,
    hasMore,
    onLoadMore: handleLoadMore,
    rootMargin: '400px',
  });

  return {
    results,
    isLoading,
    isLoadingMore,
    error: error instanceof Error ? error.message : error ? 'An error occurred' : null,
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
