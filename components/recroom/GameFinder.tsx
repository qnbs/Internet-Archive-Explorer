import React from 'react';
import { SparklesIcon } from '@/components/Icons';
import { useGameFinder } from '@/hooks/useGameFinder';
import { useLanguage } from '@/hooks/useLanguage';
import { RecRoomItemCard } from '../RecRoomItemCard';
import { Spinner } from '../Spinner';

const GameFinder: React.FC = () => {
  const { t } = useLanguage();
  const { query, setQuery, suggestions, isLoading, error, findGames } = useGameFinder();

  return (
    <div className="p-6 bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-accent-300 flex items-center gap-2">
        <SparklesIcon /> {t('recRoom:gameFinder.title')}
      </h2>
      <p className="mt-1 text-gray-200">{t('recRoom:gameFinder.description')}</p>

      <form onSubmit={findGames} className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('recRoom:gameFinder.placeholder')}
          className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="flex-shrink-0 flex items-center justify-center bg-accent-600 hover:bg-accent-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? <Spinner size="sm" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
          <span>
            {isLoading ? t('recRoom:gameFinder.loading') : t('recRoom:gameFinder.button')}
          </span>
        </button>
      </form>

      {(isLoading || error || suggestions.length > 0) && (
        <div className="mt-6">
          {error && <p className="text-center text-red-400">{error}</p>}
          {suggestions.length > 0 && !isLoading && (
            <>
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('recRoom:gameFinder.resultsTitle')}
              </h3>
              <div className="flex space-x-6 overflow-x-auto pb-4 scroll-smooth">
                {suggestions.map((item, index) => (
                  <RecRoomItemCard key={item.identifier} item={item} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GameFinder;
