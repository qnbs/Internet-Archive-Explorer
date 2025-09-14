import React, { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { updateDocumentNotesAtom } from '../store/scriptorium';
import type { WorksetDocument } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface NotesEditorProps {
    document: WorksetDocument;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({ document }) => {
    const [notes, setNotes] = useState(document.notes);
    const updateNotes = useSetAtom(updateDocumentNotesAtom);
    const debouncedNotes = useDebounce(notes, 1000);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    // Fix: Corrected invalid hook call syntax and improved type safety for the timeout ref.
    const savedTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset local state when document changes
    useEffect(() => {
        setNotes(document.notes);
        setIsSaving(false);
        setIsSaved(false);
        // Fix: Guard clearTimeout to prevent errors if the ref is not set.
        if (savedTimeout.current) clearTimeout(savedTimeout.current);
    }, [document]);
    
    // Show saving indicator
    useEffect(() => {
        if (notes !== document.notes) {
            setIsSaving(true);
            setIsSaved(false);
            if (savedTimeout.current) clearTimeout(savedTimeout.current);
        }
    }, [notes, document.notes]);

    // Save debounced notes to global state
    useEffect(() => {
        if (document && debouncedNotes !== document.notes) {
            updateNotes({ worksetId: document.worksetId, documentId: document.identifier, notes: debouncedNotes });
            setIsSaving(false);
            setIsSaved(true);
            savedTimeout.current = setTimeout(() => setIsSaved(false), 2000);
        }
    }, [debouncedNotes, document, updateNotes]);
    
    return (
        <div className="h-full flex flex-col">
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Start typing your notes here..."
                className="w-full h-full bg-transparent text-gray-300 p-4 resize-none focus:outline-none placeholder-gray-500"
            />
            <div className="flex-shrink-0 text-right px-4 py-1 text-xs text-gray-500 h-6">
                {isSaving && <span>Saving...</span>}
                {isSaved && <span className="text-green-400">Saved</span>}
            </div>
        </div>
    );
};