import type { ArchiveMetadata } from '../types';

const DB_NAME = 'archive-explorer-cache';
const STORE_NAME = 'metadata';
const DB_VERSION = 1;

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
            request.result.createObjectStore(STORE_NAME);
        };
    });
    return dbPromise;
};

const createIndexedDBCache = <T,>() => {
    return {
        async get(key: string): Promise<T | undefined> {
            try {
                const db = await getDb();
                return await new Promise((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, 'readonly');
                    const store = tx.objectStore(STORE_NAME);
                    const request = store.get(key);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.error("IndexedDB get error:", error);
                return undefined;
            }
        },
        async set(key: string, value: T): Promise<void> {
             try {
                const db = await getDb();
                await new Promise<void>((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    const store = tx.objectStore(STORE_NAME);
                    const request = store.put(value, key);
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.error("IndexedDB set error:", error);
            }
        },
    };
};

export const metadataCache = createIndexedDBCache<ArchiveMetadata>();
