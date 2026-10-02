import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exportAllData, importData } from '@/services/dataService';
import { STORAGE_KEY as AI_ARCHIVE_KEY } from '@/store/aiArchive';
import { STORAGE_KEYS as FAVORITES_KEYS } from '@/store/favorites';
import { STORAGE_KEYS as I18N_KEYS } from '@/store/i18n';
import * as persistStorage from '@/store/persistStorage';
import { STORAGE_KEY as SCRIPTORIUM_KEY } from '@/store/scriptorium';
import { STORAGE_KEYS as SEARCH_KEYS } from '@/store/search';
import { STORAGE_KEYS as SETTINGS_KEYS } from '@/store/settings';
import { MediaType } from '@/types';
import { BACKUP_VERSION_V2 } from '@/types/backupSchemas';

const sampleLibraryItem = {
  identifier: 'good-item',
  title: 'Title',
  publicdate: '2020-01-01',
  mediatype: MediaType.Texts,
  notes: '',
  tags: [],
  addedAt: 1,
  collections: [],
};

describe('dataService import/export', () => {
  beforeEach(() => {
    localStorage.clear();
    persistStorage.resetPersistStorageForTests();
  });

  it('round-trips managed storage keys', () => {
    localStorage.setItem(SETTINGS_KEYS.settings, JSON.stringify({ resultsPerPage: 12 }));
    localStorage.setItem(
      FAVORITES_KEYS.libraryItems,
      JSON.stringify({ [sampleLibraryItem.identifier]: sampleLibraryItem }),
    );
    localStorage.setItem(FAVORITES_KEYS.uploaderFavorites, JSON.stringify(['uploader-1']));
    localStorage.setItem(FAVORITES_KEYS.userCollections, JSON.stringify([]));
    localStorage.setItem(SCRIPTORIUM_KEY, JSON.stringify([]));
    localStorage.setItem(SEARCH_KEYS.searchHistory, JSON.stringify(['library']));
    localStorage.setItem(AI_ARCHIVE_KEY, JSON.stringify([]));
    localStorage.setItem(I18N_KEYS.language, 'de');

    const exported = exportAllData();
    localStorage.clear();

    importData(exported);

    expect(JSON.parse(localStorage.getItem(SETTINGS_KEYS.settings) || '{}')).toEqual({
      resultsPerPage: 12,
    });
    expect(
      Object.keys(JSON.parse(persistStorage.readPersistedRaw(FAVORITES_KEYS.libraryItems) || '{}')),
    ).toEqual(['good-item']);
    expect(persistStorage.readPersistedRaw(I18N_KEYS.language)).toBe('de');
  });

  it('rejects prototype-pollution identifiers before writing', () => {
    const payload = {
      version: BACKUP_VERSION_V2,
      libraryItems: [
        {
          ...sampleLibraryItem,
          identifier: '__proto__',
        },
      ],
    };

    expect(() => importData(JSON.stringify(payload))).toThrow(/validation/i);
    expect(persistStorage.readPersistedRaw(FAVORITES_KEYS.libraryItems)).toBeNull();
  });

  it('rolls back on mid-commit failure', () => {
    persistStorage.writePersistedRaw(
      FAVORITES_KEYS.libraryItems,
      JSON.stringify({ keep: { ...sampleLibraryItem, identifier: 'keep' } }),
    );

    const writeImpl = persistStorage.writePersistedRaw.bind(persistStorage);
    const commitSpy = vi
      .spyOn(persistStorage, 'writePersistedRaw')
      .mockImplementation((key: string, raw: string | null) => {
        if (key === SCRIPTORIUM_KEY) {
          throw new Error('QuotaExceededError');
        }
        writeImpl(key, raw);
      });

    try {
      const payload = {
        version: BACKUP_VERSION_V2,
        scriptoriumWorksets: [{ id: 'w1', name: 'Workset', documents: [] }],
      };
      expect(() => importData(JSON.stringify(payload))).toThrow(/QuotaExceededError/);
      expect(
        JSON.parse(persistStorage.readPersistedRaw(FAVORITES_KEYS.libraryItems) || '{}'),
      ).toHaveProperty('keep');
    } finally {
      commitSpy.mockRestore();
    }
  });
});
