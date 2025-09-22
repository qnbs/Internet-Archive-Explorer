import { atom } from 'jotai';
import { safeAtomWithStorage } from './safeStorage';
import type { AIArchiveEntry, AIArchiveFilter, AIArchiveSortOption, Language, AIGenerationType } from '../types';

// --- Base State Atom ---

export const STORAGE_KEY = 'ai-archive-v1';

/**
 * The foundational atom that stores the entire array of AI-generated entries.
 * It is persisted to localStorage using a safe storage utility to prevent crashes from corrupted data.
 */
export const aiArchiveAtom = safeAtomWithStorage<AIArchiveEntry[]>(STORAGE_KEY, []);

// --- UI State Atoms ---

/**
 * Stores the ID of the currently selected entry in the AI Archive view.
 * This is persisted to sessionStorage to remember the selection across page reloads.
 */
export const selectedAIEntryIdAtom = safeAtomWithStorage<string | null>('ai-archive-selected-id', null);

/**
 * Stores the user's text search query for filtering the AI Archive.
 */
export const aiArchiveSearchQueryAtom = atom<string>('');

/**
 * Stores the active filter configuration (by type, language, or tag).
 * This is persisted to localStorage.
 */
export const aiArchiveFilterAtom = safeAtomWithStorage<AIArchiveFilter>('ai-archive-filter', { type: 'all' });

/**
 * Stores the active sorting option for the AI Archive list.
 * This is persisted to localStorage.
 */
export const aiArchiveSortAtom = safeAtomWithStorage<AIArchiveSortOption>('ai-archive-sort', 'timestamp_desc');

// --- Derived Read-only Atoms (for performance and convenience) ---

/**
 * A memoized, derived atom that returns the full object of the currently selected AI entry.
 * Components that only need the selected entry can subscribe to this atom to avoid
 * re-rendering when the entire archive list changes, but the selection does not.
 */
export const selectedAIEntryAtom = atom<AIArchiveEntry | null>((get) => {
    const id = get(selectedAIEntryIdAtom);
    if (!id) return null;
    const archive = get(aiArchiveAtom);
    return archive.find(entry => entry.id === id) ?? null;
});

/**
 * A memoized, derived atom that efficiently computes aggregate counts for different
 * filters (generation types, languages, tags).
 * This offloads the calculation from the UI components, making the logic reusable and performant.
 */
export const aiArchiveCountsAtom = atom((get) => {
    const allEntries = get(aiArchiveAtom);
    const counts = {
        all: allEntries.length,
        generations: {} as Record<AIGenerationType, number>,
        languages: {} as Record<Language, number>,
        tags: {} as Record<string, number>,
    };

    const allTags = new Set<string>();
    const availableLanguages = new Set<Language>();

    for (const entry of allEntries) {
        counts.generations[entry.type] = (counts.generations[entry.type] || 0) + 1;
        counts.languages[entry.language] = (counts.languages[entry.language] || 0) + 1;
        availableLanguages.add(entry.language);
        entry.tags.forEach(tag => {
            allTags.add(tag);
            counts.tags[tag] = (counts.tags[tag] || 0) + 1;
        });
    }

    return { counts, allTags: Array.from(allTags).sort(), availableLanguages: Array.from(availableLanguages) };
});

export const allAIArchiveTagsAtom = atom((get) => get(aiArchiveCountsAtom).allTags);


/**
 * The primary derived atom for the AI Archive view. It composes state from multiple
 * atoms (search, filter, sort) to produce the final, displayed list of entries.
 * UI components should primarily consume this atom, simplifying their logic significantly.
 */
export const filteredAndSortedEntriesAtom = atom((get) => {
    let entries = [...get(aiArchiveAtom)];
    const query = get(aiArchiveSearchQueryAtom);
    const filter = get(aiArchiveFilterAtom);
    const sort = get(aiArchiveSortAtom);

    // 1. Filter by search query (debouncing is handled in the UI component)
    if (query) {
        const lowerQuery = query.toLowerCase();
        entries = entries.filter(e => 
            (e.source?.title?.toLowerCase().includes(lowerQuery)) ||
            (typeof e.content === 'string' && e.content.toLowerCase().includes(lowerQuery)) ||
            (e.prompt?.toLowerCase().includes(lowerQuery))
        );
    }

    // 2. Filter by active filter type
    switch (filter.type) {
        case 'generation':
            entries = entries.filter(e => e.type === filter.generationType);
            break;
        case 'language':
            entries = entries.filter(e => e.language === filter.language);
            break;
        case 'tag':
            entries = entries.filter(e => e.tags.includes(filter.tag));
            break;
    }

    // 3. Sort the results
    return entries.sort((a, b) => {
        switch (sort) {
            case 'timestamp_asc': return a.timestamp - b.timestamp;
            case 'type_asc': return a.type.localeCompare(b.type);
            case 'timestamp_desc':
            default:
                return b.timestamp - a.timestamp;
        }
    });
});

// --- Write-only Action Atoms ---

/**
 * An action atom to add a new entry to the archive.
 * Appends the new entry to the start of the list.
 */
export const addAIArchiveEntryAtom = atom(
    null,
    (get, set, newEntry: AIArchiveEntry) => {
        const currentArchive = get(aiArchiveAtom);
        set(aiArchiveAtom, [newEntry, ...currentArchive]);
    }
);

/**
 * An action atom to delete an entry from the archive.
 * Also clears the selection if the deleted entry was the one selected.
 */
export const deleteAIArchiveEntryAtom = atom(
    null,
    (get, set, entryId: string) => {
        set(aiArchiveAtom, archive => archive.filter(entry => entry.id !== entryId));
        if (get(selectedAIEntryIdAtom) === entryId) {
            set(selectedAIEntryIdAtom, null);
        }
    }
);

/**
 * An action atom to update an existing entry in the archive.
 * This is useful for modifying user-provided data like notes.
 */
export const updateAIArchiveEntryAtom = atom(
    null,
    (get, set, updatedEntry: AIArchiveEntry) => {
        set(aiArchiveAtom, archive => archive.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
    }
);

/**
 * An action atom specifically for updating the tags of a single entry.
 * Ensures tags are unique and sorted.
 */
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

/**
 * An action atom to completely clear the AI archive.
 */
export const clearAIArchiveAtom = atom(null, (get, set) => {
    set(aiArchiveAtom, []);
});