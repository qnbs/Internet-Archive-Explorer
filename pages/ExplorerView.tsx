import React, { useState, useEffect, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { searchQueryAtom, facetsAtom } from '../store/search';
import { showExplorerHubAtom, autoArchiveAIAtom } from '../store/settings';
import { AIGenerationType, type ArchiveItemSummary } from '../types';
import { ResultsGrid } from '../components/ResultsGrid';
import { useLanguage } from '../hooks/useLanguage';
import { OnThisDay } from '../components/OnThisDay';
import { TrendingIcon, SparklesIcon } from '../components/Icons';
import { ContentCarousel } from '../components/ContentCarousel';
import { useExplorerSearch } from '../hooks/useExplorerSearch';
import { generateDailyHistoricalEvent } from '../services/geminiService';
import { AILoadingIndicator } from '../components/AILoadingIndicator';
import { findArchivedDailyInsight, archiveAIGeneration } from '../services/aiPersistenceService';
import { aiArchiveAtom, addAIArchiveEntryAtom } from '../store/aiArchive';
import { searchArchive } from '../services/archiveService';
import { toastAtom } from '../store/atoms';

interface ExplorerViewProps {}

const TrendingItems: React.FC = () => {
    // States for the carousel
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // States for the insight panel
    const [historicalSummary, setHistoricalSummary] = useState<string>('');
    const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    
    const { t, language } = useLanguage();
    const aiArchive = useAtomValue(aiArchiveAtom);
    const addAIEntry = useSetAtom(addAIArchiveEntryAtom);
    const setToast = useSetAtom(toastAtom);
    const autoArchive = useAtomValue(autoArchiveAIAtom);

    const fetchTrendingItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await searchArchive('', 1, ['-week']);
            const trendingItems = data.response?.docs.slice(0, 15) || [];
            setItems(trendingItems);
        } catch (err) {
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    // Fetch trending items once on mount
    useEffect(() => {
        fetchTrendingItems();
    }, [fetchTrendingItems]);

    // Check for cached insight when language or archive changes
    useEffect(() => {
        const archivedInsight = findArchivedDailyInsight(language, aiArchive);
        setHistoricalSummary(archivedInsight || '');
        setSummaryError(null);
    }, [language, aiArchive]);

    const handleGenerateInsight = useCallback(async () => {
        if (items.length === 0 || isGeneratingInsight) return;

        setIsGeneratingInsight(true);
        setSummaryError(null);

        try {
            const titles = items.map(item => item.title);
            const summary = await generateDailyHistoricalEvent(titles, language);
            setHistoricalSummary(summary);
            if(autoArchive) {
                archiveAIGeneration({
                    type: AIGenerationType.DailyInsight,
                    content: summary,
                    language,
                    prompt: `Item Titles: ${titles.join(', ')}`,
                    sources: items.slice(0, 5) // Use top 5 items as sources
                }, addAIEntry, autoArchive);
                setToast({ type: 'success', message: t('aiArchive:insightGenerated') });
            }
        } catch (aiError) {
            console.error("AI summary generation failed:", aiError);
            setSummaryError(t('explorer:errorInsight'));
        } finally {
            setIsGeneratingInsight(false);
        }
    }, [items, isGeneratingInsight, language, t, addAIEntry, setToast, autoArchive]);

    const renderInsightContent = () => {
        if (historicalSummary) {
            return (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed animate-fade-in">
                    {historicalSummary}
                </p>
            );
        }
        if (isGeneratingInsight) {
            return <AILoadingIndicator type="story" />;
        }
        if (summaryError) {
            return (
                <div className="text-center space-y-3">
                    <p className="text-sm text-red-500 dark:text-red-400 leading-relaxed">
                        {summaryError}
                    </p>
                    <button onClick={handleGenerateInsight} className="px-3 py-1.5 bg-accent-600 text-white text-sm font-semibold rounded-lg hover:bg-accent-500 transition-colors">
                        {t('common:retry')}
                    </button>
                </div>
            );
        }
        return (
            <div className="text-center space-y-3 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('explorer:generateInsightPrompt')}
                </p>
                <button
                    onClick={handleGenerateInsight}
                    disabled={items.length === 0}
                    className="flex items-center justify-center mx-auto space-x-2 px-4 py-2 text-sm font-semibold bg-accent-600 hover:bg-accent-500 text-white rounded-lg transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-4 h-4" />
                    <span>{t('explorer:generateInsightButton')}</span>
                </button>
            </div>
        );
    };

    return (
        <section className="animate-fade-in" role="region" aria-label={t('explorer:trending')}>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <TrendingIcon className="mr-3 text-accent-600 dark:text-accent-400" />
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
                        onRetry={fetchTrendingItems}
                        cardAspectRatio="portrait"
                        hideTitle={true}
                    />
                </div>
                <div className="lg:col-span-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center mb-3">
                        <SparklesIcon className="w-5 h-5 mr-2 text-accent-500" />
                        {t('explorer:dailyInsight')}
                    </h3>
                    {renderInsightContent()}
                </div>
            </div>
        </section>
    );
};

const ExplorerView: React.FC<ExplorerViewProps> = () => {
    const [searchQuery] = useAtom(searchQueryAtom);
    const { results, isLoading, isLoadingMore, error, totalResults, hasMore, lastElementRef, handleRetry } = useExplorerSearch();
    const showHub = useAtomValue(showExplorerHubAtom);
    const [facets] = useAtom(facetsAtom);
    
    const hasActiveSearch = searchQuery.trim().length > 0 || facets.mediaType.size > 0 || !!facets.collection || !!facets.yearStart || !!facets.yearEnd || facets.availability !== 'all' || !!facets.language;


    if (showHub && !hasActiveSearch) {
        return (
            <div className="space-y-12">
                <TrendingItems />
                <OnThisDay />
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