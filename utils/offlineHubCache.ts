import { hubTrendingCache } from '@/services/cacheService';
import type { ArchiveItemSummary } from '@/types';

const LEGACY_EXPLORE_KEY = 'ia-offline-explore-trending-v1';
const LEGACY_FORYOU_KEY = 'ia-offline-foryou-trending-v1';

const EXPLORE_KEY = 'explore-trending-v1';
const FORYOU_KEY = 'foryou-trending-v1';

export interface CachedHubItems {
  savedAt: number;
  items: ArchiveItemSummary[];
}

function safeParseLegacy(raw: string | null): CachedHubItems | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as CachedHubItems;
    if (!v || !Array.isArray(v.items)) return null;
    return v;
  } catch {
    return null;
  }
}

async function migrateLegacyKey(legacyKey: string, idbKey: string): Promise<CachedHubItems | null> {
  const legacy = safeParseLegacy(localStorage.getItem(legacyKey));
  if (!legacy?.items?.length) return null;
  try {
    await hubTrendingCache.set(idbKey, legacy);
    localStorage.removeItem(legacyKey);
  } catch {
    /* quota / private mode */
  }
  return legacy;
}

async function loadHubTrending(idbKey: string, legacyKey: string): Promise<CachedHubItems | null> {
  const fromIdb = await hubTrendingCache.get(idbKey);
  if (fromIdb?.items?.length) {
    return fromIdb;
  }
  return migrateLegacyKey(legacyKey, idbKey);
}

async function persistHubTrending(idbKey: string, items: ArchiveItemSummary[]): Promise<void> {
  const payload: CachedHubItems = { savedAt: Date.now(), items: items.slice(0, 20) };
  await hubTrendingCache.set(idbKey, payload);
}

export async function persistExploreTrending(items: ArchiveItemSummary[]): Promise<void> {
  await persistHubTrending(EXPLORE_KEY, items);
}

export async function loadExploreTrending(): Promise<CachedHubItems | null> {
  return loadHubTrending(EXPLORE_KEY, LEGACY_EXPLORE_KEY);
}

export async function persistForYouTrending(items: ArchiveItemSummary[]): Promise<void> {
  await persistHubTrending(FORYOU_KEY, items);
}

export async function loadForYouTrending(): Promise<CachedHubItems | null> {
  return loadHubTrending(FORYOU_KEY, LEGACY_FORYOU_KEY);
}
