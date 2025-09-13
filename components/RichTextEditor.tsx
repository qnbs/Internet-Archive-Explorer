import React, { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { updateDocumentNotesAtom } from '../store/scriptorium';
import type { WorksetDocument } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface RichTextEditorProps {
    document: WorksetDocument;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ document }) => {
    const [notes, setNotes] = useState(document.notes);
    const updateNotes = useSetAtom(updateDocumentNotesAtom);
    const debouncedNotes = useDebounce(notes, 500);

    // Reset local state when document changes
    useEffect(() => {
        setNotes(document.notes);
    }, [document]);

    // Save debounced notes to global state
    useEffect(() => {
        if (document && debouncedNotes !== document.notes) {
            updateNotes({ worksetId: document.worksetId, documentId: document.identifier, notes: debouncedNotes });
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
        </div>
    );
};
