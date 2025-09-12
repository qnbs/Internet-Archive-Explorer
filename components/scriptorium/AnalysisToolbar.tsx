import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SparklesIcon, BookIcon, TagIcon } from '../Icons';
import { AskAIModal } from './AskAIModal';

interface AnalysisToolbarProps {
    documentText: string | null;
    onSummarize: () => void;
    onExtractEntities: () => void;
}

export const AnalysisToolbar: React.FC<AnalysisToolbarProps> = ({ documentText, onSummarize, onExtractEntities }) => {
    const { t } = useLanguage();
    const [isAskModalOpen, setIsAskModalOpen] = useState(false);
    const hasText = !!documentText;

    return (
        <>
            <div className="flex items-center space-x-1 p-1 bg-gray-700 rounded-lg">
                <button
                    onClick={onSummarize}
                    disabled={!hasText}
                    title={t('scriptorium:reader.summarize')}
                    className="p-1.5 text-sm font-medium rounded-md transition-colors hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                    <BookIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={onExtractEntities}
                    disabled={!hasText}
                    title={t('scriptorium:reader.extractEntities')}
                    className="p-1.5 text-sm font-medium rounded-md transition-colors hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                    <TagIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setIsAskModalOpen(true)}
                    disabled={!hasText}
                    title={t('scriptorium:reader.askAI')}
                    className="p-1.5 text-sm font-medium rounded-md transition-colors hover:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-4 h-4" />
                </button>
            </div>
            {isAskModalOpen && documentText && (
                <AskAIModal documentText={documentText} onClose={() => setIsAskModalOpen(false)} />
            )}
        </>
    );
};