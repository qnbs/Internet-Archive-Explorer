import React from 'react';

export const StorytellerView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-page-fade-in">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">Storyteller</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">An interactive storytelling experience powered by AI.</p>
      </header>
      <div className="p-6 bg-gray-200/50 dark:bg-gray-800/60 rounded-xl shadow-lg">
        <p className="text-center text-gray-700 dark:text-gray-300">Coming soon!</p>
      </div>
    </div>
  );
};
