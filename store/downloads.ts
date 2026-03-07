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

/** Persisted download history */
export const downloadQueueAtom = safeAtomWithStorage<DownloadItem[]>('download-queue-v1', []);

/** Active download count (derived) */
export const activeDownloadCountAtom = atom((get) =>
  get(downloadQueueAtom).filter((d) => d.status === 'downloading' || d.status === 'queued').length
);

/** Add a download to the queue */
export const addDownloadAtom = atom(null, (get, set, item: Omit<DownloadItem, 'downloadedBytes' | 'status' | 'addedAt'>) => {
  const queue = get(downloadQueueAtom);
  const already = queue.find((d) => d.id === item.id);
  if (already) return;
  set(downloadQueueAtom, [
    ...queue,
    { ...item, downloadedBytes: 0, status: 'queued', addedAt: Date.now() },
  ]);
});

/** Update progress of a download */
export const updateDownloadProgressAtom = atom(null, (get, set, { id, downloadedBytes, status }: { id: string; downloadedBytes?: number; status?: DownloadStatus }) => {
  set(downloadQueueAtom, get(downloadQueueAtom).map((d) =>
    d.id === id
      ? { ...d, ...(downloadedBytes !== undefined ? { downloadedBytes } : {}), ...(status ? { status } : {}) }
      : d
  ));
});

/** Remove a download by id */
export const removeDownloadAtom = atom(null, (get, set, id: string) => {
  set(downloadQueueAtom, get(downloadQueueAtom).filter((d) => d.id !== id));
});

/** Clear completed/errored downloads */
export const clearCompletedDownloadsAtom = atom(null, (get, set) => {
  set(downloadQueueAtom, get(downloadQueueAtom).filter((d) => d.status === 'queued' || d.status === 'downloading'));
});

/** Is the download manager panel open? */
export const downloadManagerOpenAtom = atom(false);
