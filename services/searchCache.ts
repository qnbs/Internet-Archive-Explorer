import { searchCache } from '@/services/cacheService';
import type { ArchiveSearchResponse } from '@/types';

const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/**
 * Build a deterministic cache key for a search result page.
 *
 * The key includes the query, page number, sort order and page size so that
 * changing any of these parameters yields a separate cache entry.
 */
export const buildSearchCacheKey = (
  prefix: string,
  query: string,
  page: number,
  sorts: string[] = [],
  limit?: number,
): string => {
  const sortPart = sorts.join(',');
  return `${prefix}:${query}:page:${page}:sort:${sortPart}:limit:${limit ?? 24}`;
};

/**
 * Read a cached search result if it exists and has not expired.
 */
export const getCachedSearchResult = async (
  key: string,
): Promise<ArchiveSearchResponse | undefined> => {
  const cached = await searchCache.get(key);
  if (!cached) return undefined;

  if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
    await searchCache.remove(key);
    return undefined;
  }

  return cached.data;
};

/**
 * Persist a search result page to IndexedDB.
 */
export const setCachedSearchResult = async (
  key: string,
  data: ArchiveSearchResponse,
): Promise<void> => {
  await searchCache.set(key, { data, cachedAt: Date.now() });
};

/**
 * Remove search result entries whose `cachedAt` timestamp exceeds the TTL.
 *
 * This is intended to run during application startup or on a long interval so
 * expired entries are cleaned up even if their keys are never read again.
 */
export const cleanupExpiredSearchResults = async (): Promise<number> => {
  const keys = await searchCache.keys();
  const now = Date.now();
  let removed = 0;

  await Promise.all(
    keys.map(async (key) => {
      const cached = await searchCache.get(key);
      if (cached && now - cached.cachedAt > CACHE_TTL_MS) {
        await searchCache.remove(key);
        removed += 1;
      }
    }),
  );

  return removed;
};
