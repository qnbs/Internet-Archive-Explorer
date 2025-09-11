import React from 'react';
import { SparklesIcon } from '../components/Icons';
import { useLanguage } from '../hooks/useLanguage';

export const StorytellerView: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-page-fade-in">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-3">
            <SparklesIcon className="w-10 h-10" />
            {t('storyteller:title')}
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('storyteller:description')}</p>
      </header>
      <div className="p-10 bg-gray-200/50 dark:bg-gray-800/60 rounded-xl shadow-lg text-center border border-gray-300 dark:border-gray-700 border-dashed">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{t('storyteller:comingSoon')}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('storyteller:comingSoonDesc')}
        </p>
      </div>
    </div>
  );
};