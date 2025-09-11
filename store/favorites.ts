import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ArchiveItemSummary, MediaType, SortKey, SortDirection } from '../types';

export const STORAGE_KEYS = {
    itemFavorites: 'archive-favorites',
    uploaderFavorites: 'archive-uploader-favorites',
};

// --- Item Favorites ---
export const favoritesAtom = atomWithStorage<ArchiveItemSummary[]>(STORAGE_KEYS.itemFavorites, []);
export const favoriteIdentifiersAtom = atom((get) => new Set(get(favoritesAtom).map(fav => fav.identifier)));

export const addFavoriteAtom = atom(
    null,
    (get, set, item: ArchiveItemSummary) => {
        const current = get(favoritesAtom);
        if (!current.some(fav => fav.identifier === item.identifier)) {
            // Add to the beginning of the list to represent "recently added"
            set(favoritesAtom, [item, ...current]);
        }
    }
);

export const removeFavoriteAtom = atom(
    null,
    (get, set, identifier: string) => {
        set(favoritesAtom, current => current.filter(fav => fav.identifier !== identifier));
    }
);

export const removeMultipleFavoritesAtom = atom(
    null,
    (get, set, identifiers: Set<string>) => {
        set(favoritesAtom, current => current.filter(fav => !identifiers.has(fav.identifier)));
    }
);


// --- Uploader Favorites ---
export const uploaderFavoritesAtom = atomWithStorage<string[]>(STORAGE_KEYS.uploaderFavorites, []);
export const uploaderFavoriteSetAtom = atom((get) => new Set(get(uploaderFavoritesAtom)));

export const addUploaderFavoriteAtom = atom(
    null,
    (get, set, username: string) => {
        const current = get(uploaderFavoritesAtom);
        if (!current.includes(username)) {
            set(uploaderFavoritesAtom, [...current, username]);
        }
    }
);

export const removeUploaderFavoriteAtom = atom(
    null,
    (get, set, username: string) => {
        set(uploaderFavoritesAtom, current => current.filter(fav => fav !== username));
    }
);

// --- State for Favorites Management Suite ---
export const favoritesSearchQueryAtom = atom('');
export const favoritesMediaTypeFilterAtom = atom<MediaType | 'all'>('all');
export const favoritesSortAtom = atom<{ key: SortKey; dir: SortDirection }>({ key: 'dateAdded', dir: 'desc' });
export const selectedFavoritesForBulkActionAtom = atom<Set<string>>(new Set<string>());
