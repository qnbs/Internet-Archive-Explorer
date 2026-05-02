import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/cacheService', () => ({
  metadataCache: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

import {
  ArchiveServiceError,
  getItemCount,
  getItemMetadata,
  searchArchive,
} from '@/services/archiveService';
import { metadataCache } from '@/services/cacheService';
import { SERVICE_I18N } from '@/types/archiveSchemas';

const validSearchPayload = {
  response: {
    numFound: 2,
    start: 0,
    docs: [
      {
        identifier: 'item-1',
        title: 'First',
        publicdate: '2020-01-01T00:00:00Z',
        mediatype: 'texts',
      },
      {
        identifier: 'item-2',
        title: 'Second',
        publicdate: '2021-06-15T00:00:00Z',
        mediatype: 'texts',
      },
    ],
  },
};

const validMetadataPayload = {
  metadata: {
    identifier: 'item-1',
    title: 'First',
    publicdate: '2020-01-01T00:00:00Z',
    mediatype: 'texts',
  },
  files: [{ name: 'a.txt', source: 'original', format: 'Text' }],
};

describe('archiveService', () => {
  beforeEach(() => {
    vi.mocked(metadataCache.get).mockReset();
    vi.mocked(metadataCache.set).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('searchArchive parses a valid Archive JSON response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(validSearchPayload), { status: 200 }),
    );

    const result = await searchArchive('test query', 0, [], ['identifier', 'title'], 10);

    expect(result.response?.numFound).toBe(2);
    expect(result.response?.docs[0]?.identifier).toBe('item-1');
    expect(fetch).toHaveBeenCalled();
  });

  it('searchArchive maps TypeError to ArchiveServiceError', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));

    await expect(searchArchive('q', 0)).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof ArchiveServiceError &&
        /network error occurred/i.test((err as ArchiveServiceError).message),
    );
  });

  it('searchArchive throws validation error after repeated invalid shapes', async () => {
    const badBody = JSON.stringify({ response: 'not-an-object' });
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(badBody, { status: 200 })),
    );

    await expect(searchArchive('q', 0)).rejects.toMatchObject({
      name: 'ArchiveServiceError',
      i18nKey: SERVICE_I18N.archive.validationFailed,
    });
    expect(fetch).toHaveBeenCalled();
  });

  it('getItemMetadata returns cached value when schema-valid', async () => {
    vi.mocked(metadataCache.get).mockResolvedValue(validMetadataPayload as never);
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('fetch should not run'));

    const meta = await getItemMetadata('item-1');

    expect(meta.metadata.identifier).toBe('item-1');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(metadataCache.set).not.toHaveBeenCalled();
  });

  it('getItemMetadata fetches and caches on cache miss', async () => {
    vi.mocked(metadataCache.get).mockResolvedValue(undefined);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(validMetadataPayload), { status: 200 }),
    );

    const meta = await getItemMetadata('item-1');

    expect(meta.metadata.title).toBe('First');
    expect(metadataCache.set).toHaveBeenCalledWith('item-1', expect.any(Object));
  });

  it('getItemCount returns numFound', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(validSearchPayload), { status: 200 }),
    );

    await expect(getItemCount('anything')).resolves.toBe(2);
  });
});
