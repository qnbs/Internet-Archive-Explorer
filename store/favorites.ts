import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ArchiveItemSummary, LibraryItem, UserCollection, MediaType, SortKey, SortDirection, LibraryFilter } from '../types';
import { v4 as uuidv4 } from 'uuid';


export const STORAGE_KEYS = {
    libraryItems: 'archive-library-items',
    userCollections: 'archive-user-collections',
    uploaderFavorites: 'archive-uploader-favorites',
};

// --- Library Items ---
export const libraryItemsAtom = atomWithStorage<LibraryItem[]>(STORAGE_KEYS.libraryItems, []);
export const libraryItemIdentifiersAtom = atom((get) => new Set(get(libraryItemsAtom).map(item => item.identifier)));

export const addLibraryItemAtom = atom(
    null,
    (get, set, item: ArchiveItemSummary) => {
        const current = get(libraryItemsAtom);
        if (!current.some(libItem => libItem.identifier === item.identifier)) {
            const newLibraryItem: LibraryItem = {
                ...item,
                dateAdded: Date.now(),
                notes: '',
                tags: [],
            };
            set(libraryItemsAtom, [newLibraryItem, ...current]);
        }
    }
);

export const removeLibraryItemAtom = atom(
    null,
    (get, set, identifier: string) => {
        set(libraryItemsAtom, current => current.filter(item => item.identifier !== identifier));
        // Also remove from all collections
        set(userCollectionsAtom, collections => collections.map(c => ({
            ...c,
            itemIdentifiers: c.itemIdentifiers.filter(id => id !== identifier)
        })));
    }
);

export const removeMultipleLibraryItemsAtom = atom(
    null,
    // FIX: Changed setter argument from a direct Set to an object to improve type inference with useSetAtom.
    (get, set, { identifiers }: { identifiers: Set<string> }) => {
        set(libraryItemsAtom, current => current.filter(item => !identifiers.has(item.identifier)));
        // Also remove from all collections
        set(userCollectionsAtom, collections => collections.map(c => ({
            ...c,
            itemIdentifiers: c.itemIdentifiers.filter(id => !identifiers.has(id))
        })));
    }
);

export const updateLibraryItemNotesAtom = atom(
    null,
    (get, set, { identifier, notes }: { identifier: string, notes: string }) => {
        set(libraryItemsAtom, items => items.map(item => item.identifier === identifier ? { ...item, notes } : item));
    }
);

export const updateLibraryItemTagsAtom = atom(
    null,
    (get, set, { identifier, tags }: { identifier: string, tags: string[] }) => {
        const uniqueSortedTags = [...new Set(tags)].sort();
        set(libraryItemsAtom, items => items.map(item => item.identifier === identifier ? { ...item, tags: uniqueSortedTags } : item));
    }
);

export const addTagsToMultipleItemsAtom = atom(
    null,
    (get, set, { identifiers, tags }: { identifiers: Set<string>, tags: string[] }) => {
        set(libraryItemsAtom, items => items.map(item => {
            if (identifiers.has(item.identifier)) {
                const newTags = [...new Set([...item.tags, ...tags])].sort();
                return { ...item, tags: newTags };
            }
            return item;
        }));
    }
);

// --- User Collections ---
export const userCollectionsAtom = atomWithStorage<UserCollection[]>(STORAGE_KEYS.userCollections, []);

export const createCollectionAtom = atom(null, (get, set, name: string) => {
    const newCollection: UserCollection = { id: uuidv4(), name, itemIdentifiers: [], dateCreated: Date.now() };
    set(userCollectionsAtom, current => [...current, newCollection].sort((a,b) => a.name.localeCompare(b.name)));
});

export const deleteCollectionAtom = atom(null, (get, set, collectionId: string) => {
    set(userCollectionsAtom, current => current.filter(c => c.id !== collectionId));
});

export const addItemsToCollectionAtom = atom(
    null,
    // FIX: Changed `string[] | Set<string>` to `Iterable<string>` to simplify the type and fix inference issues.
    (get, set, { collectionId, itemIdentifiers }: { collectionId: string, itemIdentifiers: Iterable<string> }) => {
        set(userCollectionsAtom, collections => collections.map(c => {
            if (c.id === collectionId) {
                const newIdentifiers = [...new Set([...c.itemIdentifiers, ...itemIdentifiers])];
                return { ...c, itemIdentifiers: newIdentifiers };
            }
            return c;
        }));
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

// --- UI State for the Library View ---
export const librarySearchQueryAtom = atom('');
export const libraryMediaTypeFilterAtom = atom<MediaType | 'all'>('all');
export const librarySortAtom = atom<{ key: SortKey; dir: SortDirection }>({ key: 'dateAdded', dir: 'desc' });
export const selectedLibraryItemIdentifierAtom = atom<string | null>(null);
export const libraryActiveFilterAtom = atom<LibraryFilter>({ type: 'all' });
export const allLibraryTagsAtom = atom(get => {
    const items = get(libraryItemsAtom);
    const allTags = items.flatMap(item => item.tags);
    return [...new Set(allTags)].sort();
});

// --- Bulk Actions ---
// FIX: Explicitly type `new Set()` as `new Set<string>()` to match the atom's type signature and prevent type errors.
export const selectedLibraryItemsForBulkActionAtom = atom(new Set<string>());