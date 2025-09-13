import type { AppSettings, LibraryItem, Workset } from '../types';
import { STORAGE_KEYS as SETTINGS_KEYS } from '../store/settings';
import { STORAGE_KEYS as FAVORITES_KEYS } from '../store/favorites';
import { STORAGE_KEYS as SEARCH_KEYS } from '../store/search';
import { STORAGE_KEY as SCRIPTORIUM_KEY } from '../store/scriptorium';

interface BackupData {
    version: number;
    timestamp: string;
    settings: AppSettings;
    libraryItems: LibraryItem[];
    uploaderFavorites: string[];
    scriptoriumWorksets: Workset[];
    searchHistory: string[];
}

const CURRENT_VERSION = 1;

/**
 * Gathers all relevant data from localStorage and prepares it for export.
 */
export const exportAllData = (): string => {
    const data: Partial<BackupData> = {
        version: CURRENT_VERSION,
        timestamp: new Date().toISOString(),
    };

    try {
        data.settings = JSON.parse(localStorage.getItem(SETTINGS_KEYS.settings) || '{}');
        data.libraryItems = JSON.parse(localStorage.getItem(FAVORITES_KEYS.libraryItems) || '[]');
        data.uploaderFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEYS.uploaderFavorites) || '[]');
        data.scriptoriumWorksets = JSON.parse(localStorage.getItem(SCRIPTORIUM_KEY) || '[]');
        data.searchHistory = JSON.parse(localStorage.getItem(SEARCH_KEYS.searchHistory) || '[]');
        
        return JSON.stringify(data, null, 2);
    } catch (error) {
        console.error("Error exporting data:", error);
        throw new Error("Failed to export data. Check console for details.");
    }
};

/**
 * Imports data from a JSON string, validates it, and saves it to localStorage.
 * @param jsonString The JSON string from the imported file.
 */
export const importData = (jsonString: string): void => {
    try {
        const data: BackupData = JSON.parse(jsonString);

        if (!data || typeof data.version !== 'number') {
            throw new Error('Invalid backup file. The file is not a valid Archive Explorer backup.');
        }
        if (data.version !== CURRENT_VERSION) {
            throw new Error(`Unsupported backup version. Expected version ${CURRENT_VERSION}, but file is version ${data.version}.`);
        }


        // Validate and save each part
        if (data.settings) localStorage.setItem(SETTINGS_KEYS.settings, JSON.stringify(data.settings));
        if (data.libraryItems) localStorage.setItem(FAVORITES_KEYS.libraryItems, JSON.stringify(data.libraryItems));
        if (data.uploaderFavorites) localStorage.setItem(FAVORITES_KEYS.uploaderFavorites, JSON.stringify(data.uploaderFavorites));
        if (data.scriptoriumWorksets) localStorage.setItem(SCRIPTORIUM_KEY, JSON.stringify(data.scriptoriumWorksets));
        if (data.searchHistory) localStorage.setItem(SEARCH_KEYS.searchHistory, JSON.stringify(data.searchHistory));

    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error("Import failed: The file is not a valid JSON file.");
        }
        console.error("Error importing data:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred during import.");
    }
};