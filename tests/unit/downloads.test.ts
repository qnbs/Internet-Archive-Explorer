import { describe, expect, it } from 'vitest';
import { DOWNLOAD_QUEUE_MAX_ITEMS, type DownloadItem, trimDownloadQueue } from '@/store/downloads';

function item(partial: Partial<DownloadItem> & Pick<DownloadItem, 'id' | 'addedAt'>): DownloadItem {
  return {
    identifier: 'x',
    title: 't',
    filename: 'f',
    url: 'https://example.com/f',
    downloadedBytes: 0,
    status: 'queued',
    ...partial,
  };
}

describe('trimDownloadQueue', () => {
  it('returns unchanged when under cap', () => {
    const q = [item({ id: '1', addedAt: 1 })];
    expect(trimDownloadQueue(q, 10)).toEqual(q);
  });

  it('removes oldest done items first', () => {
    const q: DownloadItem[] = [
      item({ id: 'a', addedAt: 1, status: 'done' }),
      item({ id: 'b', addedAt: 2, status: 'queued' }),
      item({ id: 'c', addedAt: 3, status: 'queued' }),
    ];
    const out = trimDownloadQueue(q, 2);
    expect(out.map((d) => d.id)).toEqual(['b', 'c']);
  });

  it('never removes downloading entries', () => {
    const q: DownloadItem[] = [
      item({ id: 'd1', addedAt: 1, status: 'downloading' }),
      item({ id: 'd2', addedAt: 2, status: 'downloading' }),
      item({ id: 'q', addedAt: 3, status: 'queued' }),
    ];
    const out = trimDownloadQueue(q, 2);
    expect(out.map((d) => d.id)).toEqual(['d1', 'd2']);
  });

  it('default cap constant is positive', () => {
    expect(DOWNLOAD_QUEUE_MAX_ITEMS).toBeGreaterThan(10);
  });
});
