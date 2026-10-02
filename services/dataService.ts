import { STORAGE_KEY as AI_ARCHIVE_KEY } from '@/store/aiArchive';
import { STORAGE_KEYS as FAVORITES_KEYS } from '@/store/favorites';
import { STORAGE_KEYS as I18N_KEYS } from '@/store/i18n';
import { STORAGE_KEY as SCRIPTORIUM_KEY } from '@/store/scriptorium';
import { STORAGE_KEYS as SEARCH_KEYS } from '@/store/search';
import { STORAGE_KEYS as SETTINGS_KEYS } from '@/store/settings';
import type { AppSettings, LibraryItem, UserCollection, Workset } from '@/types';
import {
  BACKUP_CURRENT_VERSION,
  type ParsedBackupV2,
  parseBackupJson,
} from '@/types/backupSchemas';
import { logger } from '@/utils/logger';

const MANAGED_STORAGE_KEYS = [
  SETTINGS_KEYS.settings,
  FAVORITES_KEYS.libraryItems,
  FAVORITES_KEYS.uploaderFavorites,
  FAVORITES_KEYS.userCollections,
  SCRIPTORIUM_KEY,
  SEARCH_KEYS.searchHistory,
  AI_ARCHIVE_KEY,
  I18N_KEYS.language,
] as const;

const snapshotManagedStorage = (): Record<string, string | null> => {
  const snap: Record<string, string | null> = {};
  for (const key of MANAGED_STORAGE_KEYS) {
    snap[key] = localStorage.getItem(key);
  }
  return snap;
};

const restoreSnapshot = (snap: Record<string, string | null>): void => {
  for (const key of MANAGED_STORAGE_KEYS) {
    const value = snap[key];
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }
};

const libraryArrayToRecord = (items: LibraryItem[]): Record<string, LibraryItem> => {
  const record = Object.create(null) as Record<string, LibraryItem>;
  for (const item of items) {
    record[item.identifier] = item;
  }
  return record;
};

const commitBackup = (data: ParsedBackupV2): void => {
  if (data.settings) {
    localStorage.setItem(
      SETTINGS_KEYS.settings,
      JSON.stringify(data.settings as unknown as AppSettings),
    );
  }

  if (Array.isArray(data.libraryItems)) {
    localStorage.setItem(
      FAVORITES_KEYS.libraryItems,
      JSON.stringify(libraryArrayToRecord(data.libraryItems as LibraryItem[])),
    );
  }

  if (data.uploaderFavorites) {
    localStorage.setItem(FAVORITES_KEYS.uploaderFavorites, JSON.stringify(data.uploaderFavorites));
  }

  if (data.userCollections) {
    localStorage.setItem(
      FAVORITES_KEYS.userCollections,
      JSON.stringify(data.userCollections as UserCollection[]),
    );
  }

  if (data.scriptoriumWorksets) {
    localStorage.setItem(SCRIPTORIUM_KEY, JSON.stringify(data.scriptoriumWorksets as Workset[]));
  }

  if (data.searchHistory) {
    localStorage.setItem(SEARCH_KEYS.searchHistory, JSON.stringify(data.searchHistory));
  }

  if (data.aiArchive) {
    localStorage.setItem(AI_ARCHIVE_KEY, JSON.stringify(data.aiArchive));
  }

  if (data.language) {
    localStorage.setItem(I18N_KEYS.language, data.language);
  }
};

/**
 * Gathers managed user data from localStorage for export (no session secrets).
 */
export const exportAllData = (): string => {
  const data: Record<string, unknown> = {
    version: BACKUP_CURRENT_VERSION,
    timestamp: new Date().toISOString(),
  };

  try {
    data.settings = JSON.parse(localStorage.getItem(SETTINGS_KEYS.settings) || '{}');
    data.libraryItems = Object.values(
      JSON.parse(localStorage.getItem(FAVORITES_KEYS.libraryItems) || '{}') as Record<
        string,
        LibraryItem
      >,
    );
    data.uploaderFavorites = JSON.parse(
      localStorage.getItem(FAVORITES_KEYS.uploaderFavorites) || '[]',
    );
    data.userCollections = JSON.parse(localStorage.getItem(FAVORITES_KEYS.userCollections) || '[]');
    data.scriptoriumWorksets = JSON.parse(localStorage.getItem(SCRIPTORIUM_KEY) || '[]');
    data.searchHistory = JSON.parse(localStorage.getItem(SEARCH_KEYS.searchHistory) || '[]');
    data.aiArchive = JSON.parse(localStorage.getItem(AI_ARCHIVE_KEY) || '[]');
    const lang = localStorage.getItem(I18N_KEYS.language);
    if (lang === 'en' || lang === 'de') {
      data.language = lang;
    }

    return JSON.stringify(data, null, 2);
  } catch (error) {
    logger.error('Error exporting data:', error);
    throw new Error('Failed to export data. Check console for details.');
  }
};

/**
 * Validates backup JSON, then commits atomically with snapshot rollback on failure.
 */
export const importData = (jsonString: string): void => {
  const parsed = parseBackupJson(jsonString);
  const snapshot = snapshotManagedStorage();

  try {
    commitBackup(parsed);
  } catch (error) {
    restoreSnapshot(snapshot);
    logger.error('Error importing data:', error);
    throw error instanceof Error ? error : new Error('An unknown error occurred during import.');
  }
};
