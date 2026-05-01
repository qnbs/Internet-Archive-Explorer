import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';
import { StarIcon } from '@/components/Icons';
import { libraryItemsAtom } from '@/store/favorites';
import type { LibraryItem } from '@/types';
import { ContentCarousel } from '../ContentCarousel';

export const RecentlyAdded: React.FC = () => {
  const allItems = useAtomValue(libraryItemsAtom);

  const recentItems = useMemo(() => {
    const items: LibraryItem[] = Object.values(allItems);
    return items.sort((a, b) => b.addedAt - a.addedAt).slice(0, 15);
  }, [allItems]);

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <ContentCarousel
      title="Recently Added"
      items={recentItems}
      isLoading={false}
      error={null}
      cardAspectRatio="portrait"
      titleIcon={<StarIcon />}
    />
  );
};
