import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

type StoreRecord = Record<string, unknown>;

const createIdbMock = () => {
  const stores = new Map<string, StoreRecord>();

  class MockRequest {
    result: unknown;
    error: DOMException | null = null;
    onsuccess: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(result?: unknown) {
      this.result = result;
      queueMicrotask(() => this.onsuccess?.());
    }
  }

  class MockObjectStore {
    constructor(private readonly name: string) {}

    get(key: string) {
      return new MockRequest(stores.get(this.name)?.[key]);
    }

    put(value: unknown, key: string) {
      const bucket = stores.get(this.name) ?? {};
      bucket[key] = value;
      stores.set(this.name, bucket);
      return new MockRequest(undefined);
    }

    delete(key: string) {
      const bucket = stores.get(this.name);
      if (bucket) {
        delete bucket[key];
      }
      return new MockRequest(undefined);
    }

    clear() {
      stores.set(this.name, {});
      return new MockRequest(undefined);
    }
  }

  class MockTransaction {
    constructor(private readonly storeName: string) {}

    objectStore(_name: string) {
      return new MockObjectStore(this.storeName);
    }
  }

  class MockDb {
    objectStoreNames = { contains: (name: string) => stores.has(name) || name === 'kv' };

    transaction(storeName: string) {
      if (!stores.has(storeName)) {
        stores.set(storeName, {});
      }
      return new MockTransaction(storeName);
    }
  }

  const open = vi.fn((_name: string, _version?: number) => {
    const request = new MockRequest(new MockDb()) as MockRequest & {
      onupgradeneeded: (() => void) | null;
    };
    request.onupgradeneeded = null;
    queueMicrotask(() => request.onupgradeneeded?.());
    return request;
  });

  return { open, stores };
};

describe('persistStorage', () => {
  let originalIndexedDB: IDBFactory | undefined;
  let idbMock: ReturnType<typeof createIdbMock>;

  beforeEach(async () => {
    localStorage.clear();
    vi.resetModules();
    const mod = await import('@/store/persistStorage');
    mod.resetPersistStorageForTests();
    originalIndexedDB = globalThis.indexedDB;
    idbMock = createIdbMock();
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: { open: idbMock.open },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: originalIndexedDB,
    });
  });

  it('hydrates from localStorage into IndexedDB and clears legacy keys', async () => {
    const library = { 'item-1': { identifier: 'item-1', title: 'A' } };
    localStorage.setItem('app-library-items-v2', JSON.stringify(library));

    const { hydratePersistStorage, readPersistedRaw } = await import('@/store/persistStorage');
    await hydratePersistStorage();

    expect(localStorage.getItem('app-library-items-v2')).toBeNull();
    expect(JSON.parse(readPersistedRaw('app-library-items-v2') || '{}')).toEqual(library);
  });

  it('writePersistedRaw stores large keys in memory after hydrate', async () => {
    const { hydratePersistStorage, writePersistedRaw, readPersistedRaw } = await import(
      '@/store/persistStorage'
    );
    await hydratePersistStorage();

    writePersistedRaw('ai-archive-v1', JSON.stringify([{ id: 'x' }]));
    expect(readPersistedRaw('ai-archive-v1')).toContain('"id":"x"');
    expect(localStorage.getItem('ai-archive-v1')).toBeNull();
  });
});
