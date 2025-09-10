import React from 'react';
import { SparklesIcon } from '../components/Icons';

export const StorytellerView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-page-fade-in">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-3">
            <SparklesIcon className="w-10 h-10" />
            Storyteller
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">An interactive storytelling experience powered by Gemini AI.</p>
      </header>
      <div className="p-10 bg-gray-200/50 dark:bg-gray-800/60 rounded-xl shadow-lg text-center border border-gray-300 dark:border-gray-700 border-dashed">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Coming Soon!</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
            This space is reserved for a future feature where you can generate and interact with stories based on items from the archive.
        </p>
      </div>
    </div>
  );
};