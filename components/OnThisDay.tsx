import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary } from '../types';
import { useSearchAndGo } from '../hooks/useSearchAndGo';
import { useLanguage } from '../hooks/useLanguage';
import { searchArchive } from '../services/archiveService';
import { ContentCarousel } from './ContentCarousel';

export const OnThisDay: React.FC = () => {
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchAndGo = useSearchAndGo();
    const { t, language } = useLanguage();

    const today = new Date();
    const formattedDate = today.toLocaleDateString(language, { day: 'numeric', month: 'long' });
    
    const buildOnThisDayQuery = (): string => {
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const currentYear = today.getFullYear();
        const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
        const dateClauses = years.map(year => `publicdate:${year}-${month}-${day}`);
        return `(${dateClauses.join(' OR ')})`;
    };
    
    const fetchOnThisDay = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const query = buildOnThisDayQuery();
            const data: any = await searchArchive(query, 1, ['-downloads']);
            
            if (data && data.response && Array.isArray(data.response.docs)) {
                setItems(data.response.docs.slice(0, 15));
            } else {
                setItems([]);
            }
        } catch (err) {
            console.error("Failed to fetch 'On This Day' items:", err);
            setError(t('common:error'));
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchOnThisDay();
    }, [fetchOnThisDay]);

    const handleViewMore = () => {
        const query = buildOnThisDayQuery();
        searchAndGo(query);
    };

    if (items.length === 0 && !isLoading && !error) return null;

    return (
        <ContentCarousel
            title={t('explorer:onThisDay', { date: formattedDate })}
            items={items}
            isLoading={isLoading}
            error={error}
            onRetry={fetchOnThisDay}
            cardAspectRatio="portrait"
            viewMoreAction={handleViewMore}
            viewMoreLabel={t('common:viewMore')}
        />
    );
};