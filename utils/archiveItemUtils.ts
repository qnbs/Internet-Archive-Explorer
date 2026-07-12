import type { ArchiveItemSummary, ArchiveMetadata } from '@/types';

/**
 * Converts full archive metadata into the lightweight summary shape used by
 * cards, lists, and modal headers. Useful when only an identifier is available
 * (e.g. restoring a modal from a deep link).
 */
export function toArchiveItemSummary(metadata: ArchiveMetadata): ArchiveItemSummary {
  const { metadata: meta } = metadata;
  return {
    identifier: meta.identifier,
    title: meta.title,
    creator: meta.creator,
    uploader: meta.uploader,
    publicdate: meta.publicdate,
    mediatype: meta.mediatype,
    'access-restricted-item': meta['access-restricted-item'],
  };
}
