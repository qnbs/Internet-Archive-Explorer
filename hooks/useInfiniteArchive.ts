import { useInfiniteQuery } from '@tanstack/react-query';
import type { ArchiveItemSummary } from '@/types';
import { searchArchive } from '@/services/archiveService';

interface UseInfiniteArchiveOptions {
  query: string;
  pageSize?: number;
  sort?: string[];
  mediaType?: string;
}

interface ArchivePage {
  items: ArchiveItemSummary[];
  nextPage: number | null;
  totalFound: number;
}

/**
 * TanStack Query v5 Infinite Scroll hook for the Internet Archive API.
 * Supports automatic pagination, deduplication and stale-while-revalidate caching.
 */
export const useInfiniteArchive = ({
  query,
  pageSize = 24,
  sort = ['-downloads'],
  mediaType,
}: UseInfiniteArchiveOptions) => {
  return useInfiniteQuery<ArchivePage, Error>({
    queryKey: ['infiniteArchive', query, pageSize, sort, mediaType],
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const result = await searchArchive(query, page, sort, mediaType, pageSize);
      const docs = result.response?.docs ?? [];
      const totalFound = result.response?.numFound ?? 0;
      const hasMore = page * pageSize < totalFound;
      return {
        items: docs,
        nextPage: hasMore ? page + 1 : null,
        totalFound,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    enabled: Boolean(query),
  });
};
