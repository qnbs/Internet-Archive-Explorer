
import { MediaType, CategoryContent } from '../types';

const parseContributors = (text: string): { name: string; role: string }[] => {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const contributors: { name: string; role: string }[] = [];
  // Assumes a 3-line pattern: name, repeated name, role
  for (let i = 0; i < lines.length; i += 3) {
    if (lines[i] && lines[i+2]) {
      contributors.push({ name: lines[i], role: lines[i+2] });
    } else if (lines[i] && lines[i+1]) {
        // Fallback for 2-line pattern
        contributors.push({ name: lines[i], role: lines[i+1] });
    }
  }
  return contributors;
};

export const getCategoryContent = (t: (key: string) => string): Record<string, CategoryContent> => ({
  recroom: {
    title: t('recRoom.title'),
    mediaType: MediaType.Software,
    collectionUrl: 'https://archive.org/details/software?tab=collection',
    description: t('recRoom.description'),
    contributors: [], // Contributors removed for simplicity of i18n
  },
  web: {
      title: t('webArchive.title'),
      mediaType: 'web',
      description: t('webArchive.description'),
  }
});
