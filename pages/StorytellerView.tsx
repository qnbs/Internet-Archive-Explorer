import React, { useState } from 'react';
import { SparklesIcon } from '../components/Icons';
import { useLanguage } from '../hooks/useLanguage';
// FIX: Correct import for geminiService from the new file
import { generateStory } from '../services/geminiService';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { sanitizeHtml } from '../utils/sanitizer';

const StorytellerView: React.FC = () => {
  const { t, language } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setStory('');

    try {
      const result = await generateStory(prompt, language);
      setStory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-page-fade-in">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-3">
            <SparklesIcon className="w-10 h-10" />
            {t('storyteller:title')}
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('storyteller:description')}</p>
      </header>
      
      <form onSubmit={handleGenerate} className="flex gap-4">
          <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={t('storyteller:promptPlaceholder')}
              className="flex-grow bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700/50 focus-within:border-cyan-500 rounded-lg py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-colors"
              disabled={isLoading}
          />
          <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex-shrink-0 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
              <SparklesIcon className="w-5 h-5 mr-2" />
              {isLoading ? t('storyteller:generating') : t('storyteller:generateButton')}
          </button>
      </form>

      <div className="p-6 bg-white dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 min-h-[300px] flex flex-col justify-center">
        {isLoading ? (
            <AILoadingIndicator type="story" />
        ) : error ? (
            <div className="text-center text-red-500 dark:text-red-400">
                <h3 className="font-bold text-lg mb-2">Error</h3>
                <p>{error}</p>
            </div>
        ) : story ? (
            <div 
              className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-wrap animate-fade-in"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(story.replace(/\n/g, '<br />')) }}
            />
        ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">{t('storyteller:initialMessage')}</p>
        )}
      </div>
    </div>
  );
};

export default StorytellerView;