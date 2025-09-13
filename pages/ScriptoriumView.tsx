import React, { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useWorksets } from '../hooks/useWorksets';
import { ScriptoriumHub } from '../components/scriptorium/ScriptoriumHub';
import { WorkspacePanel } from '../components/scriptorium/WorkspacePanel';
import type { Workset, WorksetDocument, ConfirmationOptions } from '../types';
import { Spinner } from '../components/Spinner';
import { useLanguage } from '../hooks/useLanguage';
import { selectedWorksetIdAtom, selectedDocumentIdAtom, worksetsAtom } from '../store/scriptorium';

interface ScriptoriumViewProps {
    showConfirmation: (options: ConfirmationOptions) => void;
}

const ScriptoriumView: React.FC<ScriptoriumViewProps> = ({ showConfirmation }) => {
    const worksetsApi = useWorksets();
    const { t } = useLanguage();
    
    const worksets = useAtomValue(worksetsAtom);
    const [selectedWorksetId, setSelectedWorksetId] = useAtom(selectedWorksetIdAtom);
    const [selectedDocumentId, setSelectedDocumentId] = useAtom(selectedDocumentIdAtom);

    const selectedWorkset = worksets.find(ws => ws.id === selectedWorksetId) || null;
    const selectedDocument = selectedWorkset?.documents.find(doc => doc.identifier === selectedDocumentId) || null;

    // Effect to clear selected document if workset changes or becomes invalid
    useEffect(() => {
        if (selectedWorkset && !selectedWorkset.documents.some(d => d.identifier === selectedDocumentId)) {
            setSelectedDocumentId(null);
        }
    }, [selectedWorkset, selectedDocumentId, setSelectedDocumentId]);


    const handleSelectWorkset = (workset: Workset) => {
        setSelectedWorksetId(workset.id);
        setSelectedDocumentId(null); // Clear document selection when changing workset
    };

    const handleBackToHub = () => {
        setSelectedWorksetId(null);
        setSelectedDocumentId(null);
    };

    const handleDeleteWorkset = (id: string) => {
        const workset = worksetsApi.worksets.find(ws => ws.id === id);
        if (!workset) return;

        showConfirmation({
            title: t('scriptorium:deleteWorkset'),
            message: t('scriptorium:confirmDelete', { worksetName: workset.name }),
            confirmLabel: t('common:delete'),
            confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            onConfirm: () => {
                worksetsApi.deleteWorkset(id);
                if (selectedWorksetId === id) {
                    handleBackToHub();
                }
            },
        });
    };
    
    if (worksetsApi.isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

    return (
        <div className="animate-page-fade-in h-full">
            {selectedWorkset ? (
                <WorkspacePanel 
                    workset={selectedWorkset} 
                    onBack={handleBackToHub}
                    selectedDocument={selectedDocument}
                    onSelectDocument={(doc) => setSelectedDocumentId(doc ? doc.identifier : null)}
                />
            ) : (
                <ScriptoriumHub 
                    worksets={worksetsApi.worksets} 
                    onSelectWorkset={handleSelectWorkset}
                    onCreateWorkset={(name) => {
                        const newWorkset = worksetsApi.createWorkset(name);
                        handleSelectWorkset(newWorkset);
                        return newWorkset;
                    }}
                    onDeleteWorkset={handleDeleteWorkset}
                    onRenameWorkset={worksetsApi.updateWorksetName}
                />
            )}
        </div>
    );
};

export default ScriptoriumView;