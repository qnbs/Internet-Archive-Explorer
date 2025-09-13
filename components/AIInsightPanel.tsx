import React, { useState, useEffect, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { aiArchiveAtom, addAIArchiveEntryAtom } from '../store/aiArchive';
import { autoArchiveAIAtom } from '../store/settings';
import { archiveAIGeneration, findArchivedDailyInsight } from '../services/aiPersistenceService';
import { useLanguage } from '../hooks/useLanguage';
import { AILoadingIndicator } from './AILoadingIndicator';
import { SparklesIcon } from './Icons';
import type { ArchiveItemSummary, AIGenerationType } from '../types';

interface AIInsightPanelProps {
    title: string;
    description: string;
    buttonLabel: string;
    items: ArchiveItemSummary[];
    generationFn: (titles: string[], language: string) => Promise<string>;
    generationType: AIGenerationType;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
    title,
    description,
    buttonLabel,
    items,
    generationFn,
    generationType
}) => {
    const [insight, setInsight] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { t, language } = useLanguage();
    const aiArchive = useAtomValue(aiArchiveAtom);
    const addAIEntry = useSetAtom(addAIArchiveEntryAtom);
    const autoArchive = useAtomValue(autoArchiveAIAtom);

    // Check for a cached insight when language, archive, or items change
    useEffect(() => {
        // A simple cache check based on the first item's ID and type for today.
        // This is a heuristic to avoid re-generating for the same set of "daily" items.
        const today = new Date().toDateString();
        const found = aiArchive.find(entry =>
            entry.type === generationType &&
            entry.language === language &&
            new Date(entry.timestamp).toDateString() === today
        );
        setInsight(found?.content as string || '');
        setError(null);
    }, [language, aiArchive, generationType]);

    const handleGenerate = useCallback(async () => {
        if (items.length === 0 || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const titles = items.map(item => item.title);
            const summary = await generationFn(titles, language);
            setInsight(summary);
            
            archiveAIGeneration({
                type: generationType,
                content: summary,
                language,
                prompt: `Item Titles: ${titles.join(', ')}`,
                sources: items.slice(0, 5) // Use top 5 items as sources
            }, addAIEntry, autoArchive);
            
        } catch (aiError) {
            console.error("AI insight generation failed:", aiError);
            setError(t('explorer:errorInsight'));
        } finally {
            setIsLoading(false);
        }
    }, [items, isLoading, language, t, addAIEntry, autoArchive, generationFn, generationType]);

    const renderContent = () => {
        if (insight) {
            return <p className="text-sm text-gray-300 leading-relaxed animate-fade-in">{insight}</p>;
        }
        if (isLoading) {
            return <AILoadingIndicator type="story" />;
        }
        if (error) {
            return (
                <div className="text-center space-y-3">
                    <p className="text-sm text-red-400 leading-relaxed">{error}</p>
                    <button onClick={handleGenerate} className="px-3 py-1.5 bg-accent-600 text-white text-sm font-semibold rounded-lg hover:bg-accent-500 transition-colors">
                        {t('common:retry')}
                    </button>
                </div>
            );
        }
        return (
            <div className="text-center space-y-3 pt-4">
                <p className="text-sm text-gray-400">{description}</p>
                <button
                    onClick={handleGenerate}
                    disabled={items.length === 0}
                    className="flex items-center justify-center mx-auto space-x-2 px-4 py-2 text-sm font-semibold bg-accent-600 hover:bg-accent-500 text-white rounded-lg transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-4 h-4" />
                    <span>{buttonLabel}</span>
                </button>
            </div>
        );
    };

    return (
        <section className="animate-fade-in">
             <div className="p-4 sm:p-6 bg-gray-800/60 rounded-xl shadow-sm border border-gray-700/50">
                <h3 className="font-bold text-lg text-white flex items-center mb-3">
                    <SparklesIcon className="w-5 h-5 mr-2 text-accent-500" />
                    {title}
                </h3>
                {renderContent()}
            </div>
        </section>
    );
};
