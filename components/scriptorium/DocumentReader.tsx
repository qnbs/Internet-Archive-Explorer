import React, { useState, useMemo, useEffect } from 'react';
import type { WorksetDocument } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { useItemMetadata } from '../../hooks/useItemMetadata';
import { Spinner } from '../Spinner';
import { ArrowLeftIcon } from '../Icons';
import { DocumentSearchBar } from './DocumentSearchBar';
import { AnalysisToolbar } from './AnalysisToolbar';
import { ResizablePanel } from './ResizablePanel';
import { RichTextEditor } from '../RichTextEditor';
import { useSetAtom } from 'jotai';
import { updateDocumentNotesAtom } from '../../store/scriptorium';
import { useDebounce } from '../../hooks/useDebounce';

interface DocumentReaderProps {
    document: WorksetDocument;
    onBack: () => void;
}

const ReaderContent: React.FC<{ text: string, searchQuery: string }> = React.memo(({ text, searchQuery }) => {
    const paragraphs = useMemo(() => text.split('\n').filter(p => p.trim() !== ''), [text]);

    const highlightedText = useMemo(() => {
        if (!searchQuery) return null;
        try {
            const regex = new RegExp(`(${searchQuery})`, 'gi');
            
            return paragraphs.map((p, i) => (
                <p key={i}>
                    {p.split(regex).map((part, j) => {
                        if (j % 2 === 1) { // It's a match
                            const matchIndex = p.indexOf(part, (j > 1 ? p.indexOf(p.split(regex)[j-2]) + p.split(regex)[j-2].length : 0));
                            return <mark key={j} className="bg-yellow-400 text-black" data-match-index={matchIndex}>{part}</mark>;
                        }
                        return part;
                    })}
                </p>
            ));
        } catch (e) {
            // Invalid regex, just show paragraphs
            return paragraphs.map((p, i) => <p key={i}>{p}</p>);
        }
    }, [paragraphs, searchQuery]);


    return (
        <div className="p-4 text-gray-300 leading-relaxed space-y-4 prose-invert prose-sm max-w-none">
            {highlightedText ? highlightedText : paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
    );
});


const ScriptoriumNotesEditor: React.FC<{ document: WorksetDocument }> = ({ document }) => {
    const [notes, setNotes] = useState(document.notes);
    const updateNotesAtomAction = useSetAtom(updateDocumentNotesAtom);
    const debouncedNotes = useDebounce(notes, 1000);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const savedTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setNotes(document.notes);
        setIsSaving(false);
        setIsSaved(false);
        if (savedTimeout.current) clearTimeout(savedTimeout.current);
    }, [document]);

    useEffect(() => {
        if (notes !== document.notes) {
            setIsSaving(true);
            setIsSaved(false);
            if (savedTimeout.current) clearTimeout(savedTimeout.current);
        }
    }, [notes, document.notes]);

    useEffect(() => {
        if (document && debouncedNotes !== document.notes) {
            updateNotesAtomAction({ worksetId: document.worksetId, documentId: document.identifier, notes: debouncedNotes });
            setIsSaving(false);
            setIsSaved(true);
            savedTimeout.current = setTimeout(() => setIsSaved(false), 2000);
        }
    }, [debouncedNotes, document, updateNotesAtomAction]);
    
    return (
        <div className="h-full flex flex-col">
            <RichTextEditor
                value={notes}
                onChange={setNotes}
                placeholder="Start typing your notes here..."
                className="border-none rounded-none"
            />
            <div className="flex-shrink-0 text-right px-4 py-1 text-xs text-gray-500 h-6 bg-gray-900/50 rounded-b-lg">
                {isSaving && <span>Saving...</span>}
                {isSaved && <span className="text-green-400">Saved</span>}
            </div>
        </div>
    );
};

export const DocumentReader: React.FC<DocumentReaderProps> = ({ document, onBack }) => {
    const { t } = useLanguage();
    const { plainText, isLoadingText, textError } = useItemMetadata(document);
    const [searchQuery, setSearchQuery] = useState('');

    const ReaderPanel = (
        <div className="h-full flex flex-col bg-gray-800 rounded-lg overflow-hidden">
            <header className="flex-shrink-0 p-3 bg-gray-900/50 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={onBack} className="md:hidden p-1 text-gray-400 hover:text-white"><ArrowLeftIcon className="w-5 h-5" /></button>
                    <h2 className="font-bold text-white truncate text-lg">{document.title}</h2>
                </div>
                {plainText && <AnalysisToolbar document={document} textContent={plainText} />}
            </header>
            <div className="flex-grow overflow-y-auto">
                {isLoadingText && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                {textError && <div className="flex justify-center items-center h-full text-red-400 p-4 text-center">{textError}</div>}
                {plainText ? <ReaderContent text={plainText} searchQuery={searchQuery} /> : !isLoadingText && !textError && <p className="p-4 text-gray-500">{t('common:noContent')}</p>}
            </div>
            {plainText && <DocumentSearchBar text={plainText} onSearch={setSearchQuery} />}
        </div>
    );
    
    const NotesPanel = (
        <div className="h-full flex flex-col bg-gray-800 rounded-lg overflow-hidden">
            <header className="flex-shrink-0 p-3 bg-gray-900/50 border-b border-gray-700">
                <h2 className="font-bold text-white">{t('scriptorium:reader.notes')}</h2>
            </header>
            <ScriptoriumNotesEditor document={document} />
        </div>
    );
    
    return <ResizablePanel panelA={ReaderPanel} panelB={NotesPanel} />;
};