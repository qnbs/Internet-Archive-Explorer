import React, { useState, useEffect } from 'react';
import type { ArchiveItemSummary } from '../types';
import { useSearch } from '../contexts/SearchContext';
import { useLanguage } from '../contexts/LanguageContext';
import { searchArchive } from '../services/archiveService';
import { ContentCarousel } from './ContentCarousel';

export const OnThisDay: React.FC<{ onSelectItem: (item: ArchiveItemSummary) => void }> = ({ onSelectItem }) => {
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { searchAndGo } = useSearch();
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

    useEffect(() => {
        const fetchOnThisDay = async () => {
            setIsLoading(true);
            try {
                const query = buildOnThisDayQuery();
                const data: any = await searchArchive(query, 1, ['-downloads']);
                
                if (data && data.response && Array.isArray(data.response.docs)) {
                    setItems(data.response.docs.slice(0, 15));
                } else {
                    setItems([]);
                }
            } catch (error) {
                console.error("Failed to fetch 'On This Day' items:", error);
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOnThisDay();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleViewMore = () => {
        const query = buildOnThisDayQuery();
        searchAndGo(query);
    };

    if (items.length === 0 && !isLoading) return null;

    return (
        <ContentCarousel
            title={t('explorer.onThisDay', { date: formattedDate })}
            items={items}
            isLoading={isLoading}
            onSelectItem={onSelectItem}
            cardAspectRatio="portrait"
            viewMoreAction={handleViewMore}
            viewMoreLabel={t('explorer.viewMore')}
        />
    );
};
