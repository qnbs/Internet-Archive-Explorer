import type { ArchiveItemSummary } from '@/types';

const TRENDING_KEY = 'ia-offline-explore-trending-v1';
const FORYOU_TRENDING_KEY = 'ia-offline-foryou-trending-v1';

export interface CachedHubItems {
  savedAt: number;
  items: ArchiveItemSummary[];
}

function safeParse(raw: string | null): CachedHubItems | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as CachedHubItems;
    if (!v || !Array.isArray(v.items)) return null;
    return v;
  } catch {
    return null;
  }
}

export function persistExploreTrending(items: ArchiveItemSummary[]) {
  try {
    const payload: CachedHubItems = { savedAt: Date.now(), items: items.slice(0, 20) };
    localStorage.setItem(TRENDING_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function loadExploreTrending(): CachedHubItems | null {
  return safeParse(localStorage.getItem(TRENDING_KEY));
}

export function persistForYouTrending(items: ArchiveItemSummary[]) {
  try {
    const payload: CachedHubItems = { savedAt: Date.now(), items: items.slice(0, 20) };
    localStorage.setItem(FORYOU_TRENDING_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function loadForYouTrending(): CachedHubItems | null {
  return safeParse(localStorage.getItem(FORYOU_TRENDING_KEY));
}
