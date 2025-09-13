import { atomWithStorage } from 'jotai/utils';

// Define the SyncStorage interface to ensure our custom storage is correctly typed.
// This tells Jotai that our storage is synchronous and won't return Promises.
interface SyncStorage<Value> {
  getItem: (key: string, initialValue: Value) => Value;
  setItem: (key: string, newValue: Value) => void;
  removeItem: (key: string) => void;
}

/**
 * A custom storage object for jotai's atomWithStorage that gracefully handles
 * JSON parsing errors. If it encounters corrupted data in localStorage, it
 * logs a warning, removes the invalid entry, and returns the initial value,
 * preventing the application from crashing.
 */
const safeStorage: SyncStorage<any> = {
  getItem: (key: string, initialValue: any): any => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        return JSON.parse(storedValue);
      }
    } catch (e) {
      console.warn(`[Jotai] Could not parse localStorage key "${key}". Removing corrupted data.`, e);
      localStorage.removeItem(key);
    }
    return initialValue;
  },
  setItem: (key: string, newValue: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (e) {
      console.error(`[Jotai] Could not write to localStorage for key "${key}".`, e);
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
export function safeAtomWithStorage<Value>(
  key: string,
  initialValue: Value
) {
  // By explicitly providing the typed storage object, we avoid `as any` casts
  // and ensure jotai treats this as a synchronous storage, giving us correct types.
  return atomWithStorage(key, initialValue, safeStorage);
}
