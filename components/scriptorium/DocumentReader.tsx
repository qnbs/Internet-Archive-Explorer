import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Workset, WorksetDocument } from '../../types';
import { useWorksets } from '../../hooks/useWorksets';
import { getItemPlainText } from '../../services/archiveService';
import { Spinner } from '../Spinner';
import { AIToolsTab } from '../AIToolsTab';
import { useLanguage } from '../../contexts/LanguageContext';

interface DocumentReaderProps {
    document: WorksetDocument;
    workset: Workset;
    worksetsApi: ReturnType<typeof useWorksets>;
    onSelectDocument: (doc: WorksetDocument | null) => void;
}

export const DocumentReader: React.FC<DocumentReaderProps> = ({ document, workset, worksetsApi, onSelectDocument }) => {
    const { t } = useLanguage();
    const [text, setText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'reader' | 'ai' | 'notes'>('reader');
    const notesRef = useRef<HTMLTextAreaElement>(null);
    
    const fetchText = useCallback(() => {
        setIsLoading(true);
        setError(null);
        setText(null);
        getItemPlainText(document.identifier)
            .then(setText)
            .catch(() => {
                setError(t('scriptorium:reader.loadError'));
                setText(null);
            })
            .finally(() => setIsLoading(false));
    }, [document.identifier, t]);

    useEffect(() => {
        setActiveTab('reader');
        fetchText();
    }, [fetchText]);
    
    const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        worksetsApi.updateDocumentNotes(workset.id, document.identifier, e.target.value);
    }, [workset.id, document.identifier, worksetsApi]);

    const TabButton: React.FC<{tab: 'reader' | 'ai' | 'notes', label: string}> = ({tab, label}) => (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50'}`}
      >{label}</button>
    );

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
        }

        if (error) {
            return (
                <div className="flex flex-col justify-center items-center h-full text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={fetchText}
                        className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
                    >
                        {t('common:retry')}
                    </button>
                </div>
            );
        }

        switch (activeTab) {
            case 'reader':
                return (
                     <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-serif text-gray-300">
                        {text}
                    </div>
                );
            case 'ai':
                return (
                    <AIToolsTab 
                        itemIdentifier={document.identifier}
                        textContent={text}
                        isLoadingText={isLoading}
                        onClose={() => onSelectDocument(null)}
                    />
                );
            case 'notes':
                return (
                    <textarea
                        ref={notesRef}
                        defaultValue={document.notes}
                        onChange={handleNotesChange}
                        placeholder={t('scriptorium:reader.notesPlaceholder')}
                        className="w-full h-full bg-gray-900/50 text-gray-200 p-4 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <header className="mb-4">
                <h3 className="text-xl font-bold text-white">{document.title}</h3>
                <p className="text-sm text-gray-400">{document.creator?.toString()}</p>
            </header>
            <div className="flex items-center space-x-2 border-b border-gray-700 pb-2 mb-4">
                <TabButton tab="reader" label={t('scriptorium.reader.tabReader')} />
                <TabButton tab="ai" label={t('scriptorium.reader.tabAI')} />
                <TabButton tab="notes" label={t('scriptorium.reader.tabNotes')} />
            </div>
            <div className="flex-grow overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};