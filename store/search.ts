import { atom } from 'jotai';
import { safeAtomWithStorage } from './safeStorage';
import type { Facets, MediaType } from '../types';

export const STORAGE_KEYS = {
    searchHistory: 'app-search-history',
};

// --- View-Specific Search State Atoms ---
export const searchQueryAtom = atom('');
export const profileSearchQueryAtom = atom('');

// --- Facets for Explorer Search ---
export const facetsAtom = atom<Facets>({ mediaType: new Set<MediaType>(), availability: 'all', language: undefined });

// --- Search History ---
export const searchHistoryAtom = safeAtomWithStorage<string[]>(STORAGE_KEYS.searchHistory, []);

export const addSearchHistoryAtom = atom(
    null,
    (get, set, query: string) => {
        const sanitizedQuery = query.trim();
        if (!sanitizedQuery) return;
        const newHistory = [
            sanitizedQuery,
            ...get(searchHistoryAtom).filter(item => item.toLowerCase() !== sanitizedQuery.toLowerCase())
        ].slice(0, 20);
        set(searchHistoryAtom, newHistory);
    }
);

export const clearSearchHistoryAtom = atom(null, (get, set) => {
    set(searchHistoryAtom, []);
});