import { MediaType, CategoryContent } from '../types';

// This file is now simplified as most content is managed within specific view components
// or fetched from translation files.
// It can still be used for static content that needs to be shared.

export const getCategoryContent = (t: (key: string) => string): Record<string, CategoryContent> => ({
  web: {
      title: t('webArchive:title'),
      mediaType: 'web',
      description: t('webArchive:description'),
  }
  // Other static category definitions could go here if needed
});