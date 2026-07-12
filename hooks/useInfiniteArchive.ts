import { useInfiniteQuery } from '@tanstack/react-query';
import { searchArchive } from '@/services/archiveService';
import {
  buildSearchCacheKey,
  getCachedSearchResult,
  setCachedSearchResult,
} from '@/services/searchCache';
import type { ArchiveItemSummary } from '@/types';

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
 * Supports automatic pagination, deduplication, stale-while-revalidate caching
 * and persistent IndexedDB-backed result caching.
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
      const effectiveQuery = mediaType ? `${query} AND mediatype:${mediaType}` : query;
      const cacheKey = buildSearchCacheKey('infiniteArchive', effectiveQuery, page, sort, pageSize);

      const cached = await getCachedSearchResult(cacheKey);
      if (cached) {
        searchArchive(effectiveQuery, page, sort, undefined, pageSize)
          .then((fresh) => setCachedSearchResult(cacheKey, fresh))
          .catch(() => undefined);
        const docs = cached.response?.docs ?? [];
        const totalFound = cached.response?.numFound ?? 0;
        const hasMore = page * pageSize < totalFound;
        return { items: docs, nextPage: hasMore ? page + 1 : null, totalFound };
      }

      const result = await searchArchive(effectiveQuery, page, sort, undefined, pageSize);
      await setCachedSearchResult(cacheKey, result);
      const docs = result.response?.docs ?? [];
      const totalFound = result.response?.numFound ?? 0;
      const hasMore = page * pageSize < totalFound;
      return { items: docs, nextPage: hasMore ? page + 1 : null, totalFound };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    enabled: Boolean(query),
  });
};
