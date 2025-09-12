import React from 'react';
import type { ExtractedEntities } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { useSearchAndGo } from '../../hooks/useSearchAndGo';
import { AILoadingIndicator } from '../AILoadingIndicator';
import { CloseIcon } from '../Icons';

interface AnalysisPaneProps {
    analysis: { type: 'summary' | 'entities'; data: string | ExtractedEntities } | null;
    isAnalyzing: boolean;
    onClose: () => void;
}

const EntitySection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
    const searchAndGo = useSearchAndGo();
    if (!items || items.length === 0) return null;
    return (
        <div>
            <h4 className="font-semibold text-gray-300 mb-2">{title}</h4>
            <div className="flex flex-wrap gap-2">
                {items.map((e, i) => (
                    <button 
                        key={`${title}-${i}`} 
                        onClick={() => searchAndGo(`"${e}"`)} 
                        className="bg-gray-700 hover:bg-cyan-600 text-gray-200 hover:text-white text-xs font-medium px-2 py-1 rounded-full transition-colors"
                    >
                        {e}
                    </button>
                ))}
            </div>
        </div>
    );
};


export const AnalysisPane: React.FC<AnalysisPaneProps> = ({ analysis, isAnalyzing, onClose }) => {
    const { t } = useLanguage();

    const renderContent = () => {
        if (isAnalyzing) {
            return <AILoadingIndicator type="summary" />;
        }

        if (!analysis) return null;

        if (analysis.type === 'summary') {
            return <p className="text-gray-300 text-sm leading-relaxed">{analysis.data as string}</p>;
        }

        if (analysis.type === 'entities') {
            const entities = analysis.data as ExtractedEntities;
            return (
                <div className="space-y-4">
                    <EntitySection title={t('common:people')} items={entities.people} />
                    <EntitySection title={t('common:places')} items={entities.places} />
                    <EntitySection title={t('common:organizations')} items={entities.organizations} />
                    <EntitySection title={t('common:dates')} items={entities.dates} />
                </div>
            );
        }
    };

    return (
        <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm z-10 p-4 animate-fade-in flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-cyan-400">
                    {analysis?.type === 'summary' ? t('aiTools:summary') : t('scriptorium:reader.entityAnalysis')}
                </h3>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700">
                    <CloseIcon />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                 {renderContent()}
            </div>
        </div>
    );
};