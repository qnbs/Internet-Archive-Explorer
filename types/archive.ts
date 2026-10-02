export enum MediaType {
  Audio = 'audio',
  Movies = 'movies',
  Texts = 'texts',
  Image = 'image',
  Software = 'software',
  Collection = 'collection',
  Data = 'data',
  Web = 'web',
}

export interface ArchiveItemSummary {
  identifier: string;
  title: string;
  thumbnail?: string;
  creator?: string | string[];
  publicdate: string;
  mediatype: MediaType;
  uploader?: string;
  'access-restricted-item'?: 'true' | 'false';
  downloads?: number;
  week?: number;
  avg_rating?: number;
  reviewdate?: string;
  reviewtitle?: string;
  reviewbody?: string;
}

export interface ArchiveSearchResponse {
  response: {
    numFound: number;
    start: number;
    docs: ArchiveItemSummary[];
  };
}

export interface ArchiveFile {
  name: string;
  source: string;
  format: string;
  size?: string;
  length?: string;
}

export interface ArchiveMetadata {
  metadata: {
    identifier: string;
    title: string;
    creator?: string | string[];
    uploader?: string;
    publicdate: string;
    mediatype: MediaType;
    description?: string | string[];
    licenseurl?: string;
    collection?: string[];
    'access-restricted-item'?: 'true' | 'false';
  };
  files: ArchiveFile[];
  reviews?: {
    reviewtitle?: string;
    reviewbody?: string;
    stars?: string;
    reviewdate?: string;
    reviewer?: string;
  }[];
  similars?: {
    [key: string]: {
      count: number;
      items: ArchiveItemSummary[];
    };
  };
}

export type WaybackResponse = [string, string][];
