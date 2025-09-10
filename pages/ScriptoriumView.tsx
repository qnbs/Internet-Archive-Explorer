import React, { useState, useEffect, useCallback } from 'react';
import { ResultsGrid } from '../components/ResultsGrid';
import { searchArchive } from '../services/archiveService';
import type { ArchiveItemSummary, Workset, WorksetDocument } from '../types';
import { MediaType } from '../types';
import { WorkspacePanel } from '../components/scriptorium/WorkspacePanel';
import { DocumentReader } from '../components/scriptorium/DocumentReader';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpenIcon } from '../components/Icons';

export const ScriptoriumView: React.FC = () => {
    const { t } = useLanguage();
    const [selectedDocument, setSelectedDocument] = useState<WorksetDocument | null>(null);
    const [results, setResults] = useState<ArchiveItemSummary[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalResults, setTotalResults] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [worksets, setWorksets] = useState<Workset[]>([]);
    const [activeWorksetId, setActiveWorksetId] = useState<string | null>(null);
    const debouncedWorksets = useDebounce(worksets, 500);

    useEffect(() => {
        try {
            const storedWorksets = localStorage.getItem('scriptorium-worksets');
            if (storedWorksets) {
                const parsedWorksets: Workset[] = JSON.parse(storedWorksets);
                setWorksets(parsedWorksets);
                if (parsedWorksets.length > 0 && !activeWorksetId) {
                    setActiveWorksetId(parsedWorksets[0].id);
                }
            }
        } catch (e) { console.error("Failed to load worksets from localStorage", e); }
    }, [activeWorksetId]);

    useEffect(() => {
        localStorage.setItem('scriptorium-worksets', JSON.stringify(debouncedWorksets));
    }, [debouncedWorksets]);
    
    const saveWorksets = (newWorksets: Workset[]) => {
        setWorksets(newWorksets);
    };

    const addDocumentToActiveWorkset = (doc: ArchiveItemSummary) => {
        if (!activeWorksetId) {
            alert(t('scriptorium.noWorksetAlert'));
            return;
        }
        const newWorksets = worksets.map(ws => {
            if (ws.id === activeWorksetId) {
                if (ws.documents.some(d => d.identifier === doc.identifier)) return ws;
                const newDoc: WorksetDocument = { ...doc, notes: '' };
                return { ...ws, documents: [...ws.documents, newDoc] };
            }
            return ws;
        });
        saveWorksets(newWorksets);
    };

    const updateNotesForDocument = (docIdentifier: string, newNotes: string) => {
        const newWorksets = worksets.map(ws => {
            if (ws.id === activeWorksetId) {
                return {
                    ...ws,
                    documents: ws.documents.map(d => 
                        d.identifier === docIdentifier ? { ...d, notes: newNotes } : d
                    )
                };
            }
            return ws;
        });
        setWorksets(newWorksets);
    };

    const performSearch = useCallback(async (searchPage: number) => {
        if (searchPage === 1) setIsLoading(true); else setIsLoadingMore(true);
        setError(null);
        try {
            const data = await searchArchive(`mediatype:(${MediaType.Texts})`, searchPage);
            if (data && data.response && Array.isArray(data.response.docs)) {
              setTotalResults(data.response.numFound);
              setResults(prev => searchPage === 1 ? data.response.docs : [...prev, ...data.response.docs]);
            } else {
              setTotalResults(0);
              setResults(prev => searchPage === 1 ? [] : prev);
            }
        } catch (err) {
            setError(t('common.error'));
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [t]);

    useEffect(() => { performSearch(1); }, [performSearch]);

    const handleLoadMore = useCallback(() => {
      if (isLoading || isLoadingMore) return;
      setPage(prev => {
          const nextPage = prev + 1;
          performSearch(nextPage);
          return nextPage;
      });
    }, [performSearch, isLoading, isLoadingMore]);

    const hasMore = !isLoading && results.length < totalResults;
    const lastElementRef = useInfiniteScroll({ isLoading: isLoadingMore, hasMore, onLoadMore: handleLoadMore, rootMargin: '400px' });
    
    const openDocumentFromSearch = (item: ArchiveItemSummary) => {
        setSelectedDocument({ ...item, notes: '' });
    };

    const MainContent = () => {
        if (selectedDocument) {
            return <DocumentReader 
                item={selectedDocument} 
                onClose={() => setSelectedDocument(null)}
                onAddToWorkset={addDocumentToActiveWorkset}
                onUpdateNotes={updateNotesForDocument}
             />;
        }

        return (
             <div className="space-y-6">
                 <header className="p-6 bg-gray-800/60 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold text-cyan-400 mb-2 flex items-center"><BookOpenIcon className="w-8 h-8 mr-3"/> {t('scriptorium.title')}</h1>
                    <p className="text-gray-300">{t('scriptorium.description')}</p>
                 </header>
                <ResultsGrid
                    results={results}
                    isLoading={isLoading}
                    isLoadingMore={isLoadingMore}
                    error={error}
                    onSelectItem={openDocumentFromSearch}
                    hasMore={hasMore}
                    totalResults={totalResults}
                    lastElementRef={lastElementRef}
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
                <WorkspacePanel 
                    worksets={worksets}
                    activeWorksetId={activeWorksetId}
                    onSetActiveWorkset={setActiveWorksetId}
                    onSaveWorksets={saveWorksets}
                    onSelectDocument={setSelectedDocument}
                />
            </div>
            <main className="lg:col-span-3">
                <MainContent />
            </main>
        </div>
    );
};