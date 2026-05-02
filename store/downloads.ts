import { atom } from 'jotai';
import { safeAtomWithStorage } from './safeStorage';

export type DownloadStatus = 'queued' | 'downloading' | 'done' | 'error';

export interface DownloadItem {
  id: string;
  identifier: string;
  title: string;
  filename: string;
  url: string;
  sizeBytes?: number;
  downloadedBytes: number;
  status: DownloadStatus;
  error?: string;
  addedAt: number;
}

/** Max persisted queue size (evicts finished / queued before rejecting new adds) */
export const DOWNLOAD_QUEUE_MAX_ITEMS = 120;

/** Drop oldest removable rows until length is below `cap` (never removes `downloading`). */
export function trimDownloadQueue(queue: DownloadItem[], cap: number): DownloadItem[] {
  if (queue.length < cap) return queue;
  let next = [...queue];
  const removable = (d: DownloadItem) =>
    d.status === 'done' || d.status === 'error' || d.status === 'queued';
  while (next.length > cap) {
    const candidates = next.filter(removable).sort((a, b) => a.addedAt - b.addedAt);
    if (candidates.length === 0) break;
    const id = candidates[0].id;
    next = next.filter((d) => d.id !== id);
  }
  return next;
}

/** Persisted download history */
export const downloadQueueAtom = safeAtomWithStorage<DownloadItem[]>('download-queue-v1', []);

/** Active download count (derived) */
export const activeDownloadCountAtom = atom(
  (get) =>
    get(downloadQueueAtom).filter((d) => d.status === 'downloading' || d.status === 'queued')
      .length,
);

/** Add a download to the queue */
export const addDownloadAtom = atom(
  null,
  (get, set, item: Omit<DownloadItem, 'downloadedBytes' | 'status' | 'addedAt'>) => {
    let queue = get(downloadQueueAtom);
    const already = queue.find((d) => d.id === item.id);
    if (already) return;
    queue = trimDownloadQueue(queue, DOWNLOAD_QUEUE_MAX_ITEMS);
    if (queue.length >= DOWNLOAD_QUEUE_MAX_ITEMS) {
      return;
    }
    set(downloadQueueAtom, [
      ...queue,
      { ...item, downloadedBytes: 0, status: 'queued', addedAt: Date.now() },
    ]);
  },
);

/** Update progress of a download */
export const updateDownloadProgressAtom = atom(
  null,
  (
    get,
    set,
    {
      id,
      downloadedBytes,
      status,
    }: { id: string; downloadedBytes?: number; status?: DownloadStatus },
  ) => {
    set(
      downloadQueueAtom,
      get(downloadQueueAtom).map((d) =>
        d.id === id
          ? {
              ...d,
              ...(downloadedBytes !== undefined ? { downloadedBytes } : {}),
              ...(status ? { status } : {}),
            }
          : d,
      ),
    );
  },
);

/** Remove a download by id */
export const removeDownloadAtom = atom(null, (get, set, id: string) => {
  set(
    downloadQueueAtom,
    get(downloadQueueAtom).filter((d) => d.id !== id),
  );
});

/** Clear completed/errored downloads */
export const clearCompletedDownloadsAtom = atom(null, (get, set) => {
  set(
    downloadQueueAtom,
    get(downloadQueueAtom).filter((d) => d.status === 'queued' || d.status === 'downloading'),
  );
});

/** Is the download manager panel open? */
export const downloadManagerOpenAtom = atom(false);
