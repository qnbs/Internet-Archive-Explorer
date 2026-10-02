import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDefaultStore } from 'jotai';
import { useLanguage } from '@/hooks/useLanguage';
import { searchArchive } from '@/services/archiveService';
import {
  buildSearchCacheKey,
  getCachedSearchEntry,
  setCachedSearchResult,
} from '@/services/searchCache';
import { lastCacheAgeAtom } from '@/store/cacheAge';
import type { ArchiveItemSummary } from '@/types';

const jotaiStore = getDefaultStore();

export type ArchivalItemsPayload = {
  items: ArchiveItemSummary[];
  /** Set when results are served from IndexedDB while offline. */
  offlineCachedAt: number | null;
};

/**
 * TanStack Query v5 hook: fetches a list of archival items for carousels / grids.
 * Results are persisted to IndexedDB; offline reads skip network refresh.
 */
export const useArchivalItems = (query: string, limit = 15) => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data, isLoading, isError, error, refetch } = useQuery<ArchivalItemsPayload, Error>({
    queryKey: ['archivalItems', query, limit],
    queryFn: async () => {
      const sort = ['-downloads'];
      const cacheKey = buildSearchCacheKey('archivalItems', query, 1, sort, limit);

      const cachedEntry = await getCachedSearchEntry(cacheKey);
      if (cachedEntry) {
        jotaiStore.set(lastCacheAgeAtom, cachedEntry.cachedAt);
        const offline = typeof navigator !== 'undefined' && !navigator.onLine;
        if (!offline) {
          searchArchive(query, 1, sort, undefined, limit)
            .then((fresh) => {
              setCachedSearchResult(cacheKey, fresh);
              queryClient.setQueryData<ArchivalItemsPayload>(['archivalItems', query, limit], {
                items: fresh.response?.docs ?? [],
                offlineCachedAt: null,
              });
            })
            .catch(() => undefined);
        }
        return {
          items: cachedEntry.data.response?.docs ?? [],
          offlineCachedAt: offline ? cachedEntry.cachedAt : null,
        };
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error(t('common:offline.message'));
      }

      const result = await searchArchive(query, 1, sort, undefined, limit);
      await setCachedSearchResult(cacheKey, result);
      jotaiStore.set(lastCacheAgeAtom, Date.now());
      return {
        items: result.response?.docs ?? [],
        offlineCachedAt: null,
      };
    },
    enabled: Boolean(query),
  });

  return {
    items: data?.items ?? [],
    offlineCachedAt: data?.offlineCachedAt ?? null,
    isLoading,
    error: isError ? (error?.message ?? 'Error') : null,
    refetch,
  };
};
