import { atom } from 'jotai';

/**
 * Timestamp (ms) of the most recently served service-worker-cached response.
 * Used by UI indicators to show how stale the current Archive data is.
 */
export const lastCacheAgeAtom = atom<number | null>(null);
