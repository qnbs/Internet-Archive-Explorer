import type { ArchiveItemSummary, MediaType } from './archive';

export interface LibraryItem extends ArchiveItemSummary {
  notes: string;
  tags: string[];
  addedAt: number;
  collections: string[];
}

export type LibraryFilter =
  | { type: 'dashboard' }
  | { type: 'all' }
  | { type: 'untagged' }
  | { type: 'collection'; id: string }
  | { type: 'tag'; tag: string }
  | { type: 'mediaType'; mediaType: MediaType };

export interface UserCollection {
  id: string;
  name: string;
  itemIdentifiers: string[];
}
