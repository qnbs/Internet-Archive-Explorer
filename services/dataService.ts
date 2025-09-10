import type { AppSettings } from '../contexts/SettingsContext';
import type { ArchiveItemSummary, Uploader, Workset } from '../types';

interface BackupData {
    version: number;
    timestamp: string;
    settings: AppSettings;
    itemFavorites: ArchiveItemSummary[];
    uploaderFavorites: string[];
    scriptoriumWorksets: Workset[];
    searchHistory: string[];
}

const STORAGE_KEYS = {
    settings: 'app-settings-v2',
    itemFavorites: 'archive-favorites',
    uploaderFavorites: 'archive-uploader-favorites',
    scriptoriumWorksets: 'scriptorium-worksets',
    searchHistory: 'app-search-history',
};

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
        data.settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}');
        data.itemFavorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.itemFavorites) || '[]');
        data.uploaderFavorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.uploaderFavorites) || '[]');
        data.scriptoriumWorksets = JSON.parse(localStorage.getItem(STORAGE_KEYS.scriptoriumWorksets) || '[]');
        data.searchHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.searchHistory) || '[]');
        
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

        if (!data || data.version !== CURRENT_VERSION) {
            throw new Error(`Invalid or unsupported backup file. Expected version ${CURRENT_VERSION}.`);
        }

        // Validate and save each part
        if (data.settings) localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data.settings));
        if (data.itemFavorites) localStorage.setItem(STORAGE_KEYS.itemFavorites, JSON.stringify(data.itemFavorites));
        if (data.uploaderFavorites) localStorage.setItem(STORAGE_KEYS.uploaderFavorites, JSON.stringify(data.uploaderFavorites));
        if (data.scriptoriumWorksets) localStorage.setItem(STORAGE_KEYS.scriptoriumWorksets, JSON.stringify(data.scriptoriumWorksets));
        if (data.searchHistory) localStorage.setItem(STORAGE_KEYS.searchHistory, JSON.stringify(data.searchHistory));

    } catch (error) {
        console.error("Error importing data:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred during import.");
    }
};
