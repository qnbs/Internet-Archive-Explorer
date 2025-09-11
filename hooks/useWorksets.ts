import { useState, useEffect, useCallback } from 'react';
import type { Workset, WorksetDocument, ArchiveItemSummary } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../contexts/ToastContext';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';

const STORAGE_KEY = 'scriptorium-worksets';

export const useWorksets = () => {
  const [worksets, setWorksets] = useState<Workset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const storedWorksets = localStorage.getItem(STORAGE_KEY);
      if (storedWorksets) {
        setWorksets(JSON.parse(storedWorksets));
      }
    } catch (error) {
      console.error('Failed to load worksets from localStorage', error);
      setWorksets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveWorksets = useCallback((newWorksets: Workset[]) => {
    setWorksets(newWorksets);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWorksets));
    } catch (error) {
      console.error('Failed to save worksets to localStorage', error);
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          addToast(t('common:errorStorageFull'), 'error');
      } else {
          addToast(t('scriptorium:errorSave'), 'error');
      }
    }
  }, [addToast, t]);

  const createWorkset = useCallback((name: string) => {
    const newWorkset: Workset = {
      id: uuidv4(),
      name,
      documents: [],
    };
    saveWorksets([...worksets, newWorkset]);
    addToast(t('scriptorium:worksetCreated', { name }), 'success');
    return newWorkset;
  }, [worksets, saveWorksets, addToast, t]);

  const deleteWorkset = useCallback((id: string) => {
    const worksetName = worksets.find(ws => ws.id === id)?.name || '';
    const newWorksets = worksets.filter(ws => ws.id !== id);
    saveWorksets(newWorksets);
    addToast(t('scriptorium:worksetDeleted', { name: worksetName }), 'info');
  }, [worksets, saveWorksets, addToast, t]);

  const updateWorksetName = useCallback((id: string, newName: string) => {
    const newWorksets = worksets.map(ws => 
      ws.id === id ? { ...ws, name: newName } : ws
    );
    saveWorksets(newWorksets);
  }, [worksets, saveWorksets]);

  const addDocumentToWorkset = useCallback((worksetId: string, item: ArchiveItemSummary) => {
    let documentAdded = false;
    const newWorksets = worksets.map(ws => {
      if (ws.id === worksetId) {
        if (ws.documents.some(doc => doc.identifier === item.identifier)) {
          return ws; // Document already exists
        }
        documentAdded = true;
        const newDocument: WorksetDocument = { ...item, notes: '' };
        return { ...ws, documents: [...ws.documents, newDocument] };
      }
      return ws;
    });
    if(documentAdded) {
        saveWorksets(newWorksets);
        addToast(t('scriptorium:documentAdded'), 'success');
    } else {
        addToast(t('scriptorium:documentExists'), 'info');
    }
  }, [worksets, saveWorksets, addToast, t]);

  const removeDocumentFromWorkset = useCallback((worksetId: string, documentId: string) => {
    const newWorksets = worksets.map(ws => {
      if (ws.id === worksetId) {
        const newDocuments = ws.documents.filter(doc => doc.identifier !== documentId);
        return { ...ws, documents: newDocuments };
      }
      return ws;
    });
    saveWorksets(newWorksets);
    addToast(t('scriptorium:documentRemoved'), 'info');
  }, [worksets, saveWorksets, addToast, t]);

  const updateDocumentNotes = useCallback((worksetId: string, documentId: string, notes: string) => {
    const newWorksets = worksets.map(ws => {
      if (ws.id === worksetId) {
        const newDocuments = ws.documents.map(doc =>
          doc.identifier === documentId ? { ...doc, notes } : doc
        );
        return { ...ws, documents: newDocuments };
      }
      return ws;
    });
    saveWorksets(newWorksets);
  }, [worksets, saveWorksets]);

  return {
    worksets,
    isLoading,
    createWorkset,
    deleteWorkset,
    updateWorksetName,
    addDocumentToWorkset,
    removeDocumentFromWorkset,
    updateDocumentNotes,
  };
};