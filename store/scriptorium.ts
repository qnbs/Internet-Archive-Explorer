

import { atom } from 'jotai';
import { safeAtomWithStorage } from './safeStorage';
import { v4 as uuidv4 } from 'uuid';
import type { Workset, WorksetDocument, ArchiveItemSummary } from '../types';
import { toastAtom } from './atoms';

export const STORAGE_KEY = 'scriptorium-worksets-v2';

// --- Base State Atom ---
export const worksetsAtom = safeAtomWithStorage<Workset[]>(STORAGE_KEY, []);

// --- UI State Atoms ---
export const selectedWorksetIdAtom = safeAtomWithStorage<string | null>('scriptorium-selected-workset-id', null);
export const selectedDocumentIdAtom = safeAtomWithStorage<string | null>('scriptorium-selected-document-id', null);


// --- Write-only Action Atoms ---

export const createWorksetAtom = atom(
    null,
    (get, set, name: string): Workset => {
        const newWorkset: Workset = {
            id: uuidv4(),
            name,
            documents: [],
        };
        const currentWorksets = get(worksetsAtom);
        set(worksetsAtom, [...currentWorksets, newWorkset]);
        set(toastAtom, { type: 'success', message: `Workset '${name}' created!` });
        return newWorkset;
    }
);

export const deleteWorksetAtom = atom(
    null,
    (get, set, id: string) => {
        const worksets = get(worksetsAtom);
        const worksetName = worksets.find(ws => ws.id === id)?.name || '';
        const newWorksets = worksets.filter(ws => ws.id !== id);
        set(worksetsAtom, newWorksets);
        set(toastAtom, { type: 'info', message: `Workset '${worksetName}' deleted.` });
    }
);

export const updateWorksetNameAtom = atom(
    null,
    (get, set, { id, newName }: { id: string, newName: string }) => {
        set(worksetsAtom, worksets =>
            worksets.map(ws => (ws.id === id ? { ...ws, name: newName } : ws))
        );
    }
);

export const addDocumentToWorksetAtom = atom(
    null,
    (get, set, { worksetId, item }: { worksetId: string, item: ArchiveItemSummary }) => {
        const worksets = get(worksetsAtom);
        let documentExists = false;
        const newWorksets = worksets.map(ws => {
            if (ws.id === worksetId) {
                if (ws.documents.some(doc => doc.identifier === item.identifier)) {
                    documentExists = true;
                    return ws;
                }
                const newDocument: WorksetDocument = { ...item, notes: '', worksetId };
                return { ...ws, documents: [...ws.documents, newDocument] };
            }
            return ws;
        });

        if (documentExists) {
            set(toastAtom, { type: 'info', message: 'Document is already in this workset.' });
        } else {
            set(worksetsAtom, newWorksets);
            set(toastAtom, { type: 'success', message: 'Document added to workset.' });
        }
    }
);

export const removeDocumentFromWorksetAtom = atom(
    null,
    (get, set, { worksetId, documentId }: { worksetId: string, documentId: string }) => {
        set(worksetsAtom, worksets =>
            worksets.map(ws => {
                if (ws.id === worksetId) {
                    return { ...ws, documents: ws.documents.filter(doc => doc.identifier !== documentId) };
                }
                return ws;
            })
        );
        set(toastAtom, { type: 'info', message: 'Document removed from workset.' });
    }
);

export const updateDocumentNotesAtom = atom(
    null,
    (get, set, { worksetId, documentId, notes }: { worksetId: string, documentId: string, notes: string }) => {
        set(worksetsAtom, worksets =>
            worksets.map(ws => {
                if (ws.id === worksetId) {
                    return {
                        ...ws,
                        documents: ws.documents.map(doc =>
                            doc.identifier === documentId ? { ...doc, notes } : doc
                        )
                    };
                }
                return ws;
            })
        );
    }
);

export const clearScriptoriumAtom = atom(null, (get, set) => {
    set(worksetsAtom, []);
});
