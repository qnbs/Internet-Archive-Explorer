import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { v4 as uuidv4 } from 'uuid';
import type { LibraryItem, ArchiveItemSummary, UserCollection } from '../types';

export const STORAGE_KEYS = {
    libraryItems: 'app-library-items-v2',
    uploaderFavorites: 'app-uploader-favorites-v1',
    libraryCollections: 'app-library-collections-v1',
};

// --- Library Items (formerly Item Favorites) ---

export const libraryItemsAtom = atomWithStorage<LibraryItem[]>(STORAGE_KEYS.libraryItems, []);

// Derived atom for quick ID lookups, improving performance for checking if an item is a favorite.
export const libraryItemIdentifiersAtom = atom((get) => {
    const items = get(libraryItemsAtom);
    return new Set(items.map(item => item.identifier));
});

// Write-only atom to add an item to the library.
export const addLibraryItemAtom = atom(
    null,
    (get, set, item: ArchiveItemSummary) => {
        const currentItems = get(libraryItemsAtom);
        if (!currentItems.some(i => i.identifier === item.identifier)) {
            const newItem: LibraryItem = {
                ...item,
                dateAdded: Date.now(),
                notes: '',
                tags: []
            };
            set(libraryItemsAtom, [newItem, ...currentItems]);
        }
    }
);

// Write-only atom to remove an item from the library.
export const removeLibraryItemAtom = atom(
    null,
    (get, set, identifier: string) => {
        const currentItems = get(libraryItemsAtom);
        set(libraryItemsAtom, currentItems.filter(item => item.identifier !== identifier));
        // Also remove from any collections
        set(userCollectionsAtom, collections => 
            collections.map(c => ({
                ...c,
                itemIdentifiers: c.itemIdentifiers.filter(id => id !== identifier),
            }))
        );
    }
);

// Write-only atom to remove multiple items from the library
export const removeLibraryItemsAtom = atom(
    null,
    (get, set, identifiers: string[]) => {
        const idSet = new Set(identifiers);
        set(libraryItemsAtom, items => items.filter(item => !idSet.has(item.identifier)));
        // Also remove from any collections
         set(userCollectionsAtom, collections => 
            collections.map(c => ({
                ...c,
                itemIdentifiers: c.itemIdentifiers.filter(id => !idSet.has(id)),
            }))
        );
    }
);

// Write-only atom to update the notes for a library item.
export const updateLibraryItemNotesAtom = atom(
    null,
    (get, set, { identifier, notes }: { identifier: string, notes: string }) => {
        set(libraryItemsAtom, items => items.map(item => item.identifier === identifier ? { ...item, notes } : item));
    }
);

// Write-only atom to update the tags for a library item.
export const updateLibraryItemTagsAtom = atom(
    null,
    (get, set, { identifier, tags }: { identifier: string, tags: string[] }) => {
        const uniqueTags = Array.from(new Set(tags)).sort();
        set(libraryItemsAtom, items => items.map(item => item.identifier === identifier ? { ...item, tags: uniqueTags } : item));
    }
);


// --- Uploader Favorites ---

export const uploaderFavoritesAtom = atomWithStorage<string[]>(STORAGE_KEYS.uploaderFavorites, []);

// Derived atom for quick ID lookups (Set).
export const uploaderFavoriteSetAtom = atom((get) => new Set(get(uploaderFavoritesAtom)));

// Write-only atom to add an uploader to favorites.
export const addUploaderFavoriteAtom = atom(
    null,
    (get, set, uploaderId: string) => {
        const current = get(uploaderFavoritesAtom);
        if (!current.includes(uploaderId)) {
            set(uploaderFavoritesAtom, [uploaderId, ...current]);
        }
    }
);

// Write-only atom to remove an uploader from favorites.
export const removeUploaderFavoriteAtom = atom(
    null,
    (get, set, uploaderId: string) => {
        set(uploaderFavoritesAtom, get(uploaderFavoritesAtom).filter(id => id !== uploaderId));
    }
);

// --- User Collections ---
export const userCollectionsAtom = atomWithStorage<UserCollection[]>(STORAGE_KEYS.libraryCollections, []);

// FIX: Modified atom to return the created collection, enabling chained actions.
export const createCollectionAtom = atom(
  null,
  (get, set, name: string): UserCollection => {
    const newCollection: UserCollection = {
      id: uuidv4(),
      name,
      itemIdentifiers: [],
      dateCreated: Date.now(),
    };
    set(userCollectionsAtom, (prev) => [...prev, newCollection].sort((a, b) => a.name.localeCompare(b.name)));
    return newCollection;
  }
);

export const deleteCollectionAtom = atom(
  null,
  (get, set, collectionId: string) => {
    set(userCollectionsAtom, (prev) => prev.filter((c) => c.id !== collectionId));
  }
);

export const addItemsToCollectionAtom = atom(
  null,
  (get, set, { collectionId, itemIds }: { collectionId: string; itemIds: string[] }) => {
    set(userCollectionsAtom, (prev) =>
      prev.map((c) => {
        if (c.id === collectionId) {
          const newIdentifiers = Array.from(new Set([...c.itemIdentifiers, ...itemIds]));
          return { ...c, itemIdentifiers: newIdentifiers };
        }
        return c;
      })
    );
  }
);

// --- Tags ---

export const allTagsAtom = atom((get) => {
    const items = get(libraryItemsAtom);
    const tags = new Set<string>();
    for (const item of items) {
        for (const tag of item.tags) {
            tags.add(tag);
        }
    }
    return Array.from(tags).sort();
});

export const addTagsToItemsAtom = atom(
  null,
  (get, set, { itemIds, tags }: { itemIds: string[], tags: string[] }) => {
    const idSet = new Set(itemIds);
    set(libraryItemsAtom, items => items.map(item => {
        if (idSet.has(item.identifier)) {
            const newTags = Array.from(new Set([...item.tags, ...tags])).sort();
            return { ...item, tags: newTags };
        }
        return item;
    }));
  }
);