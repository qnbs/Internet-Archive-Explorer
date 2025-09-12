import React, { useState, useEffect, useCallback } from 'react';
import type { WorksetDocument, ExtractedEntities } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
// FIX: `getItemPlainText` is exported from `archiveService`, not `geminiService`.
import { getItemPlainText } from '../../services/archiveService';
// FIX: Correct import for geminiService from the new file
import { getSummary, extractEntities } from '../../services/geminiService';
import { Spinner } from '../Spinner';
import { ArrowLeftIcon, BookIcon } from '../Icons';
import { AnalysisToolbar } from './AnalysisToolbar';
import { RichTextEditor } from '../RichTextEditor';
import { useWorksets } from '../../hooks/useWorksets';
import { useSetAtom, useAtomValue } from 'jotai';
// FIX: Use direct imports to prevent circular dependency issues.
import { modalAtom } from '../../store/app';
import { summaryToneAtom } from '../../store/settings';
import { ResizablePanel } from './ResizablePanel';
import { AnalysisPane } from './AnalysisPane';
import { DocumentSearchBar } from './DocumentSearchBar';
import { sanitizeHtml } from '../../utils/sanitizer';

interface DocumentReaderProps {
    document: WorksetDocument;
    onBack: () => void; // For mobile view
}

export const DocumentReader: React.FC<DocumentReaderProps> = ({ document, onBack }) => {
    const { t, language } = useLanguage();
    const { updateDocumentNotes } = useWorksets();
    const setModal = useSetAtom(modalAtom);
    const summaryTone = useAtomValue(summaryToneAtom);

    const [plainText, setPlainText] = useState<string | null>(null);
    const [isLoadingText, setIsLoadingText] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // AI Analysis State
    const [analysisPane, setAnalysisPane] = useState<{ type: 'summary' | 'entities'; data: string | ExtractedEntities } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // In-document Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [matches, setMatches] = useState<number[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    const fetchText = useCallback(async () => {
        setIsLoadingText(true);
        setError(null);
        setAnalysisPane(null);
        setSearchQuery('');
        try {
            const text = await getItemPlainText(document.identifier);
            setPlainText(text);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load document text.');
        } finally {
            setIsLoadingText(false);
        }
    }, [document.identifier]);

    useEffect(() => {
        fetchText();
    }, [fetchText]);

    const handleNotesChange = (notes: string) => {
        updateDocumentNotes({
            worksetId: document.worksetId,
            documentId: document.identifier,
            notes,
        });
    };

    const handleSummarize = async () => {
        if (!plainText) return;
        setIsAnalyzing(true);
        setAnalysisPane(null);
        try {
            const summary = await getSummary(plainText, language, summaryTone);
            setAnalysisPane({ type: 'summary', data: summary });
        } catch (e) { console.error(e) } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleExtractEntities = async () => {
        if (!plainText) return;
        setIsAnalyzing(true);
        setAnalysisPane(null);
        try {
            const entities = await extractEntities(plainText, language);
            setAnalysisPane({ type: 'entities', data: entities });
        } catch (e) { console.error(e) } finally {
            setIsAnalyzing(false);
        }
    };
    
    const highlightText = (text: string, query: string): string => {
        if (!query) return sanitizeHtml(text).replace(/\n/g, '<br />');
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        
        let matchIndex = 0;
        const highlighted = sanitizeHtml(text).replace(regex, (match) => {
          const index = text.indexOf(match, matchIndex);
          matchIndex = index + 1;
          return `<mark class="bg-yellow-400 text-black px-0.5 rounded" data-match-index="${index}">${match}</mark>`;
        });

        return highlighted.replace(/\n/g, '<br />');
    };

    const readerContent = (
        <div className="flex-grow overflow-y-auto p-4 md:p-6 text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none relative">
            {analysisPane && <AnalysisPane analysis={analysisPane} onClose={() => setAnalysisPane(null)} isAnalyzing={isAnalyzing} />}
            <div dangerouslySetInnerHTML={{ __html: highlightText(plainText || '', searchQuery) }} />
        </div>
    );
    
    const renderContent = () => {
        if (isLoadingText) {
            return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
        }
        if (error) {
            return <div className="p-4 text-center text-red-400">{error}</div>;
        }
        if (!plainText) {
            return <div className="p-4 text-center text-gray-500">{t('scriptorium:reader.noText')}</div>;
        }
        return (
            <div className="h-full flex flex-col">
                {readerContent}
                <DocumentSearchBar text={plainText} onSearch={setSearchQuery} />
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 p-3 md:p-4 border-b border-gray-700 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 min-w-0">
                    <button onClick={onBack} className="md:hidden p-1 text-gray-400 hover:text-white">
                        <ArrowLeftIcon />
                    </button>
                    <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg truncate">{document.title}</h3>
                        <p className="text-xs text-gray-400 truncate">{Array.isArray(document.creator) ? document.creator.join(', ') : document.creator}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <AnalysisToolbar 
                        documentText={plainText}
                        onSummarize={handleSummarize}
                        onExtractEntities={handleExtractEntities}
                    />
                    <button
                        onClick={() => setModal({ type: 'bookReader', item: document })}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors bg-gray-700 hover:bg-gray-600"
                    >
                        <BookIcon className="w-4 h-4" />
                        <span>{t('common:readInBookReader')}</span>
                    </button>
                </div>
            </header>
            
            <ResizablePanel
                panelA={renderContent()}
                panelB={
                    <RichTextEditor
                        key={document.identifier}
                        initialValue={document.notes}
                        onSave={handleNotesChange}
                    />
                }
            />
        </div>
    );
};