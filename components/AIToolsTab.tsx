import React, { useState, useCallback } from 'react';
import { getSummary, extractEntities } from '../services/geminiService';
import type { ExtractedEntities } from '../types';
import { Spinner } from './Spinner';
import { useSearch } from '../contexts/SearchContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AIToolsTabProps {
    itemIdentifier: string;
    textContent: string | null;
    isLoadingText: boolean;
    onClose: () => void;
}

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.672-2.672L11.25 18l1.938-.648a3.375 3.375 0 002.672-2.672L16.75 13.5l.648 1.938a3.375 3.375 0 002.672 2.672L22.5 18l-1.938.648a3.375 3.375 0 00-2.672 2.672z" />
    </svg>
);
const TagIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.53 0 1.04.21 1.41.59l7 7a2 2 0 010 2.83l-5 5a2 2 0 01-2.83 0l-7-7A2 2 0 013 8V3z" /></svg>;

export const AIToolsTab: React.FC<AIToolsTabProps> = ({ itemIdentifier, textContent, isLoadingText, onClose }) => {
    const [summary, setSummary] = useState<string>('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const [entities, setEntities] = useState<ExtractedEntities | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [entityError, setEntityError] = useState<string | null>(null);
    
    const { searchAndGo } = useSearch();
    const { t, language } = useLanguage();

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
    
    const handleExtractEntities = async () => {
        if (!textContent) return;
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
    };
    
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