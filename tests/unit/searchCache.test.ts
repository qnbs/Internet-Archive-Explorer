import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { searchCache } from '@/services/cacheService';
import {
  buildSearchCacheKey,
  cleanupExpiredSearchResults,
  getCachedSearchResult,
  setCachedSearchResult,
} from '@/services/searchCache';
import type { ArchiveSearchResponse } from '@/types';

/**
 * Minimal in-memory IndexedDB mock for searchCache tests.
 */
function createMockIdb() {
  const stores: Record<string, Map<string, unknown>> = {};
  const getStore = (name: string) => {
    if (!stores[name]) stores[name] = new Map();
    return stores[name];
  };

  const fakeDb = {
    objectStoreNames: { contains: (name: string) => Boolean(stores[name]) },
    createObjectStore: (name: string) => {
      if (!stores[name]) stores[name] = new Map();
      return { name };
    },
    transaction: (name: string) => ({
      objectStore: () => ({
        get: (key: string) => {
          const req = {
            result: getStore(name).get(key),
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
          };
          queueMicrotask(() => req.onsuccess?.());
          return req;
        },
        put: (value: unknown, key: string) => {
          const req = {
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
          };
          queueMicrotask(() => {
            getStore(name).set(key, value);
            req.onsuccess?.();
          });
          return req;
        },
        delete: (key: string) => {
          const req = {
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
          };
          queueMicrotask(() => {
            getStore(name).delete(key);
            req.onsuccess?.();
          });
          return req;
        },
        getAllKeys: () => {
          const req = {
            result: Array.from(getStore(name).keys()),
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
          };
          queueMicrotask(() => req.onsuccess?.());
          return req;
        },
      }),
    }),
  } as unknown as IDBDatabase;

  return {
    indexedDB: {
      open: () => {
        const req = {
          result: fakeDb,
          onsuccess: null as (() => void) | null,
          onerror: null as (() => void) | null,
          onupgradeneeded: null as (() => void) | null,
        };
        queueMicrotask(() => {
          req.onupgradeneeded?.();
          req.onsuccess?.();
        });
        return req;
      },
    } as unknown as IDBFactory,
  };
}

describe('searchCache', () => {
  let originalIndexedDB: IDBFactory | undefined;

  beforeEach(() => {
    originalIndexedDB = globalThis.indexedDB;
    Object.defineProperty(globalThis, 'indexedDB', {
      value: createMockIdb().indexedDB,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'indexedDB', {
      value: originalIndexedDB,
      configurable: true,
    });
  });

  const makeResponse = (numFound = 0): ArchiveSearchResponse => ({
    response: { docs: [], numFound, start: 0 },
  });

  it('builds deterministic cache keys', () => {
    const key1 = buildSearchCacheKey('explorerSearch', 'foo', 1, ['-publicdate'], 24);
    const key2 = buildSearchCacheKey('explorerSearch', 'foo', 1, ['-publicdate'], 24);
    const key3 = buildSearchCacheKey('explorerSearch', 'foo', 2, ['-publicdate'], 24);
    expect(key1).toBe(key2);
    expect(key1).not.toBe(key3);
  });

  it('returns cached data within TTL', async () => {
    const data = makeResponse(42);
    const key = buildSearchCacheKey('explorerSearch', 'foo', 1, ['-publicdate']);
    await setCachedSearchResult(key, data);
    const cached = await getCachedSearchResult(key);
    expect(cached).toEqual(data);
  });

  it('returns undefined for missing cache entries', async () => {
    const cached = await getCachedSearchResult('search:never');
    expect(cached).toBeUndefined();
  });

  it('expires entries older than 7 days', async () => {
    const key = buildSearchCacheKey('explorerSearch', 'old', 1, ['-publicdate']);
    const data = makeResponse(1);
    const eightDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 8;
    await searchCache.set(key, { data, cachedAt: eightDaysAgo });

    const cached = await getCachedSearchResult(key);
    expect(cached).toBeUndefined();
    expect(await searchCache.get(key)).toBeUndefined();
  });

  it('cleans up expired entries', async () => {
    const freshKey = buildSearchCacheKey('explorerSearch', 'fresh', 1, ['-publicdate']);
    const staleKey = buildSearchCacheKey('explorerSearch', 'stale', 1, ['-publicdate']);
    const data = makeResponse(1);

    await setCachedSearchResult(freshKey, data);
    await searchCache.set(staleKey, { data, cachedAt: Date.now() - 1000 * 60 * 60 * 24 * 8 });

    const removed = await cleanupExpiredSearchResults();
    expect(removed).toBe(1);
    expect(await getCachedSearchResult(freshKey)).toEqual(data);
    expect(await getCachedSearchResult(staleKey)).toBeUndefined();
  });
});
