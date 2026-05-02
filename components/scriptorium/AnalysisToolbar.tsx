import { useSetAtom } from 'jotai';
import React, { useCallback, useState } from 'react';
import { SparklesIcon, TagIcon } from '@/components/Icons';
import { useLanguage } from '@/hooks/useLanguage';
import { extractEntities, getSummary } from '@/services/geminiService';
import type { ExtractedEntities, WorksetDocument } from '@/types';
import { logger } from '@/utils/logger';
import { toastAtom } from '../../store';
import { AnalysisPane } from './AnalysisPane';
import { AskAIModal } from './AskAIModal';

interface AnalysisToolbarProps {
  document: WorksetDocument;
  textContent: string;
}

export const AnalysisToolbar: React.FC<AnalysisToolbarProps> = ({ document, textContent }) => {
  const { t, language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    type: 'summary' | 'entities';
    data: string | ExtractedEntities;
  } | null>(null);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const setToast = useSetAtom(toastAtom);

  const handleAnalyze = useCallback(
    async (type: 'summary' | 'entities') => {
      setIsAnalyzing(true);
      setAnalysis(null);
      try {
        if (type === 'summary') {
          const result = await getSummary(textContent, language, 'detailed');
          setAnalysis({ type: 'summary', data: result });
        } else {
          const result = await extractEntities(textContent, language);
          setAnalysis({ type: 'entities', data: result });
        }
      } catch (error) {
        logger.error(error);
        const message =
          error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
        setToast({ type: 'error', message });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [textContent, language, setToast],
  );

  return (
    <>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handleAnalyze('summary')}
          className="p-2 rounded-full text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
          title={t('aiTools:summaryTitle')}
        >
          <SparklesIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleAnalyze('entities')}
          className="p-2 rounded-full text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
          title={t('aiTools:entityAnalysisTitle')}
        >
          <TagIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setIsAskModalOpen(true)}
          className="px-3 py-1.5 text-sm font-semibold rounded-full text-cyan-400 hover:bg-cyan-500/10"
          title={t('aiTools:ask')}
        >
          {t('aiTools:ask')}
        </button>
      </div>
      {analysis && (
        <AnalysisPane
          analysis={analysis}
          isAnalyzing={isAnalyzing}
          onClose={() => setAnalysis(null)}
        />
      )}
      {isAskModalOpen && (
        <AskAIModal
          textContent={textContent}
          document={document}
          onClose={() => setIsAskModalOpen(false)}
        />
      )}
    </>
  );
};
