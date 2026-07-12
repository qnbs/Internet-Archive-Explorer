import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { metadataCache, searchCache } from '@/services/cacheService';

/**
 * Minimal in-memory IndexedDB mock sufficient for cacheService tests.
 */
function createMockIdb() {
  const stores: Record<string, Map<string, unknown>> = {};

  const getStore = (name: string) => {
    if (!stores[name]) stores[name] = new Map();
    return stores[name];
  };

  const fakeDb = {
    objectStoreNames: {
      contains: (name: string) => Boolean(stores[name]),
    },
    createObjectStore: (name: string) => {
      if (!stores[name]) stores[name] = new Map();
      return { name };
    },
    transaction: (name: string) => {
      const store = getStore(name);
      return {
        objectStore: () => ({
          get: (key: string) => {
            const req = {
              result: store.get(key),
              onsuccess: null as (() => void) | null,
              onerror: null as (() => void) | null,
              get source() {
                return this;
              },
            };
            queueMicrotask(() => req.onsuccess?.());
            return req;
          },
          put: (value: unknown, key: string) => {
            const req = {
              onsuccess: null as (() => void) | null,
              onerror: null as (() => void) | null,
              get source() {
                return this;
              },
            };
            queueMicrotask(() => {
              store.set(key, value);
              req.onsuccess?.();
            });
            return req;
          },
          delete: (key: string) => {
            const req = {
              onsuccess: null as (() => void) | null,
              onerror: null as (() => void) | null,
              get source() {
                return this;
              },
            };
            queueMicrotask(() => {
              store.delete(key);
              req.onsuccess?.();
            });
            return req;
          },
          getAllKeys: () => {
            const req = {
              result: Array.from(store.keys()),
              onsuccess: null as (() => void) | null,
              onerror: null as (() => void) | null,
              get source() {
                return this;
              },
            };
            queueMicrotask(() => req.onsuccess?.());
            return req;
          },
        }),
      };
    },
  } as unknown as IDBDatabase;

  const fakeFactory = {
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
  } as unknown as IDBFactory;

  return { fakeFactory, stores };
}

describe('cacheService', () => {
  let originalIndexedDB: IDBFactory | undefined;

  beforeEach(() => {
    originalIndexedDB = globalThis.indexedDB;
    const { fakeFactory } = createMockIdb();
    Object.defineProperty(globalThis, 'indexedDB', {
      value: fakeFactory,
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

  it('stores and retrieves metadata', async () => {
    const meta = {
      identifier: 'test-item',
      title: 'Test Item',
      creator: ['Tester'],
      mediatype: 'texts',
    };
    await metadataCache.set('item:test-item', meta as unknown as import('@/types').ArchiveMetadata);
    const cached = await metadataCache.get('item:test-item');
    expect(cached).toEqual(meta);
  });

  it('returns undefined for missing metadata', async () => {
    const cached = await metadataCache.get('item:missing');
    expect(cached).toBeUndefined();
  });

  it('removes search cache entries', async () => {
    const entry = { data: { response: { docs: [], numFound: 0, start: 0 } }, cachedAt: Date.now() };
    await searchCache.set('search:x', entry);
    expect(await searchCache.get('search:x')).toEqual(entry);
    await searchCache.remove('search:x');
    expect(await searchCache.get('search:x')).toBeUndefined();
  });

  it('lists search cache keys', async () => {
    await searchCache.set('search:a', {
      data: { response: { docs: [], numFound: 0, start: 0 } },
      cachedAt: 1,
    });
    await searchCache.set('search:b', {
      data: { response: { docs: [], numFound: 0, start: 0 } },
      cachedAt: 2,
    });
    const keys = await searchCache.keys();
    expect(keys.sort()).toEqual(['search:a', 'search:b']);
  });

  it('gracefully handles IndexedDB errors', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: {
        open: () => {
          const req = {
            onsuccess: null as (() => void) | null,
            onerror: null as (() => void) | null,
          };
          queueMicrotask(() => req.onerror?.());
          return req;
        },
      } as unknown as IDBFactory,
      configurable: true,
    });

    const cached = await metadataCache.get('any');
    expect(cached).toBeUndefined();
  });
});
