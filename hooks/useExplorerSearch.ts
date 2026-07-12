import { useInfiniteQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { searchArchive } from '@/services/archiveService';
import {
  buildSearchCacheKey,
  getCachedSearchResult,
  setCachedSearchResult,
} from '@/services/searchCache';
import { facetsAtom, searchQueryAtom } from '@/store/search';
import type { ArchiveItemSummary } from '@/types';
import { buildArchiveQuery } from '@/utils/queryBuilder';
import { useInfiniteScroll } from './useInfiniteScroll';

export const useExplorerSearch = () => {
  const [searchQuery] = useAtom(searchQueryAtom);
  const [facets] = useAtom(facetsAtom);
  const debouncedQuery = useDebounce(searchQuery, 400);
  const { t } = useLanguage();

  const queryString = buildArchiveQuery({ text: debouncedQuery, facets });

  const { data, isLoading, isFetchingNextPage, error, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['explorerSearch', queryString],
      queryFn: async ({ pageParam }) => {
        const finalQuery = queryString || 'featured';
        const sorts = queryString ? ['-publicdate'] : [];
        const page = pageParam as number;
        const cacheKey = buildSearchCacheKey('explorerSearch', finalQuery, page, sorts);

        const cached = await getCachedSearchResult(cacheKey);
        if (cached) {
          // Refresh in the background so stale cached data is eventually replaced.
          searchArchive(finalQuery, page, sorts)
            .then((fresh) => setCachedSearchResult(cacheKey, fresh))
            .catch(() => undefined);
          return cached;
        }

        const result = await searchArchive(finalQuery, page, sorts);
        await setCachedSearchResult(cacheKey, result);
        return result;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const total = lastPage?.response?.numFound ?? 0;
        const loaded = allPages.reduce((acc, p) => acc + (p?.response?.docs?.length ?? 0), 0);
        return loaded < total ? allPages.length + 1 : undefined;
      },
    });

  const allDocs = data?.pages.flatMap((p) => p?.response?.docs ?? []) ?? [];
  const seen = new Set<string>();
  const results: ArchiveItemSummary[] = allDocs.filter((item) => {
    if (seen.has(item.identifier)) return false;
    seen.add(item.identifier);
    return true;
  });

  const totalResults = data?.pages[0]?.response?.numFound ?? 0;
  const hasMore = hasNextPage ?? false;
  const isLoadingMore = isFetchingNextPage;

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const lastElementRef = useInfiniteScroll({
    isLoading: isFetchingNextPage,
    hasMore,
    onLoadMore: handleLoadMore,
    rootMargin: '400px',
  });

  const errorMessage = error instanceof Error ? error.message : error ? t('common:error') : null;

  return {
    results,
    isLoading,
    isLoadingMore,
    error: errorMessage,
    totalResults,
    hasMore,
    lastElementRef,
    handleRetry,
  };
};
