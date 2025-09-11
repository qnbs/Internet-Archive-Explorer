import React from 'react';

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
  | 'favorites'
  | 'settings'
  | 'help'
  | 'uploaderDetail'
  | 'uploaderProfile'
  | 'storyteller'
  // FIX: Added 'uploaderHub' to the View type to resolve navigation error.
  | 'uploaderHub';

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
  reviews?: ArchiveItemSummary[];
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
    searchField?: 'uploader' | 'creator' | 'scanner';
    screenname?: string;
    descriptionKey?: string;
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

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ConfirmationOptions {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmLabel?: string;
  confirmClass?: string;
}
export type Facets = {
    mediaType: Set<MediaType>;
    yearStart?: string;
    yearEnd?: string;
    collection?: string;
};
// FIX: Add SortKey and SortDirection types to be used for sorting favorites.
export type SortKey = 'dateAdded' | 'title';
export type SortDirection = 'asc' | 'desc';
export interface AppSettings {
    resultsPerPage: number;
    showExplorerHub: boolean;
    defaultUploaderDetailTab: 'uploads' | 'collections' | 'favorites';
    defaultAiTab: 'description' | 'ai';
    autoRunEntityExtraction: boolean;
    autoplayMedia: boolean;
    reduceMotion: boolean;
    enableAiFeatures: boolean;
}

export interface Profile {
  name: string;
  // The identifier used in API queries, e.g., 'jakej@archive.org' or 'Walt Disney'
  searchIdentifier: string; 
  type: 'uploader' | 'creator';
  // Optional, only for curated uploaders from our list
  curatedData?: Uploader;
}

export type UploaderTab = 'uploads' | 'collections' | 'favorites' | 'reviews' | 'posts' | 'webArchive';