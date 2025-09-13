import React, { useState, useEffect, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { searchQueryAtom, facetsAtom } from '../store/search';
import { showExplorerHubAtom } from '../store/settings';
import { useDebounce } from '../hooks/useDebounce';
import { searchArchive } from '../services/archiveService';
import { AIGenerationType, type ArchiveItemSummary } from '../types';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { ResultsGrid } from '../components/ResultsGrid';
import { useLanguage } from '../hooks/useLanguage';
import { OnThisDay } from '../components/OnThisDay';
import { TrendingIcon, SparklesIcon } from '../components/Icons';
import { ContentCarousel } from '../components/ContentCarousel';
import { useExplorerSearch } from '../hooks/useExplorerSearch';
import { generateDailyHistoricalEvent } from '../services/geminiService';
import { Spinner } from '../components/Spinner';
import { findArchivedDailyInsight, archiveAIGeneration } from '../services/aiPersistenceService';
import { aiArchiveAtom, addAIArchiveEntryAtom } from '../store/aiArchive';

interface ExplorerViewProps {
  onSelectItem: (item: ArchiveItemSummary) => void;
}

const TrendingItems: React.FC<{ onSelectItem: (item: ArchiveItemSummary) => void }> = ({ onSelectItem }) => {
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [historicalSummary, setHistoricalSummary] = useState<string>('');
    const [isSummarizing, setIsSummarizing] = useState(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const { t, language } = useLanguage();
    const aiArchive = useAtomValue(aiArchiveAtom);
    const addAIEntry = useSetAtom(addAIArchiveEntryAtom);

    const fetchTrendingAndInsight = useCallback(async () => {
        setIsLoading(true);
        setIsSummarizing(true);
        setError(null);
        setSummaryError(null);
        setHistoricalSummary('');

        const archivedInsight = findArchivedDailyInsight(language, aiArchive);
        if (archivedInsight) {
            setHistoricalSummary(archivedInsight);
            setIsSummarizing(false);
        }

        try {
            const data = await searchArchive('', 1, ['-week']);
            const trendingItems = data.response?.docs.slice(0, 15) || [];
            setItems(trendingItems);
            
            if (!archivedInsight && trendingItems.length > 0) {
                try {
                    const titles = trendingItems.map(item => item.title);
                    const summary = await generateDailyHistoricalEvent(titles, language);
                    setHistoricalSummary(summary);
                    archiveAIGeneration({
                        type: AIGenerationType.DailyInsight,
                        content: summary,
                        language,
                        prompt: `Item Titles: ${titles.join(', ')}`
                    }, addAIEntry);
                } catch (aiError) {
                    console.error("AI summary generation failed:", aiError);
                    setSummaryError(t('explorer:errorInsight'));
                }
            }
        } catch (err) {
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
            if(archivedInsight) setIsSummarizing(false);
        }
    }, [t, language, aiArchive, addAIEntry]);

    useEffect(() => {
        fetchTrendingAndInsight();
    }, [fetchTrendingAndInsight]);

    return (
        <section className="animate-fade-in" role="region" aria-label={t('explorer:trending')}>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <TrendingIcon className="mr-3 text-cyan-600 dark:text-cyan-400" />
                    {t('explorer:trending')}
                </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                     <ContentCarousel
                        title={t('explorer:trending')}
                        items={items}
                        isLoading={isLoading}
                        error={error}
                        onRetry={fetchTrendingAndInsight}
                        onSelectItem={onSelectItem}
                        cardAspectRatio="portrait"
                        hideTitle={true}
                    />
                </div>
                <div className="lg:col-span-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center mb-3">
                        <SparklesIcon className="w-5 h-5 mr-2 text-cyan-500" />
                        {t('explorer:dailyInsight')}
                    </h3>
                    {isSummarizing ? (
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
                             <Spinner size="sm" />
                             <span>{t('explorer:generatingInsight')}</span>
                        </div>
                    ) : summaryError ? (
                         <p className="text-sm text-red-500 dark:text-red-400 leading-relaxed">
                            {summaryError}
                        </p>
                    ) : historicalSummary ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {historicalSummary}
                        </p>
                    ) : !isLoading && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                           {t('explorer:noInsight')}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

const ExplorerView: React.FC<ExplorerViewProps> = ({ onSelectItem }) => {
    const [searchQuery] = useAtom(searchQueryAtom);
    const { results, isLoading, isLoadingMore, error, totalResults, hasMore, lastElementRef, handleRetry } = useExplorerSearch();
    const showHub = useAtomValue(showExplorerHubAtom);
    const [facets] = useAtom(facetsAtom);
    
    const hasActiveSearch = searchQuery.trim().length > 0 || facets.mediaType.size > 0 || !!facets.collection || !!facets.yearStart || !!facets.yearEnd || facets.availability !== 'all' || !!facets.language;


    if (showHub && !hasActiveSearch) {
        return (
            <div className="space-y-12">
                <TrendingItems onSelectItem={onSelectItem} />
                <OnThisDay onSelectItem={onSelectItem} />
            </div>
        );
    }

    return (
        <div>
            <ResultsGrid
                results={results}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                error={error}
                onSelectItem={onSelectItem}
                hasMore={hasMore}
                totalResults={totalResults}
                lastElementRef={lastElementRef}
                onRetry={handleRetry}
                searchQuery={searchQuery}
            />
        </div>
    );
};

export default ExplorerView;