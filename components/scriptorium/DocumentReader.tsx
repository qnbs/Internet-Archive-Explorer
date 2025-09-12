import React, { useState, useEffect, useCallback } from 'react';
import type { WorksetDocument } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { getItemPlainText } from '../../services/archiveService';
import { Spinner } from '../Spinner';
import { ArrowLeftIcon, BookIcon } from '../Icons';
import { AnalysisToolbar } from './AnalysisToolbar';
import { RichTextEditor } from '../RichTextEditor';
import { useWorksets } from '../../hooks/useWorksets';
import { useSetAtom } from 'jotai';
import { modalAtom } from '../../store';

interface DocumentReaderProps {
    document: WorksetDocument;
    onBack: () => void; // For mobile view
}

export const DocumentReader: React.FC<DocumentReaderProps> = ({ document, onBack }) => {
    const { t } = useLanguage();
    const { updateDocumentNotes } = useWorksets();
    const setModal = useSetAtom(modalAtom);
    const [plainText, setPlainText] = useState<string | null>(null);
    const [isLoadingText, setIsLoadingText] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchText = useCallback(async () => {
        setIsLoadingText(true);
        setError(null);
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

    const renderContent = () => {
        if (isLoadingText) {
            return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
        }
        if (error) {
            return <div className="p-4 text-center text-red-400">{error}</div>;
        }
        if (!plainText) {
            return <div className="p-4 text-center text-gray-500">{t('scriptorium.reader.noText')}</div>;
        }
        return (
            <div className="flex-grow overflow-y-auto p-4 md:p-6 text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{plainText}</p>
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
                    <AnalysisToolbar documentText={plainText} />
                    <button
                        onClick={() => setModal({ type: 'bookReader', item: document })}
                        className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors bg-gray-700 hover:bg-gray-600"
                    >
                        <BookIcon className="w-4 h-4" />
                        <span>{t('common:readInBookReader')}</span>
                    </button>
                </div>
            </header>
            
            <div className="flex-grow flex flex-col md:flex-row min-h-0">
                <div className="w-full md:w-2/3 h-1/2 md:h-full flex flex-col">
                    {renderContent()}
                </div>
                <div className="w-full md:w-1/3 h-1/2 md:h-full border-t-2 md:border-t-0 md:border-l-2 border-gray-700 flex flex-col">
                    <RichTextEditor
                        key={document.identifier} // Re-mount when document changes
                        initialValue={document.notes}
                        onSave={handleNotesChange}
                    />
                </div>
            </div>
        </div>
    );
};