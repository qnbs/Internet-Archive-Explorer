

import React, { useState, useCallback, useEffect } from 'react';
import { getSummary, extractEntities } from '../../services/geminiService';
import { AIGenerationType, type ExtractedEntities, type ArchiveItemSummary } from '../../types';
import { useSearchAndGo } from '../../hooks/useSearchAndGo';
import { useLanguage } from '../../hooks/useLanguage';
import { useAtomValue, useSetAtom } from 'jotai';
import { autoRunEntityExtractionAtom, summaryToneAtom, autoArchiveAIAtom } from '../../store/settings';
import { SparklesIcon, TagIcon, InfoIcon } from './Icons';
import { AILoadingIndicator } from './AILoadingIndicator';
import { Spinner } from './Spinner';
import { findArchivedItemAnalysis, archiveAIGeneration } from '../services/aiPersistenceService';
import { aiArchiveAtom, addAIArchiveEntryAtom } from '../store/aiArchive';
import { toastAtom } from '../store/atoms';

interface AIToolsTabProps {
    item: ArchiveItemSummary;
    textContent: string | null;
    isLoadingText: boolean;
    textError: string | null;
    onClose: () => void;
}

export const AIToolsTab: React.FC<AIToolsTabProps> = ({ item, textContent, isLoadingText, textError, onClose }) => {
    const [summary, setSummary] = useState<string>('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const [entities, setEntities] = useState<ExtractedEntities | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [entityError, setEntityError] = useState<string | null>(null);
    
    const searchAndGo = useSearchAndGo();
    const { t, language } = useLanguage();
    const autoRunEntityExtraction = useAtomValue(autoRunEntityExtractionAtom);
    const summaryTone = useAtomValue(summaryToneAtom);
    const autoArchive = useAtomValue(autoArchiveAIAtom);
    const aiArchive = useAtomValue(aiArchiveAtom);
    const addAIEntry = useSetAtom(addAIArchiveEntryAtom);
    const setToast = useSetAtom(toastAtom);

    const handleGenerateSummary = useCallback(async () => {
        if (!textContent) return;
        setIsSummarizing(true);
        setSummaryError(null);
        setSummary('');

        const archiveOptions = { tone: summaryTone };
        const archivedSummary = findArchivedItemAnalysis<string>(item.identifier, AIGenerationType.Summary, aiArchive, archiveOptions);
        if (archivedSummary) {
            setSummary(archivedSummary);
            setIsSummarizing(false);
            return;
        }

        try {
            if (textContent.length < 250) {
                 setSummaryError(t('aiTools:summaryErrorShort'));
                 setIsSummarizing(false);
                 return;
            }
            const generatedSummary = await getSummary(textContent, language, summaryTone);
            setSummary(generatedSummary);
            archiveAIGeneration({
                type: AIGenerationType.Summary,
                content: generatedSummary,
                language: language,
                source: item,
                prompt: JSON.stringify(archiveOptions),
            }, addAIEntry, autoArchive);
        } catch (err) {
            // FIX: Use `instanceof Error` for type-safe error handling.
            setSummaryError(err instanceof Error ? err.message : t('aiTools:summaryErrorApi'));
        } finally {
            setIsSummarizing(false);
        }
    }, [textContent, language, summaryTone, t, item, aiArchive, addAIEntry, autoArchive]);
    
    const handleExtractEntities = useCallback(async () => {
        if (!textContent || isExtracting) return;
        setIsExtracting(true);
        setEntityError(null);

        const archivedEntities = findArchivedItemAnalysis<ExtractedEntities>(item.identifier, AIGenerationType.Entities, aiArchive);
        if (archivedEntities) {
            setEntities(archivedEntities);
            setIsExtracting(false);
            return;
        }

        try {
            const result = await extractEntities(textContent, language);
            setEntities(result);
            archiveAIGeneration({
                type: AIGenerationType.Entities,
                content: result,
                language: language,
                source: item,
            }, addAIEntry, autoArchive);
        } catch (err) {
            // FIX: Corrected copy-paste error using entityErrorApi instead of summaryErrorApi.
            setEntityError(err instanceof Error ? err.message : t('aiTools:entityErrorApi'));
        } finally {
            setIsExtracting(false);
        }
    }, [textContent, isExtracting, language, t, item, aiArchive, addAIEntry, autoArchive]);
    
    useEffect(() => {
        if (autoRunEntityExtraction && textContent && !entities && !isExtracting) {
            handleExtractEntities();
        }
    }, [autoRunEntityExtraction, textContent, entities, isExtracting, handleExtractEntities]);

    const handleEntityClick = (entity: string) => {
        searchAndGo(`"${entity}"`);
        onClose();
    };

    const EntitySection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
        if (!items || items.length === 0) return null;
        return (
            <div>
                <h4 className="font-semibold text-gray-300 mb-2">{title}</h4>
                <div className="flex flex-wrap gap-2">
                    {items.map((e, i) => (
                        <button key={`${title}-${i}`} onClick={() => handleEntityClick(e)} className="bg-gray-700 hover:bg-accent-600 text-gray-200 hover:text-white text-xs font-medium px-2 py-1 rounded-full transition-colors">
                            {e}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    if (isLoadingText) {
        return <div className="flex justify-center items-center h-40"><Spinner /></div>;
    }

    if (textError || !textContent) {
        return (
             <div className="flex items-center justify-center h-40 text-center text-red-400">
                <p>{textError || t('common:error')}</p>
            </div>
        );
    }
    
    const ErrorDisplay: React.FC<{ error: string | null; onRetry: () => void; }> = ({ error, onRetry }) => {
        if (!error) return null;
        return (
            <div className="flex flex-col items-center justify-center space-y-2 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start space-x-2 text-center">
                    <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
                <button onClick={onRetry} className="px-3 py-1 bg-accent-600 text-white text-xs font-semibold rounded-lg hover:bg-accent-500 transition-colors">
                    {t('common:retry')}
                </button>
            </div>
        );
    };


    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-lg font-semibold text-accent-400 flex items-center"><SparklesIcon className="w-5 h-5 mr-2" /> {t('aiTools:summaryTitle')}</h3>
                    <button onClick={handleGenerateSummary} disabled={isSummarizing || !textContent} className="flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                        <span>{isSummarizing ? t('aiTools:generating') : t('aiTools:generate')}</span>
                    </button>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 min-h-[100px]">
                    {isSummarizing && <AILoadingIndicator type="summary" />}
                    <ErrorDisplay error={summaryError} onRetry={handleGenerateSummary} />
                    {summary && <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>}
                    {!isSummarizing && !summaryError && !summary && <p className="text-gray-500 text-sm">{t('aiTools:generatePrompt')}</p>}
                </div>
            </div>
             <div>
                <div className="flex items-center justify-between mb-3">
                   <h3 className="text-lg font-semibold text-accent-400 flex items-center"><TagIcon className="h-5 w-5 mr-2" /> {t('aiTools:entityAnalysisTitle')}</h3>
                    <button onClick={handleExtractEntities} disabled={isExtracting || !textContent} className="flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                        <span>{isExtracting ? t('aiTools:extracting') : t('aiTools:extract')}</span>
                    </button>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 min-h-[100px] space-y-4">
                   {isExtracting && <AILoadingIndicator type="entities" />}
                   <ErrorDisplay error={entityError} onRetry={handleExtractEntities} />
                   {entities && (
                       <>
                           <EntitySection title={t('common:people')} items={entities.people} />
                           <EntitySection title={t('common:places')} items={entities.places} />
                           <EntitySection title={t('common:organizations')} items={entities.organizations} />
                           <EntitySection title={t('common:dates')} items={entities.dates} />
                       </>
                   )}
                   {!isExtracting && !entityError && !entities && <p className="text-gray-500 text-sm">{t('aiTools:extractPrompt')}</p>}
                </div>
           </div>
        </div>
    );
};
