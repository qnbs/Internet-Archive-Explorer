import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchArchive } from '@/services/archiveService';
import {
  buildSearchCacheKey,
  getCachedSearchResult,
  setCachedSearchResult,
} from '@/services/searchCache';
import type { ArchiveItemSummary } from '@/types';

/**
 * TanStack Query v5 hook: fetches a list of archival items for carousels / grids.
 * Replaces the old useState/useEffect approach with proper caching + deduplication.
 * Results are persisted to IndexedDB for instant subsequent loads.
 */
export const useArchivalItems = (query: string, limit: number = 15) => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery<ArchiveItemSummary[], Error>({
    queryKey: ['archivalItems', query, limit],
    queryFn: async () => {
      const sort = ['-downloads'];
      const cacheKey = buildSearchCacheKey('archivalItems', query, 1, sort, limit);

      const cached = await getCachedSearchResult(cacheKey);
      if (cached) {
        searchArchive(query, 1, sort, undefined, limit)
          .then((fresh) => {
            setCachedSearchResult(cacheKey, fresh);
            queryClient.setQueryData<ArchiveItemSummary[]>(
              ['archivalItems', query, limit],
              fresh.response?.docs ?? [],
            );
          })
          .catch(() => undefined);
        return cached.response?.docs ?? [];
      }

      const result = await searchArchive(query, 1, sort, undefined, limit);
      await setCachedSearchResult(cacheKey, result);
      return result.response?.docs ?? [];
    },
    enabled: Boolean(query),
  });

  return {
    items: data ?? [],
    isLoading,
    error: isError ? (error?.message ?? 'Error') : null,
    refetch,
  };
};
