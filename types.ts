import React from 'react';

// --- Core App State ---
export type View =
  | 'explore'
  | 'library'
  | 'myArchive'
  | 'uploaderHub'
  | 'uploaderDetail'
  | 'scriptorium'
  | 'movies'
  | 'audio'
  | 'image'
  | 'recroom'
  | 'settings'
  | 'help'
  | 'storyteller'
  | 'aiArchive';

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
  confirmLabel?: string;
  confirmClass?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface Command {
    id: string;
    section: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    action: () => void;
    keywords?: string;
}

// --- Archive.org API Types ---

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
  creator?: string | string[];
  publicdate: string;
  mediatype: MediaType;
  uploader?: string;
  'access-restricted-item'?: string;
  week?: number;
  downloads?: number;
  reviewdate?: string;
  reviewtitle?: string;
  reviewbody?: string;
}

export type SelectItemHandler = (item: ArchiveItemSummary) => void;


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
  source?: string;
  md5?: string;
}

export interface ArchiveMetadata {
  created: number;
  d1: string;
  d2: string;
  dir: string;
  files: ArchiveFile[];
  files_count: number;
  item_size: number;
  metadata: {
    identifier: string;
    title: string;
    description?: string | string[];
    creator?: string | string[];
    uploader?: string;
    publicdate: string;
    mediatype: MediaType;
    collection?: string[];
    licenseurl?: string;
    'access-restricted-item'?: string;
    [key: string]: any;
  };
  reviews: any[];
  server: string;
  uniq: number;
  workable_servers: string[];
}

export type WaybackResponse = [string, string][]; // [timestamp, originalUrl][]

// --- User Profiles & Uploaders ---
export type UploaderCategory = 'archivist' | 'institution' | 'music' | 'community' | 'software' | 'video' | 'history';

export interface Uploader {
  username: string;
  searchUploader: string;
  searchField?: 'scanner' | 'creator' | 'uploader';
  screenname?: string;
  descriptionKey: string;
  category: UploaderCategory;
  featured?: boolean;
  customDescriptionKey?: string;
}

export interface Profile {
  name: string;
  searchIdentifier: string;
  type: 'uploader' | 'creator';
  curatedData?: Uploader;
}

export interface UploaderStats {
  total: number;
  movies: number;
  audio: number;
  texts: number;
  image: number;
  software: number;
  collections: number;
  favorites: number;
  reviews: number;
}

export type UploaderTab = 'uploads' | 'collections' | 'favorites' | 'reviews' | 'posts' | 'webArchive';

// --- Settings ---
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'de';
export type AccentColor = 'cyan' | 'emerald' | 'rose' | 'violet';

export interface AppSettings {
  // Search & Discovery
  resultsPerPage: number;
  showExplorerHub: boolean;
  defaultSort: 'downloads' | 'week' | 'publicdate';
  rememberFilters: boolean;
  rememberSort: boolean;

  // Appearance
  layoutDensity: 'comfortable' | 'compact';
  disableAnimations: boolean;
  accentColor: AccentColor;

  // Content & Hubs
  defaultView: View;
  defaultUploaderDetailTab: UploaderTab;
  defaultDetailTabAll: 'description' | 'files' | 'related';
  openLinksInNewTab: boolean;
  autoplayMedia: boolean;

  // AI Features
  enableAiFeatures: boolean;
  autoArchiveAI: boolean;
  defaultAiTab: 'description' | 'ai';
  autoRunEntityExtraction: boolean;
  summaryTone: 'simple' | 'detailed' | 'academic';

  // Accessibility
  highContrastMode: boolean;
  underlineLinks: boolean;
  fontSize: 'sm' | 'base' | 'lg';
  scrollbarColor: string;
}

// --- Library / Favorites ---
export interface LibraryItem extends ArchiveItemSummary {
  notes: string;
  tags: string[];
  addedAt: number;
  collections: string[]; // collection IDs
}

export interface UserCollection {
  id: string;
  name: string;
  itemIdentifiers: string[];
}

export type LibraryFilter =
  | { type: 'all' }
  | { type: 'mediaType'; mediaType: MediaType }
  | { type: 'collection'; id: string }
  | { type: 'tag'; tag: string }
  | { type: 'untagged' };

// --- Scriptorium ---
export interface WorksetDocument extends ArchiveItemSummary {
  notes: string;
  worksetId: string;
}

export interface Workset {
  id: string;
  name: string;
  documents: WorksetDocument[];
}

// --- AI & Gemini ---
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

export interface AIArchiveEntry {
    id: string;
    type: AIGenerationType;
    content: string | ExtractedEntities | ImageAnalysisResult | MagicOrganizeResult;
    timestamp: number;
    language: Language;
    source?: ArchiveItemSummary & { mediaType?: MediaType };
    sources?: (ArchiveItemSummary & { mediaType?: MediaType })[];
    prompt?: string;
    tags: string[];
    userNotes?: string;
}

export type AIArchiveFilter =
  | { type: 'all' }
  | { type: 'generation'; generationType: AIGenerationType }
  | { type: 'language'; language: Language }
  | { type: 'tag'; tag: string };

// --- Search ---
export type Availability = 'all' | 'free' | 'borrowable';

export interface Facets {
  mediaType: Set<MediaType>;
  availability: Availability;
  collection?: string;
  yearStart?: number;
  yearEnd?: number;
  language?: string;
}

// --- Misc ---
export interface CategoryContent {
    mediaType: MediaType | string;
    title: string;
    description: string;
    collectionUrl?: string;
    contributors?: { name: string; role: string }[];
}
