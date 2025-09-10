import React, { useState, useCallback, useEffect } from 'react';
import { getSummary, extractEntities } from '../services/geminiService';
import type { ExtractedEntities } from '../types';
import { Spinner } from './Spinner';
import { useSearch } from '../contexts/SearchContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { SparklesIcon, TagIcon } from './Icons';

interface AIToolsTabProps {
    itemIdentifier: string;
    textContent: string | null;
    isLoadingText: boolean;
    onClose: () => void;
}

export const AIToolsTab: React.FC<AIToolsTabProps> = ({ itemIdentifier, textContent, isLoadingText, onClose }) => {
    const [summary, setSummary] = useState<string>('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const [entities, setEntities] = useState<ExtractedEntities | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [entityError, setEntityError] = useState<string | null>(null);
    
    const { searchAndGo } = useSearch();
    const { t, language } = useLanguage();
    const { settings } = useSettings();

    const handleGenerateSummary = useCallback(async () => {
        if (!textContent) return;
        setIsSummarizing(true);
        setSummaryError(null);
        setSummary('');
        try {
            if (textContent.length < 100) {
                 setSummaryError(t('aiTools.summaryErrorShort'));
                 return;
            }
            const generatedSummary = await getSummary(textContent, language);
            setSummary(generatedSummary);
        } catch (err) {
            setSummaryError((err as Error).message || t('aiTools.summaryErrorApi'));
        } finally {
            setIsSummarizing(false);
        }
    }, [textContent, language, t]);
    
    const handleExtractEntities = useCallback(async () => {
        if (!textContent || isExtracting) return;
        setIsExtracting(true);
        setEntityError(null);
        try {
            const result = await extractEntities(textContent, language);
            setEntities(result);
        } catch (err) {
            setEntityError((err as Error).message || t('aiTools.entityErrorApi'));
        } finally {
            setIsExtracting(false);
        }
    }, [textContent, isExtracting, language, t]);
    
    useEffect(() => {
        if (settings.autoRunEntityExtraction && textContent && !entities) {
            handleExtractEntities();
        }
    }, [settings.autoRunEntityExtraction, textContent, entities, handleExtractEntities]);

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
                        <button key={`${title}-${i}`} onClick={() => handleEntityClick(e)} className="bg-gray-700 hover:bg-cyan-600 text-gray-200 hover:text-white text-xs font-medium px-2 py-1 rounded-full transition-colors">
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

    if (!textContent) {
        return <p className="text-center text-gray-400">{t('common.error')}</p>
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-lg font-semibold text-cyan-400 flex items-center"><SparklesIcon className="w-5 h-5 mr-2" /> {t('aiTools.summary')}</h3>
                    <button onClick={handleGenerateSummary} disabled={isSummarizing} className="flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                        <span>{isSummarizing ? t('aiTools.generating') : t('aiTools.generate')}</span>
                    </button>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 min-h-[100px]">
                    {isSummarizing && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                    {summaryError && <p className="text-red-400 text-sm">{summaryError}</p>}
                    {summary && <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>}
                    {!isSummarizing && !summaryError && !summary && <p className="text-gray-500 text-sm">{t('aiTools.generatePrompt')}</p>}
                </div>
            </div>
             <div>
                <div className="flex items-center justify-between mb-3">
                   <h3 className="text-lg font-semibold text-cyan-400 flex items-center"><TagIcon className="h-5 w-5 mr-2" /> {t('scriptorium.reader.entityAnalysis')}</h3>
                    <button onClick={handleExtractEntities} disabled={isExtracting} className="flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                        <span>{isExtracting ? t('scriptorium.reader.extracting') : t('scriptorium.reader.extract')}</span>
                    </button>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 min-h-[100px] space-y-4">
                   {isExtracting && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                   {entityError && <p className="text-red-400 text-sm">{entityError}</p>}
                   {entities && (
                       <>
                           <EntitySection title={t('common.people')} items={entities.people} />
                           <EntitySection title={t('common.places')} items={entities.places} />
                           <EntitySection title={t('common.organizations')} items={entities.organizations} />
                           <EntitySection title={t('common.dates')} items={entities.dates} />
                       </>
                   )}
                   {!isExtracting && !entityError && !entities && <p className="text-gray-500 text-sm">{t('scriptorium.reader.extractPrompt')}</p>}
                </div>
           </div>
        </div>
    );
};
