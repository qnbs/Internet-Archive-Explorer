import React, { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { libraryItemsAtom } from '../../store/favorites';
import { ContentCarousel } from '../ContentCarousel';
import { useLanguage } from '../../hooks/useLanguage';
import { StarIcon } from '../Icons';

export const RecentlyAdded: React.FC = () => {
    const { t } = useLanguage();
    const allItems = useAtomValue(libraryItemsAtom);

    const recentItems = useMemo(() => {
        return Object.values(allItems)
            .sort((a, b) => b.addedAt - a.addedAt)
            .slice(0, 15);
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