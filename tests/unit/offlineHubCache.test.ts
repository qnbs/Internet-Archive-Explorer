import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hubTrendingCache } from '@/services/cacheService';
import { type ArchiveItemSummary, MediaType } from '@/types';
import { loadExploreTrending, persistExploreTrending } from '@/utils/offlineHubCache';

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
        clear: () => {
          const req = {
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
          };
          queueMicrotask(() => {
            getStore(name).clear();
            req.onsuccess?.();
          });
          return req;
        },
        getAllKeys: () => {
          const req = {
            result: [...getStore(name).keys()],
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
          };
          queueMicrotask(() => req.onsuccess?.());
          return req;
        },
        count: () => {
          const req = {
            result: getStore(name).size,
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
          };
          queueMicrotask(() => req.onsuccess?.());
          return req;
        },
      }),
    }),
  };

  return {
    fakeDb,
    stores,
  };
}

const sampleItem: ArchiveItemSummary = {
  identifier: 'test-game',
  title: 'Test Game',
  publicdate: '2020-01-01',
  mediatype: MediaType.Software,
};

describe('offlineHubCache', () => {
  beforeEach(async () => {
    localStorage.clear();
    const { fakeDb } = createMockIdb();
    Object.defineProperty(globalThis, 'indexedDB', {
      value: {
        open: () => {
          const req = {
            result: fakeDb,
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
            onupgradeneeded: null as ((ev: { target: { result: typeof fakeDb } }) => void) | null,
          };
          queueMicrotask(() => {
            req.onupgradeneeded?.({ target: { result: fakeDb } });
            req.onsuccess?.();
          });
          return req;
        },
      } as unknown as IDBFactory,
      configurable: true,
    });
    await hubTrendingCache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('persists and loads explore trending from IndexedDB', async () => {
    await persistExploreTrending([sampleItem]);
    const loaded = await loadExploreTrending();
    expect(loaded?.items).toHaveLength(1);
    expect(loaded?.items[0]?.identifier).toBe('test-game');
  });

  it('migrates legacy localStorage explore trending into IndexedDB', async () => {
    localStorage.setItem(
      'ia-offline-explore-trending-v1',
      JSON.stringify({ savedAt: 1000, items: [sampleItem] }),
    );
    const loaded = await loadExploreTrending();
    expect(loaded?.savedAt).toBe(1000);
    expect(localStorage.getItem('ia-offline-explore-trending-v1')).toBeNull();
    expect(await hubTrendingCache.get('explore-trending-v1')).toBeTruthy();
  });
});
