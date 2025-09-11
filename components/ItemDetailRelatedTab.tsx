import React from 'react';
import type { ArchiveItemSummary, ArchiveMetadata } from '../types';
import { RelatedItems } from './RelatedItems';

interface ItemDetailRelatedTabProps {
    metadata: ArchiveMetadata;
    currentItemIdentifier: string;
    onSelectItem: (item: ArchiveItemSummary) => void;
}

export const ItemDetailRelatedTab: React.FC<ItemDetailRelatedTabProps> = ({ metadata, currentItemIdentifier, onSelectItem }) => {
    return (
        <RelatedItems 
            metadata={metadata} 
            currentItemIdentifier={currentItemIdentifier} 
            onSelectItem={onSelectItem} 
        />
    );
};
