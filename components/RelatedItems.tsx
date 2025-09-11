

import React, { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary, ArchiveMetadata } from '../types';
import { searchArchive } from '../services/archiveService';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';
import { ContentCarousel } from './ContentCarousel';

interface RelatedItemsProps {
  metadata: ArchiveMetadata;
  currentItemIdentifier: string;
  onSelectItem: (item: ArchiveItemSummary) => void;
}

export const RelatedItems: React.FC<RelatedItemsProps> = ({ metadata, currentItemIdentifier, onSelectItem }) => {
    const [related, setRelated] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    const fetchRelated = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setRelated([]);
        let query = '';
        const primaryCollection = metadata.metadata.collection?.[0];
        
        if (primaryCollection) {
            query = `collection:("${primaryCollection}")`;
        } else if (metadata.metadata.creator) {
            const creator = Array.isArray(metadata.metadata.creator) ? metadata.metadata.creator[0] : metadata.metadata.creator;
            query = `creator:("${creator}")`;
        }

        if (!query) {
            setIsLoading(false);
            return;
        }

        try {
            const data = await searchArchive(query, 1, ['-downloads']);
            if (data && data.response && Array.isArray(data.response.docs)) {
                // Filter out the current item itself and limit to 10 results
                const filteredResults = data.response.docs
                    .filter(doc => doc.identifier !== currentItemIdentifier)
                    .slice(0, 10);
                setRelated(filteredResults);
            } else {
                setRelated([]);
            }
        } catch (err) {
            console.error("Failed to fetch related items:", err);
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
        }
    }, [metadata, currentItemIdentifier, t]);

    useEffect(() => {
        fetchRelated();
    }, [fetchRelated]);


    if (!isLoading && related.length === 0 && !error) {
        return null; // Don't show the section if there are no related items
    }

    return (
        <ContentCarousel
            title={t('common:similarItems')}
            items={related}
            isLoading={isLoading}
            error={error}
            onRetry={fetchRelated}
            onSelectItem={onSelectItem}
            cardAspectRatio="portrait"
        />
    );
};