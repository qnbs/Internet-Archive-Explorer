import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { searchArchive } from '@/services/archiveService';
import {
  buildSearchCacheKey,
  getCachedSearchResult,
  setCachedSearchResult,
} from '@/services/searchCache';
import type { ArchiveItemSummary, ArchiveSearchResponse } from '@/types';

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

const buildArchivePage = (
  response: ArchiveSearchResponse,
  page: number,
  pageSize: number,
): ArchivePage => {
  const docs = response.response?.docs ?? [];
  const totalFound = response.response?.numFound ?? 0;
  const hasMore = page * pageSize < totalFound;
  return { items: docs, nextPage: hasMore ? page + 1 : null, totalFound };
};

const refreshCachedPage = (
  queryClient: QueryClient,
  queryKey: unknown[],
  effectiveQuery: string,
  page: number,
  sort: string[],
  pageSize: number,
  cacheKey: string,
): void => {
  searchArchive(effectiveQuery, page, sort, undefined, pageSize)
    .then((fresh) => {
      setCachedSearchResult(cacheKey, fresh);
      queryClient.setQueryData<InfiniteData<ArchivePage>>(queryKey, (old) => {
        if (!old) return old;
        const pageIndex = old.pageParams.indexOf(page);
        if (pageIndex === -1) return old;
        const newPages = [...old.pages];
        newPages[pageIndex] = buildArchivePage(fresh, page, pageSize);
        return { ...old, pages: newPages };
      });
    })
    .catch(() => undefined);
};

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
  const queryClient = useQueryClient();
  return useInfiniteQuery<ArchivePage, Error>({
    queryKey: ['infiniteArchive', query, pageSize, sort, mediaType],
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const effectiveQuery = mediaType ? `${query} AND mediatype:${mediaType}` : query;
      const cacheKey = buildSearchCacheKey('infiniteArchive', effectiveQuery, page, sort, pageSize);

      const cached = await getCachedSearchResult(cacheKey);
      if (cached) {
        refreshCachedPage(
          queryClient,
          ['infiniteArchive', query, pageSize, sort, mediaType],
          effectiveQuery,
          page,
          sort,
          pageSize,
          cacheKey,
        );
        return buildArchivePage(cached, page, pageSize);
      }

      const result = await searchArchive(effectiveQuery, page, sort, undefined, pageSize);
      await setCachedSearchResult(cacheKey, result);
      return buildArchivePage(result, page, pageSize);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    enabled: Boolean(query),
  });
};
