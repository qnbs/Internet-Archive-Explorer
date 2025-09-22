



import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { WorksetDocument } from '../../types';
import { getItemPlainText } from '../../services/archiveService';
import { useLanguage } from '../../hooks/useLanguage';
import { Spinner } from '../Spinner';
import { AnalysisToolbar } from './AnalysisToolbar';
import { DocumentSearchBar } from './DocumentSearchBar';
import { ResizablePanel } from './ResizablePanel';
import { RichTextEditor } from '../RichTextEditor';
import { useWorksets } from '../../hooks/useWorksets';
import { useDebounce } from '../../hooks/useDebounce';
import { ArrowLeftIcon } from '../Icons';

interface DocumentReaderProps {
    document: WorksetDocument;
    onBack: () => void; // For mobile view
}

export const DocumentReader: React.FC<DocumentReaderProps> = ({ document, onBack }) => {
    const { t } = useLanguage();
    const { updateDocumentNotes } = useWorksets();
    
    const [textContent, setTextContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [notes, setNotes] = useState(document.notes || '');
    const debouncedNotes = useDebounce(notes, 1000);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        getItemPlainText(document.identifier)
            .then(setTextContent)
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to load document text.'))
            .finally(() => setIsLoading(false));
    }, [document.identifier]);
    
    useEffect(() => {
        setNotes(document.notes || '');
    }, [document.identifier, document.notes]);
    
    useEffect(() => {
        if (debouncedNotes !== document.notes) {
            updateDocumentNotes({
                worksetId: document.worksetId,
                documentId: document.identifier,
                notes: debouncedNotes
            });
        }
    }, [debouncedNotes, document.identifier, document.notes, document.worksetId, updateDocumentNotes]);


    const highlightedText = useMemo(() => {
        if (!textContent || !searchQuery) return textContent;
        
        let regex: RegExp;
        try {
            // User can input regex, so we handle potential errors
            regex = new RegExp(searchQuery, 'gi');
        } catch (e) {
            // Invalid regex, return original text without highlighting
            return textContent;
        }

        // FIX: The `replace` callback's first argument `match` is a string and does not have an `.index` property.
        // The offset (index) of the match is passed as one of the later arguments. This implementation
        // correctly extracts the offset regardless of capture groups in the search query.
        return textContent.replace(regex, (...args) => {
            const match = args[0];
            const offset = args[args.length - 2]; // The offset is the second to last argument.
            return `<mark data-match-index="${offset}" class="bg-yellow-400 text-black">${match}</mark>`;
        });
    }, [textContent, searchQuery]);
    
    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-full"><Spinner /></div>;
        if (error) return <div className="p-4 text-red-400 text-center">{error}</div>;
        if (textContent) {
            return (
                <div className="h-full flex flex-col">
                    <div className="flex-grow p-4 overflow-y-auto prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: highlightedText }} />
                    <DocumentSearchBar text={textContent} onSearch={setSearchQuery} />
                </div>
            );
        }
        return null;
    };
    
    const readerPanel = (
        <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
            <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-700">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={onBack} className="md:hidden p-1 text-gray-400 hover:text-white"><ArrowLeftIcon className="w-4 h-4" /></button>
                    <h3 className="text-md font-bold text-white truncate">{document.title}</h3>
                </div>
                {textContent && <AnalysisToolbar document={document} textContent={textContent} />}
            </header>
            {renderContent()}
        </div>
    );
    
    const notesPanel = (
         <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
            <header className="flex-shrink-0 p-3 border-b border-gray-700">
                <h3 className="text-md font-bold text-white">{t('scriptorium.reader.notes')}</h3>
            </header>
            <RichTextEditor
                value={notes}
                onChange={setNotes}
                placeholder={t('scriptorium:reader.notesPlaceholder')}
            />
        </div>
    );

    return <ResizablePanel panelA={readerPanel} panelB={notesPanel} />;
};