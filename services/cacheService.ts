import type { ArchiveMetadata, ArchiveSearchResponse } from '@/types';
import { logger } from '@/utils/logger';

const DB_NAME = 'archive-explorer-cache';
const METADATA_STORE = 'metadata';
const SEARCH_STORE = 'searchResults';
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE);
      }
      if (!db.objectStoreNames.contains(SEARCH_STORE)) {
        db.createObjectStore(SEARCH_STORE);
      }
    };
  });
  return dbPromise;
};

const createIndexedDBCache = <T>(storeName: string) => {
  return {
    async get(key: string): Promise<T | undefined> {
      try {
        const db = await getDb();
        return await new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        logger.warn(`IndexedDB get error (${storeName}):`, error);
        return undefined;
      }
    },
    async set(key: string, value: T): Promise<void> {
      try {
        const db = await getDb();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const request = store.put(value, key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        logger.error(`IndexedDB set error (${storeName}):`, error);
      }
    },
    async remove(key: string): Promise<void> {
      try {
        const db = await getDb();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          const request = store.delete(key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        logger.error(`IndexedDB delete error (${storeName}):`, error);
      }
    },

    async keys(): Promise<string[]> {
      try {
        const db = await getDb();
        return await new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const request = store.getAllKeys();
          request.onsuccess = () => resolve(request.result as string[]);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        logger.warn(`IndexedDB keys error (${storeName}):`, error);
        return [];
      }
    },
  };
};

export interface CachedSearchEntry {
  data: ArchiveSearchResponse;
  cachedAt: number;
}

export const metadataCache = createIndexedDBCache<ArchiveMetadata>(METADATA_STORE);
export const searchCache = createIndexedDBCache<CachedSearchEntry>(SEARCH_STORE);
