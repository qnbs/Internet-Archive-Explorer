

import React from 'react';
import type { Workset, WorksetDocument } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const DocumentStackIcon: React.FC<{active?: boolean}> = ({active}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 flex-shrink-0 ${active ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
);
const DocumentIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);
const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

interface WorkspacePanelProps {
    worksets: Workset[];
    activeWorksetId: string | null;
    onSetActiveWorkset: (id: string | null) => void;
    onSaveWorksets: (worksets: Workset[]) => void;
    onSelectDocument: (doc: WorksetDocument) => void;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({ worksets, activeWorksetId, onSetActiveWorkset, onSaveWorksets, onSelectDocument }) => {
    const { t } = useLanguage();

    const handleNewWorkset = () => {
        const name = prompt(t('scriptorium.newWorksetPrompt'));
        if (name) {
            const newWorkset: Workset = { id: Date.now().toString(), name, documents: [] };
            const newWorksets = [...worksets, newWorkset];
            onSaveWorksets(newWorksets);
            onSetActiveWorkset(newWorkset.id);
        }
    };

    const handleDeleteWorkset = (e: React.MouseEvent, worksetId: string) => {
        e.stopPropagation();
        if (window.confirm(t('scriptorium.deleteWorksetConfirm'))) {
            const newWorksets = worksets.filter(ws => ws.id !== worksetId);
            onSaveWorksets(newWorksets);
            if (activeWorksetId === worksetId) {
                onSetActiveWorkset(newWorksets.length > 0 ? newWorksets[0].id : null);
            }
        }
    };

    const activeWorkset = worksets.find(ws => ws.id === activeWorksetId);

    return (
        <aside className="bg-gray-800/60 p-4 rounded-xl shadow-lg h-full flex flex-col max-h-[calc(100vh-8rem)] sticky top-24">
            <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">{t('scriptorium.workspace')}</h2>
            <button onClick={handleNewWorkset} className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md mb-6 flex-shrink-0">
                <PlusIcon className="w-5 h-5 mr-2" />
                {t('scriptorium.newWorkset')}
            </button>
            <div className="flex-grow overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('scriptorium.myWorksets')}</h3>
                {worksets.length > 0 ? (
                    <ul className="space-y-1">
                        {worksets.map(workset => (
                            <li key={workset.id}>
                                <button
                                    onClick={() => onSetActiveWorkset(workset.id)}
                                    className={`w-full text-left flex items-center p-2 rounded-md transition-colors group ${activeWorksetId === workset.id ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}
                                >
                                    <DocumentStackIcon active={activeWorksetId === workset.id} />
                                    <div className="flex-grow truncate">
                                        <p className={`font-medium ${activeWorksetId === workset.id ? 'text-cyan-300' : 'text-gray-200'}`}>{workset.name}</p>
                                        <p className="text-xs text-gray-400">{t('scriptorium.numDocs', { count: workset.documents.length })}</p>
                                    </div>
                                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => handleDeleteWorkset(e, workset.id)} className="p-1 text-red-500 hover:text-red-400" aria-label={`Lösche ${workset.name}`}>
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </button>
                                {activeWorksetId === workset.id && activeWorkset && activeWorkset.documents.length > 0 && (
                                    <ul className="pl-6 pt-1 space-y-1 border-l-2 border-gray-700 ml-4 my-1">
                                      {activeWorkset.documents.map(doc => (
                                          <li key={doc.identifier}>
                                              <button onClick={() => onSelectDocument(doc)} className="w-full text-left flex items-center p-1.5 rounded-md hover:bg-gray-700/70">
                                                  <DocumentIcon />
                                                  <span className="text-sm text-gray-300 truncate" title={doc.title}>{doc.title}</span>
                                              </button>
                                          </li>
                                      ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 text-sm p-4">{t('scriptorium.noWorksets')}</p>
                )}
            </div>
        </aside>
    );
};
