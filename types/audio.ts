import type { ArchiveItemSummary } from './archive';

export interface PlayableTrack extends ArchiveItemSummary {
  playableUrl: string;
  duration?: string;
}
