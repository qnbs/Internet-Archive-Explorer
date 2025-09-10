

export type Language = 'en' | 'de';
export type Theme = 'light' | 'dark' | 'system';

export enum MediaType {
  Audio = 'audio',
  Texts = 'texts',
  Movies = 'movies',
  Software = 'software',
  Image = 'image',
  Data = 'data',
  Web = 'web',
  Collection = 'collection',
  Account = 'account',
}

export type View =
  | 'explore'
  | 'scriptorium'
  | 'image'
  | 'movies'
  | 'audio'
  | 'recroom'
  | 'web'
  | 'favorites'
  | 'settings'
  | 'help'
  | 'uploaders'
  | 'uploaderDetail'
  | 'storyteller';

export interface ArchiveItemSummary {
  identifier: string;
  title: string;
  creator?: string | string[];
  publicdate: string;
  mediatype: MediaType;
  uploader?: string;
  week?: number;
  downloads?: number;
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
  format: string;
  size?: string;
  length?: string;
  source?: string;
  md5?: string;
  sha1?: string;
}

export interface ArchiveMetadata {
  metadata: {
    identifier: string;
    title: string;
    creator?: string | string[];
    description?: string | string[];
    publicdate: string;
    uploader?: string;
    collection?: string[];
    mediatype: MediaType;
    licenseurl?: string;
    [key: string]: any;
  };
  files: ArchiveFile[];
  reviews?: any[];
  [key: string]: any;
}

export type WaybackResult = [string, string];
export type WaybackResponse = WaybackResult[];

export interface ExtractedEntities {
    people: string[];
    places: string[];
    organizations: string[];
    dates: string[];
}

export interface WorksetDocument extends ArchiveItemSummary {
    notes: string;
}

export interface Workset {
    id: string;
    name: string;
    documents: WorksetDocument[];
}

export interface CategoryContent {
  title: string;
  mediaType: MediaType | string;
  description: string;
  collectionUrl?: string;
  contributors?: { name: string; role: string }[];
}

export type UploaderCategory = 
  | 'archivist'
  | 'institution'
  | 'music'
  | 'community'
  | 'software'
  | 'video'
  | 'history';

export interface Uploader {
    username: string;
    searchUploader: string;
    screenname?: string;
    descriptionKey: string;
    customDescriptionKey?: string;
    category: UploaderCategory;
    featured?: boolean;
}

export interface UploaderStats {
    total: number;
    movies: number;
    audio: number;
    texts: number;
    image: number;
    software: number;
}

export interface Command {
  id: string;
  section: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string;
}