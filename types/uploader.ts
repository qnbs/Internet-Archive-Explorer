export type UploaderTab =
  | 'uploads'
  | 'collections'
  | 'favorites'
  | 'reviews'
  | 'posts'
  | 'webArchive';

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
