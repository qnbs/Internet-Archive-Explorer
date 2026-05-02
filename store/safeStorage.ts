import { atomWithStorage } from 'jotai/utils';
import { logger } from '@/utils/logger';

// Define the SyncStorage interface to ensure our custom storage is correctly typed.
// This tells Jotai that our storage is synchronous and won't return Promises.
interface SyncStorage<Value> {
  getItem: (key: string, initialValue: Value) => Value;
  setItem: (key: string, newValue: Value) => void;
  removeItem: (key: string) => void;
}

/**
 * Jotai synchronous storage with JSON parse/write guards.
 * Exported for unit tests only — app code should use `safeAtomWithStorage`.
 */
export const safeJotaiSyncStorage = {
  getItem: (key: string, initialValue: unknown): unknown => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        return JSON.parse(storedValue);
      }
    } catch (e) {
      logger.warn(`[Jotai] Could not parse localStorage key "${key}". Removing corrupted data.`, e);
      localStorage.removeItem(key);
    }
    return initialValue;
  },
  setItem: (key: string, newValue: unknown): void => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (e) {
      logger.error(`[Jotai] Could not write to localStorage for key "${key}".`, e);
    }
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
};

/**
 * A wrapper around jotai's `atomWithStorage` that uses a custom, safer storage
 * implementation. This prevents the app from crashing due to corrupted data
 * in localStorage.
 *
 * @param key The localStorage key.
 * @param initialValue The initial value of the atom if none is stored.
 * @returns A Jotai atom that syncs with localStorage safely.
 */
export function safeAtomWithStorage<Value>(key: string, initialValue: Value) {
  // By explicitly providing the typed storage object, we ensure jotai treats
  // this as a synchronous storage, giving us correct types for our atoms.
  return atomWithStorage(key, initialValue, safeJotaiSyncStorage as SyncStorage<Value>);
}
