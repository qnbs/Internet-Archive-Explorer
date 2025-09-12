import React, { useState } from 'react';
import type { Workset, WorksetDocument } from '../../types';
import { useWorksets } from '../../hooks/useWorksets';
import { DocumentListItem } from './DocumentListItem';
import { DocumentReader } from './DocumentReader';
import { AddDocumentModal } from './AddDocumentModal';
import { useLanguage } from '../../hooks/useLanguage';
import { ArrowLeftIcon, PlusIcon } from '../Icons';

interface WorkspacePanelProps {
    workset: Workset;
    onBack: () => void;
    selectedDocument: WorksetDocument | null;
    onSelectDocument: (doc: WorksetDocument | null) => void;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ workset, onBack, selectedDocument, onSelectDocument }) => {
    const { t } = useLanguage();
    const worksetsApi = useWorksets();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="flex gap-6 h-[calc(100vh-10rem)]">
            {/* Document List Panel (Visible on mobile by default, or on desktop) */}
            <div className={`w-full md:w-1/3 lg:w-1/4 flex-col bg-gray-800/60 rounded-xl p-4 overflow-hidden ${selectedDocument ? 'hidden md:flex' : 'flex'}`}>
                <header className="flex-shrink-0">
                    <button onClick={onBack} className="flex items-center space-x-2 text-sm text-cyan-400 hover:underline mb-4">
                        <ArrowLeftIcon className="w-4 h-4" />
                        <span>{t('scriptorium.backToHub')}</span>
                    </button>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white truncate pr-2">{workset.name}</h2>
                        <button onClick={() => setIsAddModalOpen(true)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-cyan-400 flex-shrink-0" aria-label={t('scriptorium.addDocument')}>
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                    {workset.documents.length > 0 ? (
                        workset.documents.map(doc => (
                            <DocumentListItem 
                                key={doc.identifier} 
                                document={doc}
                                isSelected={selectedDocument?.identifier === doc.identifier} 
                                onSelect={() => onSelectDocument(doc)}
                                onRemove={() => worksetsApi.removeDocumentFromWorkset({ worksetId: workset.id, documentId: doc.identifier })}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-400 text-sm p-4">{t('scriptorium.noDocuments')}</p>
                    )}
                </div>
            </div>
             {/* Document Reader Panel (Visible on mobile only when a doc is selected, or on desktop) */}
            <div className={`w-full md:w-2/3 lg:w-3/4 flex-col bg-gray-800/60 rounded-xl overflow-hidden ${selectedDocument ? 'flex' : 'hidden md:flex'}`}>
                {selectedDocument ? <DocumentReader document={selectedDocument} onBack={() => onSelectDocument(null)} /> : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">{t('scriptorium.selectDocument')}</p>
                    </div>
                )}
            </div>
            {isAddModalOpen && <AddDocumentModal workset={workset} onAdd={(item) => worksetsApi.addDocumentToWorkset({ worksetId: workset.id, item })} onClose={() => setIsAddModalOpen(false)} />}
        </div>
    );
};