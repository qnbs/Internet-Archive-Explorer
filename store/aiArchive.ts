import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { AIArchiveEntry } from '../types';
import { toastAtom } from './archive';
import { v4 as uuidv4 } from 'uuid';

export const STORAGE_KEY = 'ai-archive-v1';

// --- Base State Atom ---
export const aiArchiveAtom = atomWithStorage<AIArchiveEntry[]>(STORAGE_KEY, []);

// --- UI State Atoms ---
// FIX: Add type assertion to ensure atom is inferred as writable, preventing type errors with useAtom.
export const selectedAIEntryIdAtom = atom(null as string | null);
export const aiArchiveSearchQueryAtom = atom('');

// --- Derived Atoms ---
export const allAIArchiveTagsAtom = atom((get) => {
    const entries = get(aiArchiveAtom);
    const tags = new Set<string>();
    for (const entry of entries) {
        for (const tag of entry.tags) {
            tags.add(tag);
        }
    }
    return Array.from(tags).sort();
});

// --- Write-only Action Atoms ---

export const addAIArchiveEntryAtom = atom(
    null,
    (get, set, newEntry: AIArchiveEntry) => {
        set(aiArchiveAtom, (prev) => [newEntry, ...prev]);
        // Show a subtle toast that this was saved.
        set(toastAtom, { type: 'info', message: `Saved to AI Archive.`, id: uuidv4() });
    }
);

export const deleteAIArchiveEntryAtom = atom(
    null,
    (get, set, entryId: string) => {
        set(aiArchiveAtom, (prev) => prev.filter((entry) => entry.id !== entryId));
        set(toastAtom, { type: 'info', message: `AI entry deleted.`, id: uuidv4() });
    }
);

export const updateAIArchiveEntryAtom = atom(
    null,
    (get, set, updatedEntry: AIArchiveEntry) => {
        set(aiArchiveAtom, (prev) =>
            prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
        );
    }
);

export const updateAIEntryTagsAtom = atom(
    null,
    (get, set, { entryId, tags }: { entryId: string, tags: string[] }) => {
        const uniqueTags = Array.from(new Set(tags)).sort();
        set(aiArchiveAtom, entries => entries.map(entry => 
            entry.id === entryId ? { ...entry, tags: uniqueTags } : entry
        ));
    }
);

export const regenerateAIArchiveEntryAtom = atom(
    null,
    async (get, set, entryId: string) => {
        const entries = get(aiArchiveAtom);
        const entryToRegen = entries.find(e => e.id === entryId);
        if (!entryToRegen) return;

        // Use dynamic imports to avoid circular dependencies and load services only when needed
        const { getSummary, extractEntities, analyzeImage, generateStory, answerFromText } = await import('../services/geminiService');
        const { getItemPlainText, getItemMetadata } = await import('../services/archiveService');
        const { findBestImageUrl, urlToBase64 } = await import('../utils/imageUtils');

        let newContent: AIArchiveEntry['content'] | null = null;
        
        try {
            switch (entryToRegen.type) {
                case 'summary': {
                    if (!entryToRegen.source) throw new Error("Source missing for summary regeneration");
                    const textContent = await getItemPlainText(entryToRegen.source.identifier);
                    const tone = JSON.parse(entryToRegen.prompt || '{}').tone || 'detailed';
                    newContent = await getSummary(textContent, entryToRegen.language, tone);
                    break;
                }
                case 'entities': {
                    if (!entryToRegen.source) throw new Error("Source missing for entity regeneration");
                    const textContent = await getItemPlainText(entryToRegen.source.identifier);
                    newContent = await extractEntities(textContent, entryToRegen.language);
                    break;
                }
                case 'story': {
                    if (!entryToRegen.prompt) throw new Error("Prompt missing for story regeneration");
                    newContent = await generateStory(entryToRegen.prompt, entryToRegen.language);
                    break;
                }
                case 'answer': {
                    if (!entryToRegen.source || !entryToRegen.prompt) throw new Error("Source or prompt missing for answer regeneration");
                    const textContent = await getItemPlainText(entryToRegen.source.identifier);
                    newContent = await answerFromText(entryToRegen.prompt, textContent, entryToRegen.language);
                    break;
                }
                case 'imageAnalysis': {
                    if (!entryToRegen.source) throw new Error("Source missing for image analysis regeneration");
                    const metadata = await getItemMetadata(entryToRegen.source.identifier);
                    const imageUrl = findBestImageUrl(metadata.files, entryToRegen.source.identifier);
                    if (!imageUrl) throw new Error("Could not find image URL to analyze.");
                    const { base64, mimeType } = await urlToBase64(imageUrl);
                    newContent = await analyzeImage(base64, mimeType, entryToRegen.language);
                    break;
                }
                default:
                    throw new Error("Regeneration not supported for this entry type.");
            }
            
            if (newContent) {
                set(aiArchiveAtom, prev => prev.map(e => e.id === entryId ? { ...e, content: newContent!, timestamp: Date.now() } : e));
                set(toastAtom, { type: 'success', message: `Entry regenerated.`, id: uuidv4() });
            }
        } catch(err) {
            console.error("Regeneration failed:", err);
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            set(toastAtom, { type: 'error', message: `Regeneration failed: ${message}`, id: uuidv4() });
            throw err;
        }
    }
);