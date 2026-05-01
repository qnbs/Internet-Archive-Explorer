import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import type { LibraryFilter } from '@/types';
import { AIRecommendations } from './AIRecommendations';
import { LibraryStats } from './LibraryStats';
import { RecentlyAdded } from './RecentlyAdded';

interface LibraryDashboardProps {
  setFilter: (filter: LibraryFilter) => void;
}

export const LibraryDashboard: React.FC<LibraryDashboardProps> = ({ setFilter }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-page-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('sideMenu:library')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Your personal space for collected items and insights.
        </p>
      </header>

      <LibraryStats setFilter={setFilter} />

      <RecentlyAdded />

      <AIRecommendations />
    </div>
  );
};
