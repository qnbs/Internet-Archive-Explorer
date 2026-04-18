import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import {
  addDownloadAtom,
  updateDownloadProgressAtom,
  downloadQueueAtom,
} from '@/store/downloads';
import type { DownloadItem } from '@/store/downloads';

/**
 * Hook to programmatically start a download via the Fetch API + ReadableStream,
 * tracking progress in the Jotai download queue.
 */
export const useDownloadManager = () => {
  const queue = useAtomValue(downloadQueueAtom);
  const addDownload = useSetAtom(addDownloadAtom);
  const updateProgress = useSetAtom(updateDownloadProgressAtom);

  const startDownload = useCallback(async (item: Omit<DownloadItem, 'downloadedBytes' | 'status' | 'addedAt'>) => {
    addDownload(item);
    updateProgress({ id: item.id, status: 'downloading' });

    try {
      const response = await fetch(item.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      if (reader) {
        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (done) break;
          const value = result.value;
          chunks.push(value);
          received += value.length;
          updateProgress({ id: item.id, downloadedBytes: received });
        }
      }

      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      updateProgress({ id: item.id, downloadedBytes: total || received, status: 'done' });
    } catch (err) {
      updateProgress({ id: item.id, status: 'error' });
      console.error('Download failed:', err);
    }
  }, [addDownload, updateProgress]);

  return { queue, startDownload };
};
