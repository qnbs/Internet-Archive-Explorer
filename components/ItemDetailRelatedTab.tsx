import React from 'react';
import type { ArchiveMetadata } from '@/types';
import { RelatedItems } from './RelatedItems';

interface ItemDetailRelatedTabProps {
  metadata: ArchiveMetadata;
  currentItemIdentifier: string;
}

export const ItemDetailRelatedTab: React.FC<ItemDetailRelatedTabProps> = ({
  metadata,
  currentItemIdentifier,
}) => {
  return <RelatedItems metadata={metadata} currentItemIdentifier={currentItemIdentifier} />;
};
