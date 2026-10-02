import type { MediaType } from './archive';

export interface CategoryContent {
  title: string;
  description: string;
  collectionUrl?: string;
  contributors?: { name: string; role: string }[];
}

export type Availability = 'all' | 'free' | 'borrowable';

export interface Facets {
  mediaType: Set<MediaType>;
  yearStart?: number;
  yearEnd?: number;
  collection?: string;
  availability: Availability;
  language?: string;
}
