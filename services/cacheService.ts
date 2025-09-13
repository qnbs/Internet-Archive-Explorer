import type { ArchiveMetadata } from '../types';

const createSessionStorageCache = <T,>(key: string, maxSize: number = 50) => {
    const getCache = (): { [key: string]: T } => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : {};
        } catch (error) {
            console.error(`Error reading sessionStorage key “${key}”:`, error);
            return {};
        }
    };

    const setCache = (cache: { [key: string]: T }) => {
        try {
            // Simple LRU-like eviction strategy to prevent sessionStorage from growing too large
            const keys = Object.keys(cache);
            if (keys.length > maxSize) {
                const keysToDelete = keys.slice(0, keys.length - maxSize);
                for (const keyToDelete of keysToDelete) {
                    delete cache[keyToDelete];
                }
            }
            sessionStorage.setItem(key, JSON.stringify(cache));
        } catch (error) {
            console.error(`Error setting sessionStorage key “${key}”:`, error);
        }
    };

    return {
        has: (id: string): boolean => {
            return id in getCache();
        },
        get: (id: string): T | undefined => {
            const cache = getCache();
            const value = cache[id];
            // Move accessed item to the end to mark it as recently used
            if (value) {
                delete cache[id];
                cache[id] = value;
                setCache(cache);
            }
            return value;
        },
        set: (id: string, value: T): void => {
            const cache = getCache();
            // If item already exists, remove it to re-insert at the end
            if (cache[id]) {
                delete cache[id];
            }
            cache[id] = value;
            setCache(cache);
        },
    };
};

export const metadataCache = createSessionStorageCache<ArchiveMetadata>('metadata-cache');
