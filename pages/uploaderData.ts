import type { Uploader, UploaderCategory } from '../types';

// FIX: Export UPLOADER_CATEGORIES to fix import error in UploaderHubView.tsx.
export const UPLOADER_CATEGORIES: UploaderCategory[] = [
  'archivist',
  'institution',
  'music',
  'community',
  'software',
  'video',
  'history'
];

export const UPLOADER_DATA: Uploader[] = [
  {
    username: 'The Internet Archive',
    searchUploader: 'internetarchive@archive.org',
    screenname: 'internet_archive',
    descriptionKey: 'uploaders:internet_archive.description',
    category: 'institution',
    featured: true,
  },
  {
    username: 'Jeff Kaplan',
    searchUploader: 'associate-jeff-kaplan@archive.org',
    screenname: 'jeff_kaplan',
    descriptionKey: 'uploaders:jeff_kaplan.description',
    category: 'software',
    featured: true,
  },
  {
    username: 'jakej',
    searchUploader: 'jakej@archive.org',
    screenname: 'jakej',
    descriptionKey: 'uploaders:jakej.description',
    category: 'community',
  },
  {
    username: 'Lego Archive Account',
    searchUploader: 'The LEGO Archive',
    searchField: 'scanner',
    descriptionKey: 'uploaders:lego_archive.description',
    category: 'history',
  },
  {
    username: 'jvaneerden',
    searchUploader: 'jvaneerden@archive.org',
    screenname: 'jvaneerden',
    descriptionKey: 'uploaders:jvaneerden.description',
    category: 'music',
  },
  {
    username: 'LibriVox',
    searchUploader: 'librivox-api@archive.org',
    descriptionKey: 'uploaders:librivox.description',
    category: 'community',
  }
];