import React from 'react';
import { FilterIcon, SearchIcon } from '@/components/Icons';
import { useLanguage } from '@/hooks/useLanguage';
import { UPLOADER_CATEGORIES } from '@/pages/uploaderData';
import type { UploaderCategory } from '@/types';

interface UploaderHubSidebarProps {
  query: string;
  setQuery: (q: string) => void;
  category: UploaderCategory | 'all';
  setCategory: (c: UploaderCategory | 'all') => void;
}

export const UploaderHubSidebar: React.FC<UploaderHubSidebarProps> = ({
  query,
  setQuery,
  category,
  setCategory,
}) => {
  const { t } = useLanguage();

  return (
    <aside className="bg-white dark:bg-gray-800/60 p-5 rounded-xl border border-gray-200 dark:border-gray-700/50 space-y-6 sticky top-20">
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <FilterIcon className="h-5 w-5 text-accent-600 dark:text-accent-400" aria-hidden />
          {t('uploaderHub:filters.title')}
        </h3>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('uploaderHub:searchPlaceholder')}
            className="w-full bg-gray-100 dark:bg-gray-700/80 border-2 border-transparent focus-within:border-accent-500 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-colors"
            aria-label={t('uploaderHub:searchPlaceholder')}
          />
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          {t('uploaderHub:filters.categories')}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`touch-target-min rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${category === 'all' ? 'bg-gray-900 text-white shadow-sm ring-2 ring-accent-500 ring-offset-2 ring-offset-white dark:bg-gray-100 dark:text-gray-900 dark:ring-offset-gray-800' : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'}`}
          >
            {t('uploaderHub:categories.all')}
          </button>
          {UPLOADER_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setCategory(cat)}
              className={`touch-target-min rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${category === cat ? 'bg-gray-900 text-white shadow-sm ring-2 ring-accent-500 ring-offset-2 ring-offset-white dark:bg-gray-100 dark:text-gray-900 dark:ring-offset-gray-800' : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'}`}
            >
              {t(`uploaderHub:categories.${cat}`)}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
