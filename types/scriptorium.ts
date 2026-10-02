import type { ArchiveItemSummary } from './archive';

export interface WorksetDocument extends ArchiveItemSummary {
  notes: string;
  worksetId: string;
}

export interface Workset {
  id: string;
  name: string;
  documents: WorksetDocument[];
}
