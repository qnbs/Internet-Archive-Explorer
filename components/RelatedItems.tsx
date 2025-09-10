import React, { useState, useEffect } from 'react';
import type { ArchiveItemSummary, ArchiveMetadata } from '../types';
import { searchArchive } from '../services/archiveService';
import { useLanguage } from '../contexts/LanguageContext';
import { ContentCarousel } from './ContentCarousel';

interface RelatedItemsProps {
  metadata: ArchiveMetadata;
  currentItemIdentifier: string;
  onSelectItem: (item: ArchiveItemSummary) => void;
}

export const RelatedItems: React.FC<RelatedItemsProps> = ({ metadata, currentItemIdentifier, onSelectItem }) => {
    const [related, setRelated] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchRelated = async () => {
            setIsLoading(true);
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
            } catch (error) {
                console.error("Failed to fetch related items:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRelated();
    }, [metadata, currentItemIdentifier]);

    if (!isLoading && related.length === 0) {
        return null; // Don't show the section if there are no related items
    }

    return (
        <ContentCarousel
            title={t('common.similarItems')}
            items={related}
            isLoading={isLoading}
            onSelectItem={onSelectItem}
            cardAspectRatio="portrait"
        />
    );
};