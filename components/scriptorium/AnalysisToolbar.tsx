import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SparklesIcon } from '../Icons';
import { AskAIModal } from './AskAIModal';

interface AnalysisToolbarProps {
    documentText: string | null;
}

export const AnalysisToolbar: React.FC<AnalysisToolbarProps> = ({ documentText }) => {
    const { t } = useLanguage();
    const [isAskModalOpen, setIsAskModalOpen] = useState(false);

    return (
        <>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setIsAskModalOpen(true)}
                    disabled={!documentText}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-4 h-4" />
                    <span>{t('scriptorium.reader.askAI')}</span>
                </button>
            </div>
            {isAskModalOpen && documentText && (
                <AskAIModal documentText={documentText} onClose={() => setIsAskModalOpen(false)} />
            )}
        </>
    );
};