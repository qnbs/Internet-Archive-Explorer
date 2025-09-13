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
