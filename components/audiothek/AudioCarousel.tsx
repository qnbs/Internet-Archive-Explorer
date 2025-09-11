import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary } from '../../types';
import { searchArchive } from '../../services/archiveService';
import { ContentCarousel } from '../ContentCarousel';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../../hooks/useLanguage';

interface AudioCarouselProps {
  collection: {
    title: string;
    query: string;
  };
  onSelectItem: (item: ArchiveItemSummary) => void;
}

export const AudioCarousel: React.FC<AudioCarouselProps> = ({ collection, onSelectItem }) => {
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await searchArchive(collection.query, 1, ['-downloads'], undefined, 15);
            setItems(data.response?.docs || []);
        } catch (err) {
            console.error(`Failed to fetch ${collection.title}`, err);
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
        }
    }, [collection.query, collection.title, t]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return (
        <ContentCarousel
            title={collection.title}
            items={items}
            isLoading={isLoading}
            error={error}
            onRetry={fetchItems}
            onSelectItem={onSelectItem}
            cardAspectRatio="square"
        />
    );
};