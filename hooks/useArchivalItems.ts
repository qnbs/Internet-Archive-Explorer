import { useQuery } from '@tanstack/react-query';
import type { ArchiveItemSummary } from '@/types';
import { searchArchive } from '@/services/archiveService';

/**
 * TanStack Query v5 hook: fetches a list of archival items for carousels / grids.
 * Replaces the old useState/useEffect approach with proper caching + deduplication.
 */
export const useArchivalItems = (query: string, limit: number = 15) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ArchiveItemSummary[], Error>({
    queryKey: ['archivalItems', query, limit],
    queryFn: async () => {
      const result = await searchArchive(query, 1, ['-downloads'], undefined, limit);
      return result.response?.docs ?? [];
    },
    enabled: Boolean(query),
    staleTime: 1000 * 60 * 5,
  });

  return {
    items: data ?? [],
    isLoading,
    error: isError ? (error?.message ?? 'Error') : null,
    refetch,
  };
};

