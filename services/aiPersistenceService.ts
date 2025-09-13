import { v4 as uuidv4 } from 'uuid';
import type { AIArchiveEntry, AIGenerationType, ExtractedEntities, ImageAnalysisResult, Language, MagicOrganizeResult } from '../types';

// This service is now the single source of truth for retrieving and persisting AI generations.
// It reads from and writes to the global `aiArchiveAtom` via arguments passed from components.

// --- Read operations (used as a cache) ---

/**
 * Finds a previously generated daily insight for the current day and language.
 * @param language The language of the insight.
 * @param archive The full AI archive array.
 * @returns The insight summary string, or null if not found.
 */
export const findArchivedDailyInsight = (language: Language, archive: AIArchiveEntry[]): string | null => {
    const today = new Date().toDateString();
    const found = archive.find(entry => 
        entry.type === 'dailyInsight' &&
        entry.language === language &&
        new Date(entry.timestamp).toDateString() === today
    );
    return (found?.content as string) || null;
};


/**
 * Finds a previously generated analysis for a specific Internet Archive item.
 * @param identifier The item identifier.
 * @param type The type of analysis (e.g., 'summary', 'entities').
 * @param archive The full AI archive array.
 * @param options Additional options to match, like the summary tone.
 * @returns The found analysis data, or null.
 */
export const findArchivedItemAnalysis = <T>(
    identifier: string, 
    type: AIGenerationType,
    archive: AIArchiveEntry[],
    options?: Record<string, any>
): T | null => {
    const found = archive.find(entry => {
        if (entry.type !== type || entry.source?.identifier !== identifier) {
            return false;
        }
        // If options are provided, check if the prompt matches.
        // This is a simple way to check for things like summary tone.
        if (options) {
             try {
                const promptData = JSON.parse(entry.prompt || '{}');
                return Object.entries(options).every(([key, value]) => promptData[key] === value);
             } catch {
                return false;
             }
        }
        return true;
    });

    return (found?.content as T) || null;
};

// --- Write operations (archiving new generations) ---

/**
 * Creates and saves a new AIArchiveEntry to the global store via a setter function,
 * respecting the user's auto-archive setting.
 * @param data The data for the new archive entry.
 * @param addEntry The Jotai setter function for adding an entry.
 * @param autoArchive A boolean indicating if the user has auto-archiving enabled.
 */
export const archiveAIGeneration = (
    data: Omit<AIArchiveEntry, 'id' | 'timestamp' | 'tags' | 'userNotes'>,
    addEntry: (entry: AIArchiveEntry) => void,
    autoArchive: boolean
): void => {
    if (!autoArchive) return;

    const newEntry: AIArchiveEntry = {
        ...data,
        id: uuidv4(),
        timestamp: Date.now(),
        tags: [data.type], // Auto-tag with the generation type
        userNotes: '',
    };
    
    if (data.source?.mediaType) {
        newEntry.tags.push(data.source.mediaType);
    }
    
    // For entities, auto-add the first few entities as tags
    if (data.type === 'entities' && typeof data.content === 'object' && data.content) {
        const entities = data.content as ExtractedEntities;
        const entityTags = [...entities.people, ...entities.organizations, ...entities.places]
            .slice(0, 3) // Take the first 3 prominent entities
            .map(e => e.toLowerCase());
        newEntry.tags.push(...entityTags);
    }
    
    // For Magic Organize, auto-add the suggested tags as entry tags
    if (data.type === 'magicOrganize' && typeof data.content === 'object' && data.content) {
        const suggestions = data.content as MagicOrganizeResult;
        const suggestionTags = suggestions.tags.slice(0, 5).map(t => t.toLowerCase());
        newEntry.tags.push(...suggestionTags);
    }
    
    newEntry.tags = [...new Set(newEntry.tags)]; // Ensure unique tags

    addEntry(newEntry);
};