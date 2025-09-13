

import { atom } from 'jotai';
import { safeAtomWithStorage } from './safeStorage';
import type { LibraryItem, UserCollection, ArchiveItemSummary } from '../types';
import { toastAtom } from './atoms';
import { v4 as uuidv4 } from 'uuid';

export const STORAGE_KEYS = {
    libraryItems: 'app-library-items-v2',
    uploaderFavorites: 'app-uploader-favorites-v1',
    userCollections: 'app-user-collections-v1',
};

// --- Library Items (Favorited Items) ---
export const libraryItemsAtom = safeAtomWithStorage<LibraryItem[]>(STORAGE_KEYS.libraryItems, []);

export const libraryItemIdentifiersAtom = atom(get => new Set(get(libraryItemsAtom).map(item => item.identifier)));

export const addLibraryItemAtom = atom(
    null,
    (get, set, item: ArchiveItemSummary) => {
        const currentItems = get(libraryItemsAtom);
        if (currentItems.some(i => i.identifier === item.identifier)) return;
        
        const newItem: LibraryItem = {
            ...item,
            notes: '',
            tags: [],
            addedAt: Date.now(),
            collections: [],
        };
        set(libraryItemsAtom, [newItem, ...currentItems]);
    }
);

export const removeLibraryItemAtom = atom(
    null,
    (get, set, identifier: string) => {
        set(libraryItemsAtom, items => items.filter(i => i.identifier !== identifier));
    }
);

export const removeLibraryItemsAtom = atom(
    null,
    (get, set, identifiers: string[]) => {
        const idSet = new Set(identifiers);
        set(libraryItemsAtom, items => items.filter(i => !idSet.has(i.identifier)));
    }
);

export const updateLibraryItemNotesAtom = atom(
    null,
    (get, set, { id, notes }: { id: string; notes: string }) => {
        set(libraryItemsAtom, items => items.map(i => (i.identifier === id ? { ...i, notes } : i)));
    }
);

export const updateLibraryItemTagsAtom = atom(
    null,
    (get, set, { id, tags }: { id: string; tags: string[] }) => {
        set(libraryItemsAtom, items => items.map(i => (i.identifier === id ? { ...i, tags } : i)));
    }
);

// --- Uploader Favorites ---
export const uploaderFavoritesAtom = safeAtomWithStorage<string[]>(STORAGE_KEYS.uploaderFavorites, []);

export const uploaderFavoriteSetAtom = atom(get => new Set(get(uploaderFavoritesAtom)));

export const addUploaderFavoriteAtom = atom(
    null,
    (get, set, identifier: string) => {
        const current = get(uploaderFavoritesAtom);
        if (current.includes(identifier)) return;
        set(uploaderFavoritesAtom, [identifier, ...current]);
    }
);

export const removeUploaderFavoriteAtom = atom(
    null,
    (get, set, identifier: string) => {
        set(uploaderFavoritesAtom, favs => favs.filter(id => id !== identifier));
    }
);


// --- User Collections ---
export const userCollectionsAtom = safeAtomWithStorage<UserCollection[]>(STORAGE_KEYS.userCollections, []);

export const createCollectionAtom = atom(
    null,
    (get, set, name: string): UserCollection => {
        const newCollection: UserCollection = { id: uuidv4(), name, itemIdentifiers: [] };
        set(userCollectionsAtom, collections => [...collections, newCollection]);
        return newCollection;
    }
);

export const deleteCollectionAtom = atom(
    null,
    (get, set, id: string) => {
        set(userCollectionsAtom, collections => collections.filter(c => c.id !== id));
    }
);

export const updateCollectionNameAtom = atom(
    null,
    (get, set, { id, newName }: { id: string; newName: string }) => {
        set(userCollectionsAtom, collections =>
            collections.map(c => (c.id === id ? { ...c, name: newName } : c))
        );
    }
);

export const addItemsToCollectionAtom = atom(
    null,
    (get, set, { collectionId, itemIds }: { collectionId: string; itemIds: string[] }) => {
        set(userCollectionsAtom, collections =>
            collections.map(c => {
                if (c.id === collectionId) {
                    const newIds = new Set([...c.itemIdentifiers, ...itemIds]);
                    return { ...c, itemIdentifiers: Array.from(newIds) };
                }
                return c;
            })
        );
    }
);

// --- User Tags ---
export const allTagsAtom = atom(get => {
    const items = get(libraryItemsAtom);
    const tags = new Set<string>();
    items.forEach(item => {
        item.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
});

export const addTagsToItemsAtom = atom(
    null,
    (get, set, { itemIds, tags }: { itemIds: string[]; tags: string[] }) => {
        const idSet = new Set(itemIds);
        set(libraryItemsAtom, items =>
            items.map(item => {
                if (idSet.has(item.identifier)) {
                    const newTags = new Set([...item.tags, ...tags]);
                    return { ...item, tags: Array.from(newTags) };
                }
                return item;
            })
        );
    }
);

// --- Global Library Actions ---
export const clearLibraryAtom = atom(null, (get, set) => {
    set(libraryItemsAtom, []);
    set(userCollectionsAtom, []);
    set(uploaderFavoritesAtom, []);
});
