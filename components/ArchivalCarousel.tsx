import React from 'react';
import { CacheAgeIndicator } from '@/components/ui/CacheAgeIndicator';
import { useArchivalItems } from '@/hooks/useArchivalItems';
import { ContentCarousel } from './ContentCarousel';

interface ArchivalCarouselProps {
  title: string;
  query: string;
  limit?: number;
}

export const ArchivalCarousel: React.FC<ArchivalCarouselProps> = ({ title, query, limit = 15 }) => {
  const { items, isLoading, error, refetch, offlineCachedAt } = useArchivalItems(query, limit);

  return (
    <ContentCarousel
      title={title}
      items={items}
      isLoading={isLoading}
      error={error}
      onRetry={() => {
        void refetch();
      }}
      cardAspectRatio="portrait"
      headerAddon={
        offlineCachedAt ? <CacheAgeIndicator cacheTimeMs={offlineCachedAt} /> : undefined
      }
    />
  );
};
