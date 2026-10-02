import { logger } from '@/utils/logger';
import { safeJotaiSyncStorage } from './safeStorage';

/** User data keys stored in IndexedDB (large / quota-sensitive). */
export const PERSIST_INDEXEDDB_KEYS = [
  'app-library-items-v2',
  'app-user-collections-v1',
  'scriptorium-worksets-v2',
  'ai-archive-v1',
  'download-queue-v1',
] as const;

export type PersistIndexedDbKey = (typeof PERSIST_INDEXEDDB_KEYS)[number];

const IDB_KEY_SET = new Set<string>(PERSIST_INDEXEDDB_KEYS);

export const isIndexedDbPersistKey = (key: string): key is PersistIndexedDbKey =>
  IDB_KEY_SET.has(key);

const DB_NAME = 'archive-explorer-persist';
const KV_STORE = 'kv';
const DB_VERSION = 1;

const memoryCache = new Map<string, unknown>();
let dbPromise: Promise<IDBDatabase> | null = null;
let hydratePromise: Promise<void> | null = null;

/** Test-only reset (Vitest isolation). */
export function resetPersistStorageForTests(): void {
  memoryCache.clear();
  hydratePromise = null;
  dbPromise = null;
}

const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KV_STORE)) {
        db.createObjectStore(KV_STORE);
      }
    };
  });
  return dbPromise;
};

const idbGet = async (key: string): Promise<unknown | undefined> => {
  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(KV_STORE, 'readonly');
    const store = tx.objectStore(KV_STORE);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const idbPut = async (key: string, value: unknown): Promise<void> => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KV_STORE, 'readwrite');
    const store = tx.objectStore(KV_STORE);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const idbDelete = async (key: string): Promise<void> => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KV_STORE, 'readwrite');
    const store = tx.objectStore(KV_STORE);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const idbClear = async (): Promise<void> => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(KV_STORE, 'readwrite');
    const store = tx.objectStore(KV_STORE);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Loads IndexedDB-backed keys into memory and migrates legacy localStorage entries.
 * Must complete before React mounts so Jotai reads see migrated data.
 */
export async function hydratePersistStorage(): Promise<void> {
  if (hydratePromise) {
    return hydratePromise;
  }
  hydratePromise = (async () => {
    for (const key of PERSIST_INDEXEDDB_KEYS) {
      try {
        const fromIdb = await idbGet(key);
        if (fromIdb !== undefined) {
          memoryCache.set(key, fromIdb);
          localStorage.removeItem(key);
          continue;
        }

        const legacy = localStorage.getItem(key);
        if (legacy === null) {
          continue;
        }

        const parsed = JSON.parse(legacy) as unknown;
        memoryCache.set(key, parsed);
        await idbPut(key, parsed);
        localStorage.removeItem(key);
      } catch (error) {
        logger.warn(`[Persist] hydrate failed for key "${key}"`, error);
      }
    }
  })();
  return hydratePromise;
}

export function readPersistedRaw(key: string): string | null {
  if (isIndexedDbPersistKey(key)) {
    if (memoryCache.has(key)) {
      return JSON.stringify(memoryCache.get(key));
    }
    return localStorage.getItem(key);
  }
  return localStorage.getItem(key);
}

export function writePersistedRaw(key: string, raw: string | null): void {
  if (raw === null) {
    if (isIndexedDbPersistKey(key)) {
      memoryCache.delete(key);
      localStorage.removeItem(key);
      void idbDelete(key).catch((error) => {
        logger.warn(`[Persist] IDB delete failed for "${key}"`, error);
      });
      return;
    }
    localStorage.removeItem(key);
    return;
  }

  if (!isIndexedDbPersistKey(key)) {
    localStorage.setItem(key, raw);
    return;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    memoryCache.set(key, parsed);
    localStorage.removeItem(key);
    void idbPut(key, parsed).catch((error) => {
      logger.warn(`[Persist] IDB write failed for "${key}", keeping localStorage fallback`, error);
      try {
        localStorage.setItem(key, raw);
      } catch (lsError) {
        logger.error(`[Persist] localStorage fallback failed for "${key}"`, lsError);
      }
    });
  } catch (error) {
    logger.error(`[Persist] Invalid JSON for key "${key}"`, error);
    throw error;
  }
}

/** Clears IndexedDB persist store and in-memory cache (localStorage cleared separately). */
export async function clearIndexedDbPersistStore(): Promise<void> {
  memoryCache.clear();
  try {
    await idbClear();
  } catch (error) {
    logger.warn('[Persist] Failed to clear IndexedDB persist store', error);
  }
}

/**
 * Jotai synchronous storage for large persisted atoms (IndexedDB + memory).
 */
export const indexedDbJotaiSyncStorage = {
  getItem: (key: string, initialValue: unknown): unknown => {
    if (!isIndexedDbPersistKey(key)) {
      return safeJotaiSyncStorage.getItem(key, initialValue);
    }
    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }
    return safeJotaiSyncStorage.getItem(key, initialValue);
  },
  setItem: (key: string, newValue: unknown): void => {
    if (!isIndexedDbPersistKey(key)) {
      safeJotaiSyncStorage.setItem(key, newValue);
      return;
    }
    memoryCache.set(key, newValue);
    localStorage.removeItem(key);
    void idbPut(key, newValue).catch((error) => {
      logger.warn(`[Persist] IDB set failed for "${key}", localStorage fallback`, error);
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (lsError) {
        logger.error(`[Persist] localStorage fallback failed for "${key}"`, lsError);
      }
    });
  },
  removeItem: (key: string): void => {
    if (!isIndexedDbPersistKey(key)) {
      safeJotaiSyncStorage.removeItem(key);
      return;
    }
    memoryCache.delete(key);
    localStorage.removeItem(key);
    void idbDelete(key).catch((error) => {
      logger.warn(`[Persist] IDB remove failed for "${key}"`, error);
    });
  },
};
