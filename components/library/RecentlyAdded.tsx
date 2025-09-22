import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { libraryItemsAtom } from '../../store/favorites';
import { ContentCarousel } from '../ContentCarousel';
import { useLanguage } from '../../hooks/useLanguage';
import { StarIcon } from '../Icons';
import type { LibraryItem } from '../../types';

export const RecentlyAdded: React.FC = () => {
    const { t } = useLanguage();
    const allItems = useAtomValue(libraryItemsAtom);

    const recentItems = useMemo(() => {
        // FIX: Explicitly type the result of Object.values to ensure 'addedAt' property is recognized.
        return (Object.values(allItems) as LibraryItem[])
            .sort((a, b) => b.addedAt - a.addedAt)
            .slice(0, 15);
    }, [allItems]);

    if (recentItems.length === 0) {
        return null;
    }

    return (
        <ContentCarousel
            title="Recently Added"
            // FIX: The type cast above ensures recentItems is LibraryItem[], which is compatible with ArchiveItemSummary[].
            items={recentItems}
            isLoading={false}
            error={null}
            cardAspectRatio="portrait"
            titleIcon={<StarIcon />}
        />
    );
};