import type { ArchiveItemSummary } from './archive';
import type { Language } from './settings';

export interface ExtractedEntities {
  people: string[];
  places: string[];
  organizations: string[];
  dates: string[];
}

export interface ImageAnalysisResult {
  description: string;
  tags: string[];
}

export interface MagicOrganizeResult {
  tags: string[];
  collections: string[];
}

export enum AIGenerationType {
  Summary = 'summary',
  Entities = 'entities',
  ImageAnalysis = 'imageAnalysis',
  DailyInsight = 'dailyInsight',
  Story = 'story',
  Answer = 'answer',
  MagicOrganize = 'magicOrganize',
  MoviesInsight = 'moviesInsight',
  AudioInsight = 'audioInsight',
  ImagesInsight = 'imagesInsight',
  RecRoomInsight = 'recRoomInsight',
}

export interface AIArchiveEntry {
  id: string;
  timestamp: number;
  type: AIGenerationType;
  content: string | ExtractedEntities | ImageAnalysisResult | MagicOrganizeResult;
  language: Language;
  source?: ArchiveItemSummary;
  sources?: ArchiveItemSummary[];
  prompt?: string;
  tags: string[];
  userNotes: string;
}

export type AIArchiveFilter =
  | { type: 'all' }
  | { type: 'generation'; generationType: AIGenerationType }
  | { type: 'language'; language: Language }
  | { type: 'tag'; tag: string };

export type AIArchiveSortOption = 'timestamp_desc' | 'timestamp_asc' | 'type_asc';
