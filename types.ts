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
  | 'aiArchive'
  | 'webArchive';

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
  'access-restricted-item'?: 'true' | 'false';
  downloads?: number;
  week?: number;
  avg_rating?: string;
  // Fix: Add optional properties for review data.
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
        }
    };
}

export type WaybackResponse = [string, string][];

// --- Application-Specific Types ---

export interface LibraryItem extends ArchiveItemSummary {
    notes: string;
    tags: string[];
    addedAt: number;
    collections: string[];
}

export interface WorksetDocument extends ArchiveItemSummary {
    notes: string;
    worksetId: string;
}

export interface Workset {
    id: string;
    name: string;
    documents: WorksetDocument[];
}

export type UploaderTab = 'uploads' | 'collections' | 'favorites' | 'reviews' | 'posts' | 'webArchive';

export type UploaderCategory = 'archivist' | 'institution' | 'music' | 'community' | 'software' | 'video' | 'history';

export interface Uploader {
  username: string;
  screenname?: string;
  searchUploader: string;
  searchField?: 'uploader' | 'creator' | 'scanner';
  descriptionKey: string;
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
    collections: number;
    favorites: number;
    reviews: number;
}
export interface Profile {
  name: string;
  searchIdentifier: string;
  type: 'uploader' | 'creator';
  curatedData?: Uploader;
}

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'de';

export type SelectItemHandler = (item: ArchiveItemSummary) => void;

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

export type LibraryFilter =
  | { type: 'all' }
  | { type: 'untagged' }
  | { type: 'collection'; id: string }
  | { type: 'tag'; tag: string };

export interface UserCollection {
    id: string;
    name: string;
    itemIdentifiers: string[];
}

export type AIArchiveFilter =
  | { type: 'all' }
  | { type: 'generation'; generationType: AIGenerationType }
  | { type: 'language'; language: Language }
  | { type: 'tag'; tag: string };
  
export type AIArchiveSortOption = 'timestamp_desc' | 'timestamp_asc' | 'type_asc';