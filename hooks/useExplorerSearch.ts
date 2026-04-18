import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchQueryAtom, facetsAtom } from '@/store/search';
import { useDebounce } from '@/hooks/useDebounce';
import { searchArchive } from '@/services/archiveService';
import type { ArchiveItemSummary } from '@/types';
import { useInfiniteScroll } from './useInfiniteScroll';
import { useLanguage } from '@/hooks/useLanguage';
import { buildArchiveQuery } from '@/utils/queryBuilder';

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
        return searchArchive(finalQuery, pageParam as number, sorts);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const total = lastPage?.response?.numFound ?? 0;
        const loaded = allPages.reduce((acc, p) => acc + (p?.response?.docs?.length ?? 0), 0);
        return loaded < total ? allPages.length + 1 : undefined;
      },
      staleTime: 1000 * 60 * 2,
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
