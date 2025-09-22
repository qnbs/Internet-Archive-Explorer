import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary } from '../../types';
import { searchArchive } from '../../services/archiveService';
import { ContentCarousel } from './ContentCarousel';
import { useLanguage } from '../../hooks/useLanguage';

interface ArchivalCarouselProps {
  title: string;
  query: string;
}

export const ArchivalCarousel: React.FC<ArchivalCarouselProps> = ({ title, query }) => {
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await searchArchive(query, 1, ['-downloads'], undefined, 15);
            setItems(data.response?.docs || []);
        } catch (err) {
            console.error(`Failed to fetch ${title}`, err);
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
        }
    }, [query, title, t]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return (
        <ContentCarousel
            title={title}
            items={items}
            isLoading={isLoading}
            error={error}
            onRetry={fetchItems}
            cardAspectRatio="portrait"
        />
    );
};