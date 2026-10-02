import { type InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getDefaultStore, useAtom } from 'jotai';
import { useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useLanguage } from '@/hooks/useLanguage';
import { searchArchive } from '@/services/archiveService';
import {
  buildSearchCacheKey,
  getCachedSearchEntry,
  setCachedSearchResult,
} from '@/services/searchCache';
import { lastCacheAgeAtom } from '@/store/cacheAge';
import { facetsAtom, searchQueryAtom } from '@/store/search';
import type { ArchiveItemSummary, ArchiveSearchResponse } from '@/types';
import { buildArchiveQuery } from '@/utils/queryBuilder';
import { useInfiniteScroll } from './useInfiniteScroll';

const jotaiStore = getDefaultStore();

export const useExplorerSearch = () => {
  const [searchQuery] = useAtom(searchQueryAtom);
  const [facets] = useAtom(facetsAtom);
  const debouncedQuery = useDebounce(searchQuery, 400);
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const queryString = buildArchiveQuery({ text: debouncedQuery, facets });

  const { data, isLoading, isFetchingNextPage, error, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['explorerSearch', queryString],
      queryFn: async ({ pageParam, signal }) => {
        const finalQuery = queryString || 'featured';
        const sorts = queryString ? ['-publicdate'] : [];
        const page = pageParam as number;
        const cacheKey = buildSearchCacheKey('explorerSearch', finalQuery, page, sorts);

        const cachedEntry = await getCachedSearchEntry(cacheKey);
        if (cachedEntry) {
          jotaiStore.set(lastCacheAgeAtom, cachedEntry.cachedAt);
          if (typeof navigator !== 'undefined' && navigator.onLine) {
            searchArchive(finalQuery, page, sorts, undefined, undefined, { signal })
              .then((fresh) => {
                setCachedSearchResult(cacheKey, fresh);
                queryClient.setQueryData<InfiniteData<ArchiveSearchResponse>>(
                  ['explorerSearch', queryString],
                  (old) => {
                    if (!old) return old;
                    const pageIndex = old.pageParams.indexOf(page);
                    if (pageIndex === -1) return old;
                    const newPages = [...old.pages];
                    newPages[pageIndex] = fresh;
                    return { ...old, pages: newPages };
                  },
                );
              })
              .catch(() => undefined);
          }
          return cachedEntry.data;
        }

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new Error(t('common:offline.message'));
        }

        const result = await searchArchive(finalQuery, page, sorts, undefined, undefined, {
          signal,
        });
        await setCachedSearchResult(cacheKey, result);
        jotaiStore.set(lastCacheAgeAtom, Date.now());
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
