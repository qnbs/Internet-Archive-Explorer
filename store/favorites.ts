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
export const libraryItemsAtom = safeAtomWithStorage<Record<string, LibraryItem>>(STORAGE_KEYS.libraryItems, {});

export const libraryItemIdentifiersAtom = atom(get => new Set(Object.keys(get(libraryItemsAtom))));

export const addLibraryItemAtom = atom(
    null,
    (get, set, item: ArchiveItemSummary) => {
        const currentItems = get(libraryItemsAtom);
        if (currentItems[item.identifier]) return;
        
        const newItem: LibraryItem = {
            ...item,
            notes: '',
            tags: [],
            addedAt: Date.now(),
            collections: [],
        };
        set(libraryItemsAtom, { ...currentItems, [item.identifier]: newItem });
    }
);

export const removeLibraryItemAtom = atom(
    null,
    (get, set, identifier: string) => {
        set(libraryItemsAtom, items => {
            const newItems = { ...items };
            delete newItems[identifier];
            return newItems;
        });
    }
);

export const removeLibraryItemsAtom = atom(
    null,
    (get, set, identifiers: string[]) => {
        set(libraryItemsAtom, items => {
            const newItems = { ...items };
            for (const id of identifiers) {
                delete newItems[id];
            }
            return newItems;
        });
    }
);

export const updateLibraryItemNotesAtom = atom(
    null,
    (get, set, { id, notes }: { id: string; notes: string }) => {
        set(libraryItemsAtom, items => {
            if (items[id]) {
                return { ...items, [id]: { ...items[id], notes } };
            }
            return items;
        });
    }
);

export const updateLibraryItemTagsAtom = atom(
    null,
    (get, set, { id, tags }: { id: string; tags: string[] }) => {
        set(libraryItemsAtom, items => {
            if (items[id]) {
                return { ...items, [id]: { ...items[id], tags } };
            }
            return items;
        });
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
    const items: LibraryItem[] = Object.values(get(libraryItemsAtom));
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
        set(libraryItemsAtom, items => {
            const newItems = { ...items };
            let changed = false;
            idSet.forEach(id => {
                if (newItems[id]) {
                    const newTags = new Set([...newItems[id].tags, ...tags]);
                    newItems[id] = { ...newItems[id], tags: Array.from(newTags) };
                    changed = true;
                }
            });
            return changed ? newItems : items;
        });
    }
);

// --- Global Library Actions ---
export const clearLibraryAtom = atom(null, (get, set) => {
    set(libraryItemsAtom, {});
    set(userCollectionsAtom, []);
    set(uploaderFavoritesAtom, []);
});