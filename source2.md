# Internet Archive Explorer: Source Code Documentation (Part 2 of 2)

This document contains the application logic layer for the Internet Archive Explorer. It includes all Jotai atoms for state management, custom React hooks for reusable complex logic (like search and data fetching), utility functions for data transformation, and React Context providers.

---

## Part 4: State Management (Jotai)

### `/store/index.ts`
```typescript
// This file serves as a central hub for exporting all Jotai atoms.
// This simplifies imports in components and avoids circular dependencies.

export type { ModalState } from './app';
export { activeViewAtom, modalAtom } from './app';
export { selectedProfileAtom, profileReturnViewAtom } from './atoms';
export {
    defaultSettings,
    settingsAtom,
    setSettingAtom,
    resetSettingsAtom,
    resultsPerPageAtom,
    showExplorerHubAtom,
    defaultSortAtom,
    rememberFiltersAtom,
    layoutDensityAtom,
    disableAnimationsAtom,
    defaultUploaderDetailTabAtom,
    defaultDetailTabAllAtom,
    openLinksInNewTabAtom,
    autoplayMediaAtom,
    enableAiFeaturesAtom,
    defaultAiTabAtom,
    autoRunEntityExtractionAtom,
    summaryToneAtom,
    highContrastModeAtom,
    underlineLinksAtom,
    fontSizeAtom,
    themeAtom,
    resolvedThemeAtom,
} from './settings';
export {
    searchQueryAtom,
    profileSearchQueryAtom,
    facetsAtom,
    searchHistoryAtom,
    addSearchHistoryAtom,
    clearSearchHistoryAtom,
} from './search';
export {
    libraryItemsAtom,
    libraryItemIdentifiersAtom,
    addLibraryItemAtom,
    removeLibraryItemAtom,
    updateLibraryItemNotesAtom,
    updateLibraryItemTagsAtom,
    uploaderFavoritesAtom,
    uploaderFavoriteSetAtom,
    addUploaderFavoriteAtom,
    removeUploaderFavoriteAtom,
    userCollectionsAtom,
    createCollectionAtom,
    deleteCollectionAtom,
    updateCollectionNameAtom,
    addItemsToCollectionAtom,
    allTagsAtom,
    addTagsToItemsAtom,
    removeLibraryItemsAtom,
} from './favorites';
export {
    languageAtom,
    loadableTranslationsAtom,
} from './i18n';
export {
    worksetsAtom,
    selectedWorksetIdAtom,
    selectedDocumentIdAtom,
    createWorksetAtom,
    deleteWorksetAtom,
    updateWorksetNameAtom,
    addDocumentToWorksetAtom,
    removeDocumentFromWorksetAtom,
    updateDocumentNotesAtom,
} from './scriptorium';
export {
    myArchiveProfileAtom,
} from './archive';
export {
    aiArchiveAtom,
    allAIArchiveTagsAtom,
    addAIArchiveEntryAtom,
    deleteAIArchiveEntryAtom,
    updateAIArchiveEntryAtom,
    updateAIEntryTagsAtom
} from './aiArchive';
```

### `/store/app.ts`
```typescript
import { atom } from 'jotai';
import type { View, Profile, ArchiveItemSummary, ConfirmationOptions, ToastType } from '../types';

export type ModalState =
  | { type: 'none' }
  | { type: 'itemDetail'; item: ArchiveItemSummary }
  | { type: 'imageDetail'; item: ArchiveItemSummary }
  | { type: 'emulator'; item: ArchiveItemSummary }
  | { type: 'bookReader'; item: ArchiveItemSummary }
  | { type: 'commandPalette' }
  | { type: 'confirmation'; options: ConfirmationOptions }
  | { type: 'newCollection' }
  | { type: 'addToCollection'; itemIds: string[] }
  | { type: 'addTags'; itemIds: string[] }
  | { type: 'magicOrganize'; itemIds: string[] };

/**
 * Represents the currently active main view/page of the application.
 */
export const activeViewAtom = atom<View>('explore');

/**
 * Controls the currently displayed modal. Set to '{ type: "none" }' to close.
 */
export const modalAtom = atom<ModalState>({ type: 'none' });
```

### `/store/atoms.ts`
```typescript
import { atom } from 'jotai';
import type { Profile, View, ToastType } from '../types';

/**
 * Holds the profile data for the currently viewed uploader or creator.
 * This atom is placed here to avoid circular dependencies between `store/app` and other stores.
 */
// Fix: Use `atom(null as ...)` pattern for better type inference of writable atoms.
export const selectedProfileAtom = atom(null as Profile | null);


/**
 * Stores the view to return to after closing a profile page.
 * This atom is placed here to avoid circular dependencies.
 */
// Fix: Use `atom(undefined as ...)` pattern for better type inference of writable atoms.
export const profileReturnViewAtom = atom(undefined as View | undefined);

/**
 * A vehicle atom to trigger toasts from anywhere in the app.
 * The ToastBridge component listens to this atom, displays the toast via context,
 * and then resets the atom to null.
 * Placed here to avoid circular dependencies, as many stores need to trigger toasts.
 */
export type ToastUpdate = { message: string; type: ToastType } | null;
// Fix: Use `atom(null as ...)` pattern for better type inference of writable atoms.
export const toastAtom = atom(null as ToastUpdate);

/**
 * These AI Archive atoms are used by the AIArchiveView (for UI state) and also
 * by persistence services when deleting an entry, which could cause circular dependencies
 * if they were in the same file as the main `aiArchiveAtom`.
 */
// Fix: Use `atom(null as ...)` pattern for better type inference of writable atoms.
export const selectedAIEntryIdAtom = atom(null as string | null);
export const aiArchiveSearchQueryAtom = atom('');
```

### `/store/settings.ts`
```typescript
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { safeAtomWithStorage } from './safeStorage';
import type { AppSettings, Theme, AccentColor } from '../types';

export const STORAGE_KEYS = {
    settings: 'app-settings-v2',
    theme: 'app-theme',
};

// --- Settings ---
export const defaultSettings: AppSettings = {
    // Search & Discovery
    resultsPerPage: 24,
    showExplorerHub: true,
    defaultSort: 'downloads',
    rememberFilters: false,
    rememberSort: false,
    
    // Appearance
    layoutDensity: 'comfortable',
    disableAnimations: false,
    accentColor: 'cyan',

    // Content & Hubs
    defaultView: 'explore',
    defaultUploaderDetailTab: 'uploads',
    defaultDetailTabAll: 'description',
    openLinksInNewTab: false,
    autoplayMedia: false,

    // AI Features
    enableAiFeatures: true,
    autoArchiveAI: true,
    defaultAiTab: 'description',
    autoRunEntityExtraction: false,
    summaryTone: 'detailed',

    // Accessibility
    highContrastMode: false,
    underlineLinks: false,
    fontSize: 'base',
    scrollbarColor: '#22d3ee', // Corresponds to Tailwind's cyan-400
};

export const settingsAtom = safeAtomWithStorage<AppSettings>(STORAGE_KEYS.settings, defaultSettings);

// Write-only atom to update a single setting
export const setSettingAtom = atom(
    null,
    (get, set, { key, value }: { key: keyof AppSettings; value: AppSettings[keyof AppSettings] }) => {
        const currentSettings = get(settingsAtom);
        set(settingsAtom, { ...currentSettings, [key]: value });
    }
);

// Write-only atom to reset all settings
export const resetSettingsAtom = atom(null, (get, set) => {
    set(settingsAtom, defaultSettings);
});

// --- Selected Atoms for Performance ---
// By using selectAtom, components will only re-render when the specific value they depend on changes.
export const resultsPerPageAtom = selectAtom(settingsAtom, s => s.resultsPerPage);
export const showExplorerHubAtom = selectAtom(settingsAtom, s => s.showExplorerHub);
export const defaultSortAtom = selectAtom(settingsAtom, s => s.defaultSort);
export const rememberFiltersAtom = selectAtom(settingsAtom, s => s.rememberFilters);
export const rememberSortAtom = selectAtom(settingsAtom, s => s.rememberSort);

export const layoutDensityAtom = selectAtom(settingsAtom, s => s.layoutDensity);
export const disableAnimationsAtom = selectAtom(settingsAtom, s => s.disableAnimations);
export const accentColorAtom = selectAtom(settingsAtom, s => s.accentColor);

export const defaultViewAtom = selectAtom(settingsAtom, s => s.defaultView);
export const defaultUploaderDetailTabAtom = selectAtom(settingsAtom, s => s.defaultUploaderDetailTab);
export const defaultDetailTabAllAtom = selectAtom(settingsAtom, s => s.defaultDetailTabAll);
export const openLinksInNewTabAtom = selectAtom(settingsAtom, s => s.openLinksInNewTab);
export const autoplayMediaAtom = selectAtom(settingsAtom, s => s.autoplayMedia);

export const enableAiFeaturesAtom = selectAtom(settingsAtom, s => s.enableAiFeatures);
export const autoArchiveAIAtom = selectAtom(settingsAtom, s => s.autoArchiveAI);
export const defaultAiTabAtom = selectAtom(settingsAtom, s => s.defaultAiTab);
export const autoRunEntityExtractionAtom = selectAtom(settingsAtom, s => s.autoRunEntityExtraction);
export const summaryToneAtom = selectAtom(settingsAtom, s => s.summaryTone);

export const highContrastModeAtom = selectAtom(settingsAtom, s => s.highContrastMode);
export const underlineLinksAtom = selectAtom(settingsAtom, s => s.underlineLinks);
export const fontSizeAtom = selectAtom(settingsAtom, s => s.fontSize);
export const scrollbarColorAtom = selectAtom(settingsAtom, s => s.scrollbarColor);


// --- Theme ---
export const themeAtom = safeAtomWithStorage<Theme>(STORAGE_KEYS.theme, 'system');

const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const systemThemeAtom = atom<'light' | 'dark'>(systemThemeQuery.matches ? 'dark' : 'light');
systemThemeAtom.onMount = (setAtom) => {
    const listener = () => setAtom(systemThemeQuery.matches ? 'dark' : 'light');
    systemThemeQuery.addEventListener('change', listener);
    return () => systemThemeQuery.removeEventListener('change', listener);
};

export const resolvedThemeAtom = atom<'light' | 'dark'>((get) => {
  const theme = get(themeAtom);
  return theme === 'system' ? get(systemThemeAtom) : theme;
});
```

### `/store/search.ts`
```typescript
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
```

### `/store/favorites.ts`
```typescript
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
    // FIX: Explicitly type `items` as `LibraryItem[]` to ensure type safety.
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
```

### `/store/scriptorium.ts`
```typescript
import { atom } from 'jotai';
import { safeAtomWithStorage } from './safeStorage';
import { v4 as uuidv4 } from 'uuid';
import type { Workset, WorksetDocument, ArchiveItemSummary } from '../types';
import { toastAtom } from './atoms';

export const STORAGE_KEY = 'scriptorium-worksets-v2';

// --- Base State Atom ---
export const worksetsAtom = safeAtomWithStorage<Workset[]>(STORAGE_KEY, []);

// --- UI State Atoms ---
export const selectedWorksetIdAtom = safeAtomWithStorage<string | null>('scriptorium-selected-workset-id', null);
export const selectedDocumentIdAtom = safeAtomWithStorage<string | null>('scriptorium-selected-document-id', null);


// --- Write-only Action Atoms ---

export const createWorksetAtom = atom(
    null,
    (get, set, name: string): Workset => {
        const newWorkset: Workset = {
            id: uuidv4(),
            name,
            documents: [],
        };
        const currentWorksets = get(worksetsAtom);
        set(worksetsAtom, [...currentWorksets, newWorkset]);
        set(toastAtom, { type: 'success', message: `Workset '${name}' created!` });
        return newWorkset;
    }
);

export const deleteWorksetAtom = atom(
    null,
    (get, set, id: string) => {
        const worksets = get(worksetsAtom);
        const worksetName = worksets.find(ws => ws.id === id)?.name || '';
        const newWorksets = worksets.filter(ws => ws.id !== id);
        set(worksetsAtom, newWorksets);
        set(toastAtom, { type: 'info', message: `Workset '${worksetName}' deleted.` });
    }
);

export const updateWorksetNameAtom = atom(
    null,
    (get, set, { id, newName }: { id: string, newName: string }) => {
        set(worksetsAtom, worksets =>
            worksets.map(ws => (ws.id === id ? { ...ws, name: newName } : ws))
        );
    }
);

export const addDocumentToWorksetAtom = atom(
    null,
    (get, set, { worksetId, item }: { worksetId: string, item: ArchiveItemSummary }) => {
        const worksets = get(worksetsAtom);
        let documentExists = false;
        const newWorksets = worksets.map(ws => {
            if (ws.id === worksetId) {
                if (ws.documents.some(doc => doc.identifier === item.identifier)) {
                    documentExists = true;
                    return ws;
                }
                const newDocument: WorksetDocument = { ...item, notes: '', worksetId };
                return { ...ws, documents: [...ws.documents, newDocument] };
            }
            return ws;
        });

        if (documentExists) {
            set(toastAtom, { type: 'info', message: 'Document is already in this workset.' });
        } else {
            set(worksetsAtom, newWorksets);
            set(toastAtom, { type: 'success', message: 'Document added to workset.' });
        }
    }
);

export const removeDocumentFromWorksetAtom = atom(
    null,
    (get, set, { worksetId, documentId }: { worksetId: string, documentId: string }) => {
        set(worksetsAtom, worksets =>
            worksets.map(ws => {
                if (ws.id === worksetId) {
                    return { ...ws, documents: ws.documents.filter(doc => doc.identifier !== documentId) };
                }
                return ws;
            })
        );
        set(toastAtom, { type: 'info', message: 'Document removed from workset.' });
    }
);

export const updateDocumentNotesAtom = atom(
    null,
    (get, set, { worksetId, documentId, notes }: { worksetId: string, documentId: string, notes: string }) => {
        set(worksetsAtom, worksets =>
            worksets.map(ws => {
                if (ws.id === worksetId) {
                    return {
                        ...ws,
                        documents: ws.documents.map(doc =>
                            doc.identifier === documentId ? { ...doc, notes } : doc
                        )
                    };
                }
                return ws;
            })
        );
    }
);

export const clearScriptoriumAtom = atom(null, (get, set) => {
    set(worksetsAtom, []);
});
```

### `/store/aiArchive.ts`
```typescript
import { atom } from 'jotai';
import { safeAtomWithStorage } from './safeStorage';
import type { AIArchiveEntry } from '../types';
import { selectedAIEntryIdAtom } from './atoms';

export const STORAGE_KEY = 'ai-archive-v1';

// Base state atom
export const aiArchiveAtom = safeAtomWithStorage<AIArchiveEntry[]>(STORAGE_KEY, []);

// Derived read-only atoms
export const allAIArchiveTagsAtom = atom(get => {
    const entries = get(aiArchiveAtom);
    const tags = new Set<string>();
    entries.forEach(entry => {
        entry.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
});

// Write-only action atoms
export const addAIArchiveEntryAtom = atom(
    null,
    (get, set, newEntry: AIArchiveEntry) => {
        const currentArchive = get(aiArchiveAtom);
        set(aiArchiveAtom, [newEntry, ...currentArchive]);
    }
);

export const deleteAIArchiveEntryAtom = atom(
    null,
    (get, set, entryId: string) => {
        set(aiArchiveAtom, archive => archive.filter(entry => entry.id !== entryId));
        if (get(selectedAIEntryIdAtom) === entryId) {
            set(selectedAIEntryIdAtom, null);
        }
    }
);

export const updateAIArchiveEntryAtom = atom(
    null,
    (get, set, updatedEntry: AIArchiveEntry) => {
        set(aiArchiveAtom, archive => archive.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
    }
);

export const updateAIEntryTagsAtom = atom(
    null,
    (get, set, { id, tags }: { id: string; tags: string[] }) => {
        set(aiArchiveAtom, archive =>
            archive.map(entry =>
                entry.id === id ? { ...entry, tags: [...new Set(tags)].sort() } : entry
            )
        );
    }
);

export const clearAIArchiveAtom = atom(null, (get, set) => {
    set(aiArchiveAtom, []);
});
```

### `/store/archive.ts`
```typescript
import { safeAtomWithStorage } from './safeStorage';
import type { Profile } from '../types';
import { atom } from 'jotai';

export const myArchiveProfileAtom = safeAtomWithStorage<Profile | null>('archive-user-profile-v1', null);

export const disconnectMyArchiveAtom = atom(null, (get, set) => {
    set(myArchiveProfileAtom, null);
});
```

### `/store/i18n.ts`
```typescript
import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { safeAtomWithStorage } from './safeStorage';
import type { Language } from '../types';

export const STORAGE_KEYS = {
    language: 'app-language',
};

// --- Language & Translations ---
export const languageAtom = safeAtomWithStorage<Language>(STORAGE_KEYS.language, 'en');

const NAMESPACES = [
  'common', 'header', 'sideMenu', 'bottomNav', 'explorer', 'searchPopover', 
  'itemCard', 'recRoom', 'imagesHub', 'videothek', 'audiothek', 
  'scriptorium', 'favorites', 'uploaderProfileCard', 'uploaderDetail', 
  'reviewCard', 'modals', 'aiTools', 'settings', 'help', 
  'commandPalette', 'uploaders', 'storyteller', 'webArchive', 'myArchive',
  'uploaderHub', 'aiArchive'
];
const translationsCache = new Map<Language, Record<string, any>>();

const languageTranslationsAtom = atom(async (get) => {
    const lang = get(languageAtom);
    if (translationsCache.has(lang)) {
        return translationsCache.get(lang)!;
    }

    const fetchNamespace = async (ns: string, language: Language): Promise<[string, any]> => {
        try {
            const res = await fetch(`/locales/${language}/${ns}.json`);
            if (!res.ok) throw new Error(`Namespace fetch failed with status ${res.status}`);
            return [ns, await res.json()];
        } catch (error) {
            console.warn(`Could not load '${ns}' for '${language}', falling back to 'en'.`);
            if (language !== 'en') {
                const fallbackRes = await fetch(`/locales/en/${ns}.json`);
                if (!fallbackRes.ok) throw new Error(`Fallback namespace '${ns}' for 'en' failed.`);
                return [ns, await fallbackRes.json()];
            }
            throw error;
        }
    };
    
    const results = await Promise.all(NAMESPACES.map(ns => fetchNamespace(ns, lang)));
    const combined = Object.fromEntries(results);

    translationsCache.set(lang, combined);
    return combined;
});

export const loadableTranslationsAtom = loadable(languageTranslationsAtom);
```

### `/store/safeStorage.ts`
```typescript
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
const safeStorage = {
  // Fix: Using `any` instead of `unknown` to prevent the atom's value from being inferred as `unknown`, which caused cascading type errors.
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
  // Fix: Using `any` instead of `unknown` to match the `getItem` signature and ensure type compatibility.
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
  // By explicitly providing the typed storage object, we ensure jotai treats 
  // this as a synchronous storage, giving us correct types for our atoms.
  return atomWithStorage(key, initialValue, safeStorage as SyncStorage<Value>);
}
```

### `/store/toast.ts`
```typescript
/**
 * This file is deprecated. All atom definitions have been moved to prevent
 * circular dependency issues. Please import from 'store/atoms' or other
 * specific store files.
 */
```
---

## Part 5: Reusable Logic (Hooks, Utils, Contexts)

### `/hooks/useArchivalItems.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary } from '../types';
import { searchArchive } from '../services/archiveService';

/**
 * A reusable hook to fetch a list of archival items for carousels or other displays.
 * @param query The search query for the Internet Archive API.
 * @param limit The number of items to fetch.
 * @returns An object containing the items, loading state, and error state.
 */
export const useArchivalItems = (query: string, limit: number = 15) => {
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        if (!query) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Fetch top `limit` most downloaded items matching the query
            const data = await searchArchive(query, 1, ['-downloads'], undefined, limit);
            setItems(data.response?.docs || []);
        } catch (err) {
            console.error(`Failed to fetch archival items for query: ${query}`, err);
            setError('Failed to fetch items.');
        } finally {
            setIsLoading(false);
        }
    }, [query, limit]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return { items, isLoading, error, refetch: fetchItems };
};
```

### `/hooks/useCommands.ts`
```typescript
import React, { useMemo } from 'react';
import { useLanguage } from './useLanguage';
import { useAtom, useAtomValue } from 'jotai';
import { themeAtom } from '../store/settings';
import { languageAtom } from '../store/i18n';
import type { Command, View } from '../types';
import {
  CompassIcon, StarIcon, BookIcon, MovieIcon, AudioIcon, ImageIcon, UsersIcon,
  JoystickIcon, SettingsIcon, HelpIcon, SunIcon, MoonIcon, LanguageIcon, WebIcon, BrainIcon
} from '../components/Icons';
import { resolvedThemeAtom } from '../store/settings';

interface CommandActions {
  navigateTo: (view: View) => void;
  globalSearch: (query: string) => void;
}

export const useCommands = (actions: CommandActions): Command[] => {
  const { t } = useLanguage();
  const [theme, setTheme] = useAtom(themeAtom);
  const [language, setLanguage] = useAtom(languageAtom);
  const resolvedTheme = useAtomValue(resolvedThemeAtom);

  const commands = useMemo(() => {
    const iconClass = "w-5 h-5 text-gray-400";

    const navigationCommands: Command[] = [
      { id: 'nav-explore', section: t('commandPalette:sections.navigation'), label: t('sideMenu:explore'), description: t('commandPalette:nav.exploreDesc'), icon: React.createElement(CompassIcon, { className: iconClass }), action: () => actions.navigateTo('explore'), keywords: 'home main discover search' },
      { id: 'nav-library', section: t('commandPalette:sections.navigation'), label: t('sideMenu:library'), description: t('commandPalette:nav.libraryDesc'), icon: React.createElement(StarIcon, { className: iconClass }), action: () => actions.navigateTo('library'), keywords: 'saved bookmarks favorites' },
      { id: 'nav-scriptorium', section: t('commandPalette:sections.navigation'), label: t('sideMenu:scriptorium'), description: t('commandPalette:nav.scriptoriumDesc'), icon: React.createElement(BookIcon, { className: iconClass }), action: () => actions.navigateTo('scriptorium'), keywords: 'books texts documents' },
      { id: 'nav-videothek', section: t('commandPalette:sections.navigation'), label: t('sideMenu:videothek'), description: t('commandPalette:nav.videothekDesc'), icon: React.createElement(MovieIcon, { className: iconClass }), action: () => actions.navigateTo('movies'), keywords: 'video film' },
      { id: 'nav-audiothek', section: t('commandPalette:sections.navigation'), label: t('sideMenu:audiothek'), description: t('commandPalette:nav.audiothekDesc'), icon: React.createElement(AudioIcon, { className: iconClass }), action: () => actions.navigateTo('audio'), keywords: 'music sound' },
      { id: 'nav-images', section: t('commandPalette:sections.navigation'), label: t('sideMenu:imagesHub'), description: t('commandPalette:nav.imagesDesc'), icon: React.createElement(ImageIcon, { className: iconClass }), action: () => actions.navigateTo('image'), keywords: 'pictures photos' },
      { id: 'nav-recroom', section: t('commandPalette:sections.navigation'), label: t('sideMenu:recRoom'), description: t('commandPalette:nav.recroomDesc'), icon: React.createElement(JoystickIcon, { className: iconClass }), action: () => actions.navigateTo('recroom'), keywords: 'games software dos' },
      { id: 'nav-ai-archive', section: t('commandPalette:sections.navigation'), label: t('sideMenu:aiArchive'), description: t('commandPalette:nav.aiArchiveDesc'), icon: React.createElement(BrainIcon, { className: iconClass }), action: () => actions.navigateTo('aiArchive'), keywords: 'ai artificial intelligence generations' },
      { id: 'nav-webarchive', section: t('commandPalette:sections.navigation'), label: t('sideMenu:webArchive'), description: t('commandPalette:nav.webArchiveDesc'), icon: React.createElement(WebIcon, { className: iconClass }), action: () => window.open('https://web.archive.org/', '_blank'), keywords: 'wayback machine websites history' },
      { id: 'nav-settings', section: t('commandPalette:sections.navigation'), label: t('sideMenu:settings'), description: t('commandPalette:nav.settingsDesc'), icon: React.createElement(SettingsIcon, { className: iconClass }), action: () => actions.navigateTo('settings'), keywords: 'options config' },
      { id: 'nav-help', section: t('commandPalette:sections.navigation'), label: t('sideMenu:help'), description: t('commandPalette:nav.helpDesc'), icon: React.createElement(HelpIcon, { className: iconClass }), action: () => actions.navigateTo('help'), keywords: 'faq support' },
    ];

    const actionCommands: Command[] = [
      { id: 'action-theme', section: t('commandPalette:sections.actions'), label: t('commandPalette:actions.toggleTheme'), description: t('commandPalette:actions.toggleThemeDesc'), icon: resolvedTheme === 'dark' ? React.createElement(SunIcon, { className: iconClass }) : React.createElement(MoonIcon, { className: iconClass }), action: () => setTheme(resolvedTheme === 'light' ? 'dark' : 'light'), keywords: 'dark light mode appearance' },
      { id: 'action-language', section: t('commandPalette:sections.actions'), label: t('commandPalette:actions.toggleLanguage'), description: t('commandPalette:actions.toggleLanguageDesc'), icon: React.createElement(LanguageIcon, { className: iconClass }), action: () => setLanguage(language === 'en' ? 'de' : 'en'), keywords: 'german english sprache' },
    ];
    
    return [...navigationCommands, ...actionCommands];

  }, [t, resolvedTheme, language, actions, setLanguage, setTheme]);

  return commands;
};
```

### `/hooks/useDebounce.ts`
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T,>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### `/hooks/useExplorerSearch.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { searchQueryAtom, facetsAtom } from '../store/search';
import { useDebounce } from './useDebounce';
import { searchArchive } from '../services/archiveService';
import type { ArchiveItemSummary } from '../types';
import { useInfiniteScroll } from './useInfiniteScroll';
import { useLanguage } from '../hooks/useLanguage';
import { buildArchiveQuery } from '../utils/queryBuilder';

export const useExplorerSearch = () => {
  const [searchQuery] = useAtom(searchQueryAtom);
  const [facets] = useAtom(facetsAtom);
  const debouncedQuery = useDebounce(searchQuery, 400);

  const [results, setResults] = useState<ArchiveItemSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true); // New state to explicitly control infinite scroll
  const { t } = useLanguage();

  const performSearch = useCallback(async (query: string, searchPage: number) => {
    if (searchPage === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const finalQuery = query || 'featured';
      const sorts = finalQuery === 'featured' ? [] : ['-publicdate'];
      const data = await searchArchive(finalQuery, searchPage, sorts);
      if (data && data.response && Array.isArray(data.response.docs)) {
        const newDocs = data.response.docs;
        setTotalResults(data.response.numFound);

        if (newDocs.length === 0) {
          setHasMore(false);
        } else {
          setResults(prev => {
            const currentResults = searchPage === 1 ? [] : prev;
            const existingIds = new Set(currentResults.map(item => item.identifier));
            const uniqueNewDocs = newDocs.filter(item => !existingIds.has(item.identifier));
            const combinedResults = [...currentResults, ...uniqueNewDocs];
            
            setHasMore(combinedResults.length < data.response.numFound);
            return combinedResults;
          });
        }
      } else {
        setTotalResults(0);
        setResults(prev => (searchPage === 1 ? [] : prev));
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common:error'));
      setHasMore(false); // Stop fetching on error
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [t]);

  useEffect(() => {
    setPage(1);
    setHasMore(true); // Reset for new search
    const query = buildArchiveQuery({ text: debouncedQuery, facets });
    performSearch(query, 1);
  }, [debouncedQuery, facets, performSearch]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return; // Guard against unnecessary calls
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(buildArchiveQuery({ text: debouncedQuery, facets }), nextPage);
  }, [isLoading, isLoadingMore, hasMore, page, debouncedQuery, facets, performSearch]);
  
  const handleRetry = useCallback(() => {
      setPage(1);
      setHasMore(true); // Reset for retry
      performSearch(buildArchiveQuery({ text: debouncedQuery, facets }), 1);
  }, [debouncedQuery, facets, performSearch]);
  
  const lastElementRef = useInfiniteScroll({
      isLoading: isLoadingMore,
      hasMore,
      onLoadMore: handleLoadMore,
      rootMargin: '400px'
  });

  return { results, isLoading, isLoadingMore, error, totalResults, hasMore, lastElementRef, handleRetry };
};
```

### `/hooks/useImageViewer.ts`
```typescript
import { useState, useCallback, MouseEvent as ReactMouseEvent } from 'react';

const ZOOM_SENSITIVITY = 0.001;
const MAX_ZOOM = 10;
const MIN_ZOOM = 0.5;

interface UseImageViewerReturn {
  zoom: number;
  rotation: number;
  offset: { x: number; y: number };
  isDragging: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  reset: () => void;
  handleMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: ReactMouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  handleWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
}

export const useImageViewer = (): UseImageViewerReturn => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const clampZoom = (newZoom: number) => Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);

  const zoomIn = useCallback(() => setZoom(prev => clampZoom(prev * 1.2)), []);
  const zoomOut = useCallback(() => setZoom(prev => clampZoom(prev / 1.2)), []);

  const rotateCW = useCallback(() => setRotation(prev => (prev + 90) % 360), []);
  const rotateCCW = useCallback(() => setRotation(prev => (prev - 90 + 360) % 360), []);

  const reset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  }, [offset]);

  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const { clientX, clientY, deltaY } = e;
    const rect = e.currentTarget.getBoundingClientRect();
    
    const newZoom = clampZoom(zoom - deltaY * ZOOM_SENSITIVITY * zoom);
    
    // Calculate the mouse position relative to the image container
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Calculate the offset adjustment needed to keep the point under the cursor stationary
    const newOffsetX = x - (x - offset.x) * (newZoom / zoom);
    const newOffsetY = y - (y - offset.y) * (newZoom / zoom);

    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  }, [zoom, offset]);

  return {
    zoom,
    rotation,
    offset,
    isDragging,
    zoomIn,
    zoomOut,
    rotateCW,
    rotateCCW,
    reset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  };
};
```

### `/hooks/useInfiniteScroll.ts`
```typescript
import React, { useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
}

export const useInfiniteScroll = ({
  onLoadMore,
  isLoading,
  hasMore,
  root = null,
  rootMargin = '0px',
  threshold = 0,
}: UseInfiniteScrollOptions) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        { root, rootMargin, threshold }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore, root, rootMargin, threshold]
  );

  return lastElementRef;
};
```

### `/hooks/useItemMetadata.ts`
```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ArchiveItemSummary, ArchiveMetadata, ArchiveFile } from '../types';
import { getItemMetadata, getItemPlainText } from '../services/archiveService';
import { useAtomValue } from 'jotai';
import { defaultAiTabAtom, enableAiFeaturesAtom, autoplayMediaAtom } from '../store/settings';

export type ItemDetailTab = 'description' | 'ai' | 'files' | 'related';

const findPlayableFile = (files: ArchiveFile[], itemIdentifier: string, mediaType: 'audio' | 'video'): string | null => {
    // Prioritized list of formats for better web compatibility
    const audioFormats = ['VBR MP3', 'MP3', 'MPEG4', 'Ogg Vorbis', 'Flac'];
    const videoFormats = ['h.264', '512Kb MPEG4', 'MPEG4'];

    const targetFormats = mediaType === 'audio' ? audioFormats : videoFormats;
    
    let bestFile: ArchiveFile | undefined;

    for (const format of targetFormats) {
        // Use `endsWith` for more specific matching on common formats
        if (format === 'MP3' || format === 'MPEG4') {
             bestFile = files.find(f => f.format.endsWith(format));
        } else {
             bestFile = files.find(f => f.format.includes(format));
        }
        if (bestFile) break;
    }

    // Fallback for video: check for .mp4 extension if format matching fails
    if (!bestFile && mediaType === 'video') {
       bestFile = files.find(f => f.name.toLowerCase().endsWith('.mp4'));
    }

    if (bestFile) {
        return `https://archive.org/download/${itemIdentifier}/${encodeURIComponent(bestFile.name)}`;
    }

    return null;
}


export const useItemMetadata = (item: ArchiveItemSummary) => {
    const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const defaultAiTab = useAtomValue(defaultAiTabAtom);
    const enableAiFeatures = useAtomValue(enableAiFeaturesAtom);
    const autoplayMedia = useAtomValue(autoplayMediaAtom);

    const [activeTab, setActiveTab] = useState<ItemDetailTab>(
        item.mediatype === 'texts' && enableAiFeatures ? defaultAiTab : 'description'
    );

    // For text content
    const [plainText, setPlainText] = useState<string | null>(null);
    const [isLoadingText, setIsLoadingText] = useState(false);
    const [textError, setTextError] = useState<string | null>(null);

    // For media playback (audio & video)
    const [isPlaying, setIsPlaying] = useState(false);
    const [playableMedia, setPlayableMedia] = useState<{ url: string; type: 'audio' | 'video' } | null>(null);
    const mediaRef = useRef<HTMLMediaElement>(null);

    const fetchMetadata = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getItemMetadata(item.identifier);
            setMetadata(data);
            
            if ((item.mediatype === 'audio' || item.mediatype === 'movies') && data.files) {
                const type = item.mediatype === 'movies' ? 'video' : 'audio';
                const url = findPlayableFile(data.files, item.identifier, type);
                if (url) {
                    setPlayableMedia({ url, type });
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [item.identifier, item.mediatype]);

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    useEffect(() => {
        if (activeTab === 'ai' && item.mediatype === 'texts' && !plainText && !isLoadingText) {
            setIsLoadingText(true);
            setTextError(null);
            getItemPlainText(item.identifier)
                .then(setPlainText)
                .catch((err) => {
                    setPlainText(null);
                    const message = err instanceof Error ? err.message : 'Failed to load text content.';
                    setTextError(message);
                })
                .finally(() => setIsLoadingText(false));
        }
    }, [activeTab, item.mediatype, item.identifier, plainText, isLoadingText]);
    
    const handlePlayPause = () => {
        if (mediaRef.current) {
            if (isPlaying) {
                mediaRef.current.pause();
            } else {
                mediaRef.current.play().catch(e => console.error("Media play failed:", e));
            }
        }
    };
    
    const mediaEventListeners = {
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false),
        onEnded: () => setIsPlaying(false),
    };

    useEffect(() => {
        if (mediaRef.current && autoplayMedia && playableMedia?.url && !isPlaying) {
           // We need a small delay for the media element to be ready
            const timer = setTimeout(() => {
                handlePlayPause();
            }, 100);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playableMedia?.url, autoplayMedia]);
    
    return {
        metadata,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        plainText,
        isLoadingText,
        textError,
        isPlaying,
        playableMedia,
        mediaRef,
        handlePlayPause,
        mediaEventListeners,
        fetchMetadata,
    };
};
```

### `/hooks/useLanguage.ts`
```typescript
import { useAtom, useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { languageAtom, loadableTranslationsAtom } from '../store/i18n';
import type { Language } from '../types';

interface LanguageHook {
  language: Language;
  setLanguage: (update: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const getNestedTranslation = (obj: Record<string, any>, path: string): string | undefined => {
  return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
};

export const useLanguage = (): LanguageHook => {
    const [language, setLanguage] = useAtom(languageAtom);
    const loadableTranslations = useAtomValue(loadableTranslationsAtom);

    const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
        if (loadableTranslations.state === 'loading') return '';
        if (loadableTranslations.state === 'hasError') {
             console.error('Translation loading failed:', loadableTranslations.error);
             return key;
        }
        
        const translations = loadableTranslations.data;
        const [namespace, ...pathParts] = key.split(':');
        const path = pathParts.join('.');

        if (!namespace || !path) {
          console.warn(`Invalid translation key format: ${key}`);
          return key;
        }
        
        const namespaceTranslations = translations[namespace];
        if (!namespaceTranslations) {
            console.warn(`Translation namespace not found: ${namespace}`);
            return path.split('.').pop() || key;
        }

        let template: string | undefined;

        if (replacements && typeof replacements.count === 'number') {
          const count = replacements.count;
          const pluralKey = `${path}_${count === 1 ? 'one' : 'other'}`;
          template = getNestedTranslation(namespaceTranslations, pluralKey);
        }

        if (template === undefined) {
          template = getNestedTranslation(namespaceTranslations, path);
        }

        if (template === undefined) {
          console.warn(`Translation key not found: ${key}`);
          return path.split('.').pop() || key;
        }
        
        let result = String(template);
        if (replacements) {
            Object.entries(replacements).forEach(([placeholder, value]) => {
                const regex = new RegExp(`{{${placeholder}}}`, 'g');
                result = result.replace(regex, String(value));
            });
        }
        return result;
    }, [loadableTranslations]);

    return {
        language,
        setLanguage,
        t,
        isLoading: loadableTranslations.state === 'loading',
    };
};
```

### `/hooks/useModalFocusTrap.ts`
```typescript
import { useEffect } from 'react';

interface UseModalFocusTrapProps {
    modalRef: React.RefObject<HTMLElement>;
    isOpen: boolean;
    onClose: () => void;
}

export const useModalFocusTrap = ({ modalRef, isOpen, onClose }: UseModalFocusTrapProps) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
            if (event.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), iframe'
                );
                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (event.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        event.preventDefault();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Delay focus to allow for transitions and rendering
        const focusTimeout = setTimeout(() => {
            const firstElement = modalRef.current?.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )[0];
            firstElement?.focus();
        }, 100);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(focusTimeout);
        };
    }, [isOpen, onClose, modalRef]);
};
```

### `/hooks/useNavigation.ts`
```typescript
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { activeViewAtom } from '../store/app';
import { selectedProfileAtom, profileReturnViewAtom } from '../store/atoms';
import { UPLOADER_DATA } from '../pages/uploaderData';
import type { View, Profile } from '../types';

export const useNavigation = () => {
    const setActiveView = useSetAtom(activeViewAtom);
    const setSelectedProfile = useSetAtom(selectedProfileAtom);
    const setProfileReturnView = useSetAtom(profileReturnViewAtom);
    const currentView = useAtomValue(activeViewAtom);

    const navigateTo = useCallback((view: View) => {
        setActiveView(view);
    }, [setActiveView]);
    
    const navigateToProfile = useCallback((profile: Profile) => {
        setProfileReturnView(currentView);
        setSelectedProfile(profile);
        setActiveView('uploaderDetail');
    }, [currentView, setActiveView, setSelectedProfile, setProfileReturnView]);

    const navigateToUploader = useCallback((searchIdentifier: string) => {
        const curatedData = UPLOADER_DATA.find(u => u.searchUploader === searchIdentifier);
        const profile: Profile = {
            name: curatedData?.username || searchIdentifier.split('@')[0],
            searchIdentifier: searchIdentifier,
            type: 'uploader',
            curatedData: curatedData,
        };
        navigateToProfile(profile);
    }, [navigateToProfile]);
    
    const navigateToCreator = useCallback((creatorName: string) => {
        const profile: Profile = {
            name: creatorName,
            searchIdentifier: creatorName,
            type: 'creator',
        };
        navigateToProfile(profile);
    }, [navigateToProfile]);

    const goBackFromProfile = useCallback((returnView?: View) => {
        setSelectedProfile(null);
        setActiveView(returnView || 'explore');
    }, [setActiveView, setSelectedProfile]);

    return {
        navigateTo,
        navigateToUploader,
        navigateToCreator,
        navigateToProfile,
        goBackFromProfile
    };
};
```

### `/hooks/useSearchAndGo.ts`
```typescript
import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { activeViewAtom } from '../store/app';
import { addSearchHistoryAtom, facetsAtom, searchQueryAtom } from '../store/search';
import type { Facets } from '../types';

export const useSearchAndGo = () => {
  const setSearchQuery = useSetAtom(searchQueryAtom);
  const setFacets = useSetAtom(facetsAtom);
  const setActiveView = useSetAtom(activeViewAtom);
  const addSearchHistory = useSetAtom(addSearchHistoryAtom);

  return useCallback((query: string, newFacets?: Partial<Facets>) => {
     setSearchQuery(query);
     addSearchHistory(query);
     const defaultFacets: Facets = {
        mediaType: new Set(),
        availability: 'all',
     };
     setFacets({ ...defaultFacets, ...newFacets });
     setActiveView('explore');
  }, [setSearchQuery, addSearchHistory, setFacets, setActiveView]);
};
```

### `/hooks/useUploaderStats.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import type { UploaderStats, Profile } from '../types';
import { getItemCount } from '../services/archiveService';
import { getProfileApiQuery } from '../utils/profileUtils';

export const useUploaderStats = (profile: Profile) => {
    const [stats, setStats] = useState<UploaderStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const baseQuery = getProfileApiQuery(profile);
            const username = profile.searchIdentifier.split('@')[0];

            const mediaTypes: (keyof Pick<UploaderStats, 'movies' | 'audio' | 'texts' | 'image' | 'software'>)[] = ['movies', 'audio', 'texts', 'image', 'software'];
            
            const promises: Promise<number>[] = [
                getItemCount(baseQuery), // Total
                ...mediaTypes.map(type => getItemCount(`${baseQuery} AND mediatype:${type}`)),
                getItemCount(`uploader:("${profile.searchIdentifier}") AND mediatype:collection`), // Collections
                getItemCount(`collection:(fav-${username})`), // Favorites
                getItemCount(`reviewer:("${profile.searchIdentifier}")`), // Reviews
            ];

            const results = await Promise.all(promises);
            
            const [total, movies, audio, texts, image, software, collections, favorites, reviews] = results;

            setStats({ total, movies, audio, texts, image, software, collections, favorites, reviews });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stats');
        } finally {
            setIsLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, error, refetch: fetchStats };
};
```

### `/hooks/useUploaderTabCounts.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import type { Profile, UploaderTab } from '../types';
import { getItemCount } from '../services/archiveService';

const getPostsQuery = (profile: Profile) => `creator:("${profile.searchIdentifier}") AND mediatype:(texts) AND collection:(archiveteam_newsposts)`;
const getWebArchiveQuery = (profile: Profile) => `uploader:("${profile.searchIdentifier}") AND mediatype:(web)`;
const getReviewsQuery = (profile: Profile) => `reviewer:("${profile.searchIdentifier}")`;


export const useUploaderTabCounts = (profile: Profile) => {
    const [visibleTabs, setVisibleTabs] = useState<UploaderTab[]>(['uploads', 'collections']);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCounts = useCallback(async () => {
        setIsLoading(true);
        const baseTabs: UploaderTab[] = ['uploads', 'collections'];
        if (profile.type === 'uploader') {
            baseTabs.push('favorites');
        }

        try {
            const counts = await Promise.all([
                getItemCount(getReviewsQuery(profile)),
                getItemCount(getPostsQuery(profile)),
                getItemCount(getWebArchiveQuery(profile)),
            ]);
            
            const [reviewsCount, postsCount, webArchiveCount] = counts;

            const dynamicTabs: UploaderTab[] = [];
            if (reviewsCount > 0) dynamicTabs.push('reviews');
            if (postsCount > 0) dynamicTabs.push('posts');
            if (webArchiveCount > 0) dynamicTabs.push('webArchive');

            setVisibleTabs([...baseTabs, ...dynamicTabs]);
        } catch (error) {
            console.error("Failed to fetch uploader tab counts", error);
            setVisibleTabs(baseTabs); // Fallback to base tabs on error
        } finally {
            setIsLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    return { visibleTabs, isLoading };
};
```

### `/hooks/useUploaderUploads.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { profileSearchQueryAtom } from '../store/search';
import { resultsPerPageAtom } from '../store/settings';
import { useDebounce } from './useDebounce';
import { searchArchive } from '../services/archiveService';
import type { ArchiveItemSummary, Profile, MediaType, Facets } from '../types';
import { useInfiniteScroll } from './useInfiniteScroll';
import { getProfileApiQuery } from '../utils/profileUtils';
import { buildArchiveQuery } from '../utils/queryBuilder';

export const useUploaderUploads = (profile: Profile, mediaTypeFilter: MediaType | 'all') => {
    const resultsPerPage = useAtomValue(resultsPerPageAtom);
    const searchQuery = useAtomValue(profileSearchQueryAtom);
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const [results, setResults] = useState<ArchiveItemSummary[]>([]);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [sort, setSort] = useState('downloads');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const toggleSortDirection = () => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');

    const buildQuery = useCallback(() => {
        const baseQuery = getProfileApiQuery(profile);
        const facets: Partial<Facets> = {
            mediaType: mediaTypeFilter === 'all' ? new Set() : new Set([mediaTypeFilter])
        };
        return buildArchiveQuery({ base: baseQuery, text: debouncedSearchQuery, facets });
    }, [profile, mediaTypeFilter, debouncedSearchQuery]);

    const performSearch = useCallback(async (query: string, searchPage: number, currentSort: string, currentSortDir: 'asc' | 'desc') => {
        if (searchPage === 1) setIsLoading(true); else setIsLoadingMore(true);
        setError(null);

        const sortParam = `${currentSortDir === 'desc' ? '-' : ''}${currentSort}`;

        try {
            const data = await searchArchive(query, searchPage, [sortParam], undefined, resultsPerPage);
            if (data?.response) {
                setTotalResults(data.response.numFound);
                setResults(prev => searchPage === 1 ? data.response.docs : [...prev, ...data.response.docs]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [resultsPerPage]);
    
    // Reset and fetch on filter/sort/profile change
    useEffect(() => {
        setPage(1);
        const query = buildQuery();
        performSearch(query, 1, sort, sortDirection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile, debouncedSearchQuery, mediaTypeFilter, sort, sortDirection, buildQuery]);

    const handleLoadMore = useCallback(() => {
        if (isLoading || isLoadingMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        performSearch(buildQuery(), nextPage, sort, sortDirection);
    }, [isLoading, isLoadingMore, page, buildQuery, sort, sortDirection, performSearch]);

    const handleRetry = useCallback(() => {
        setPage(1);
        performSearch(buildQuery(), 1, sort, sortDirection);
    }, [buildQuery, sort, sortDirection, performSearch]);

    const hasMore = !isLoading && results.length < totalResults;
    const lastElementRef = useInfiniteScroll({
        isLoading: isLoadingMore,
        hasMore,
        onLoadMore: handleLoadMore,
        rootMargin: '400px'
    });

    return {
        results,
        isLoading,
        isLoadingMore,
        error,
        totalResults,
        hasMore,
        lastElementRef,
        handleRetry,
        sort,
        setSort,
        sortDirection,
        toggleSortDirection,
    };
};
```

### `/hooks/useWorksets.ts`
```typescript
import { useAtomValue, useSetAtom } from 'jotai';
import { 
    worksetsAtom, 
    createWorksetAtom, 
    deleteWorksetAtom, 
    updateWorksetNameAtom, 
    addDocumentToWorksetAtom, 
    removeDocumentFromWorksetAtom, 
    updateDocumentNotesAtom 
} from '../store/scriptorium';
import { useEffect, useState } from 'react';

// This hook now serves as a convenient facade for interacting with the Scriptorium Jotai atoms.
// Components can use this single hook to get all the necessary functions and state,
// while the logic itself lives within the Jotai atoms.
export const useWorksets = () => {
  const [isLoading, setIsLoading] = useState(true);
  const worksets = useAtomValue(worksetsAtom);
  
  // Setters for all the actions
  const createWorkset = useSetAtom(createWorksetAtom);
  const deleteWorkset = useSetAtom(deleteWorksetAtom);
  const updateWorksetName = useSetAtom(updateWorksetNameAtom);
  const addDocumentToWorkset = useSetAtom(addDocumentToWorksetAtom);
  const removeDocumentFromWorkset = useSetAtom(removeDocumentFromWorksetAtom);
  const updateDocumentNotes = useSetAtom(updateDocumentNotesAtom);

  // The atomWithStorage is synchronous on read, but we keep this async-like
  // `isLoading` flag for a brief moment to prevent flashes of content
  // on initial hydration, maintaining consistency with the previous hook's behavior.
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  return {
    worksets,
    isLoading,
    createWorkset,
    deleteWorkset,
    updateWorksetName,
    addDocumentToWorkset,
    removeDocumentFromWorkset,
    updateDocumentNotes,
  };
};
```

### `/utils/formatter.ts`
```typescript
export const formatBytes = (bytesStr?: string, decimals = 2): string => {
    const bytes = Number(bytesStr);
    if (!bytes || isNaN(bytes) || bytes === 0) return 'N/A';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Formats a number into a compact, human-readable string (e.g., 1200 -> '1.2k').
 * @param num The number to format.
 * @returns A formatted string.
 */
export const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return '0';
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

/**
 * Formats an identifier (like an email or a name) for display.
 * If it's an email, it returns the part before the '@'.
 * Otherwise, it returns the original string.
 * @param identifier The identifier string to format.
 * @returns A display-friendly version of the identifier.
 */
export const formatIdentifierForDisplay = (identifier: string): string => {
  if (identifier.includes('@')) {
    return identifier.split('@')[0];
  }
  return identifier;
};
```

### `/utils/imageUtils.ts`
```typescript
import type { ArchiveFile } from '../types';

/**
 * A list of preferred image formats for web display, ordered by preference.
 */
const PREFERRED_FORMATS = ['PNG', 'JPEG', 'Single Page Processed JP2 ZIP', 'GIF'];

/**
 * Finds the best-quality, web-compatible image URL from a list of files for an Internet Archive item.
 *
 * @param files - The array of file objects from the item's metadata.
 * @param identifier - The identifier of the Internet Archive item.
 * @returns The full URL to the best image file, or null if no suitable file is found.
 */
export const findBestImageUrl = (files: ArchiveFile[], identifier: string): string | null => {
  if (!files || files.length === 0) {
    return null;
  }

  let bestFile: ArchiveFile | null = null;

  // First pass: Look for preferred formats, excluding thumbnails.
  for (const format of PREFERRED_FORMATS) {
    const foundFile = files.find(f => f.format === format && !f.name.toLowerCase().includes('thumb'));
    if (foundFile) {
      bestFile = foundFile;
      break;
    }
  }

  // Second pass (fallback): If no preferred format is found, take the largest JPG or PNG file.
  if (!bestFile) {
    const imageFiles = files
      .filter(f => 
        (f.format.toLowerCase().includes('jpeg') || f.format.toLowerCase().includes('png')) &&
        !f.name.toLowerCase().includes('thumb') &&
        f.size
      )
      .sort((a, b) => Number(b.size!) - Number(a.size!));

    if (imageFiles.length > 0) {
      bestFile = imageFiles[0];
    }
  }

  // Final fallback: Use the item's main image service if all else fails.
  if (!bestFile && files.some(f => f.format === 'Item Image')) {
     return `https://archive.org/services/get-item-image.php?identifier=${identifier}`;
  }
  
  if (bestFile) {
      return `https://archive.org/download/${identifier}/${encodeURIComponent(bestFile.name)}`;
  }

  return null;
};


/**
 * Fetches an image from a URL and converts it to a base64 string.
 * @param imageUrl The URL of the image to fetch.
 * @returns A promise that resolves to an object containing the base64 string and MIME type.
 */
export const urlToBase64 = async (imageUrl: string): Promise<{ base64: string; mimeType: string }> => {
    // AI Studio provides a CORS proxy, which is necessary for fetching images from archive.org
    const proxyUrl = `/proxy?url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            if (base64String) {
                resolve({ base64: base64String, mimeType });
            } else {
                reject(new Error('Failed to convert blob to base64'));
            }
        };
        reader.readAsDataURL(blob);
    });
};
```

### `/utils/profileUtils.ts`
```typescript
import type { Profile } from '../types';

/**
 * Constructs the correct API query string for a given profile.
 * This version is designed to be robust against metadata inconsistencies
 * by searching for both the display name and the specific search identifier
 * in the relevant fields.
 *
 * @param profile The profile object for the uploader or creator.
 * @returns A string formatted for the Internet Archive API 'q' parameter.
 */
export const getProfileApiQuery = (profile: Profile): string => {
    const searchId = profile.searchIdentifier.replace(/"/g, '\\"');
    const displayName = profile.name.replace(/"/g, '\\"');

    // Handle curated profiles with a specific override search field (e.g., 'scanner')
    if (profile.curatedData?.searchField) {
        return `${profile.curatedData.searchField}:("${searchId}")`;
    }
    
    // For 'creator' profiles, the search is simpler as name and identifier are the same.
    if (profile.type === 'creator') {
         return `creator:("${searchId}")`;
    }

    // For 'uploader' profiles, build a comprehensive query to find all associated items.
    if (profile.type === 'uploader') {
        const queries = new Set<string>();

        // 1. Search for the display name/screenname in the `creator` field.
        // (e.g., creator:"Jeff Kaplan")
        queries.add(`creator:("${displayName}")`);

        // 2. Search for the specific uploader identifier in the `uploader` field.
        // (e.g., uploader:"associate-jeff-kaplan@archive.org")
        queries.add(`uploader:("${searchId}")`);

        // 3. If the search identifier is a simple name (not an email), also check
        // for common email-like variants in the `uploader` field.
        // (e.g., for 'scitec', check uploader:"scitec@archive.org")
        if (!searchId.includes('@')) {
            queries.add(`uploader:("${searchId}@archive.org")`);
        }

        // 4. In case the display name is also used as an uploader id and is different.
        if (displayName !== searchId) {
             queries.add(`uploader:("${displayName}")`);
             if (!displayName.includes('@')) {
                queries.add(`uploader:("${displayName}@archive.org")`);
             }
        }

        return `(${Array.from(queries).join(' OR ')})`;
    }

    // Fallback for any other case, though it should be covered above.
    return `uploader:("${searchId}")`;
};
```

### `/utils/queryBuilder.ts`
```typescript
import type { Facets } from '../types';

interface QueryOptions {
    base?: string;
    text?: string;
    facets?: Partial<Facets>;
}

/**
 * Builds a valid Lucene query string for the Internet Archive API.
 * @param options An object containing the query parts.
 * @returns A formatted query string.
 */
export const buildArchiveQuery = (options: QueryOptions = {}): string => {
    const { base, text, facets } = options;
    const queryParts: string[] = [];

    if (base) {
        queryParts.push(base);
    }
    
    if (text?.trim()) {
        queryParts.push(`(${text.trim()})`);
    }

    if (facets) {
        if (facets.mediaType?.size) {
            const mediaTypes = Array.from(facets.mediaType).join(' OR ');
            queryParts.push(`mediatype:(${mediaTypes})`);
        }

        if (facets.yearStart && facets.yearEnd) {
            queryParts.push(`publicdate:[${facets.yearStart} TO ${facets.yearEnd}]`);
        } else if (facets.yearStart) {
            queryParts.push(`publicdate:[${facets.yearStart} TO 9999]`);
        } else if (facets.yearEnd) {
            queryParts.push(`publicdate:[0000 TO ${facets.yearEnd}]`);
        }

        if (facets.collection) {
            queryParts.push(`collection:(${facets.collection})`);
        }
        
        if (facets.availability === 'borrowable') {
            queryParts.push(`access-restricted-item:"true"`);
        } else if (facets.availability === 'free') {
            queryParts.push(`NOT access-restricted-item:"true"`);
        }

        if (facets.language) {
            queryParts.push(`language:("${facets.language}")`);
        }
    }
    
    return queryParts.join(' AND ');
};
```

### `/utils/sanitizer.ts`
```typescript
// Basic sanitizer to prevent XSS. For production, a library like DOMPurify is recommended.
export const sanitizeHtml = (html: string): string => {
    if (typeof html !== 'string') return '';
    return html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+\s*=\s*("([^"]*)"|'([^']*)'|[^>\s]+)/gi, '');
};
```

### `/contexts/ToastContext.tsx`
```typescript
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ToastMessage, ToastType } from '../types';

interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
    const id = uuidv4();
    const newToast: ToastMessage = { id, message, type, duration };
    setToasts(currentToasts => [...currentToasts, newToast]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
```
