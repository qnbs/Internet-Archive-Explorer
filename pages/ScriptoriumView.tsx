
import React, { useState, useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import { selectedWorksetIdAtom, selectedDocumentIdAtom } from '../store/scriptorium';
import { useWorksets } from '../hooks/useWorksets';
import { ScriptoriumHub } from '../components/scriptorium/ScriptoriumHub';
import { WorkspacePanel } from '../components/scriptorium/WorkspacePanel';
import { Spinner } from '../components/Spinner';
import type { Workset, WorksetDocument, ConfirmationOptions } from '../types';

interface ScriptoriumViewProps {
  showConfirmation: (options: ConfirmationOptions) => void;
}

const ScriptoriumView: React.FC<ScriptoriumViewProps> = ({ showConfirmation }) => {
    const { worksets, isLoading, ...worksetsApi } = useWorksets();
    const [selectedWorksetId, setSelectedWorksetId] = useAtom(selectedWorksetIdAtom);
    const [selectedDocumentId, setSelectedDocumentId] = useAtom(selectedDocumentIdAtom);

    const selectedWorkset = useMemo(() => {
        return worksets.find(ws => ws.id === selectedWorksetId);
    }, [worksets, selectedWorksetId]);

    const selectedDocument = useMemo(() => {
        return selectedWorkset?.documents.find(d => d.identifier === selectedDocumentId);
    }, [selectedWorkset, selectedDocumentId]);
    
    // Deselect document if its workset is no longer selected
    useEffect(() => {
        if (selectedWorksetId && selectedDocumentId) {
            const workset = worksets.find(ws => ws.id === selectedWorksetId);
            if (!workset || !workset.documents.some(d => d.identifier === selectedDocumentId)) {
                setSelectedDocumentId(null);
            }
        }
    }, [selectedWorksetId, selectedDocumentId, worksets, setSelectedDocumentId]);
    
    const handleSelectWorkset = (workset: Workset) => {
        setSelectedWorksetId(workset.id);
    };

    const handleBackToHub = () => {
        setSelectedWorksetId(null);
        setSelectedDocumentId(null);
    };

    const handleDeleteWorkset = (id: string) => {
        showConfirmation({
            title: 'Delete Workset?',
            message: `Are you sure you want to delete this workset? This action cannot be undone.`,
            onConfirm: () => {
                worksetsApi.deleteWorkset(id);
                if (selectedWorksetId === id) {
                    handleBackToHub();
                }
            }
        });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    if (selectedWorkset) {
        return (
            <div className="h-[calc(100vh-6rem)] animate-page-fade-in">
                <WorkspacePanel 
                    workset={selectedWorkset} 
                    onBack={handleBackToHub}
                    selectedDocument={selectedDocument || null}
                    onSelectDocument={(doc) => setSelectedDocumentId(doc?.identifier || null)}
                />
            </div>
        );
    }

    return (
        <div className="animate-page-fade-in">
            <ScriptoriumHub
                worksets={worksets}
                onSelectWorkset={handleSelectWorkset}
                onCreateWorkset={(name) => worksetsApi.createWorkset(name)}
                onDeleteWorkset={handleDeleteWorkset}
                onRenameWorkset={worksetsApi.updateWorksetName}
            />
        </div>
    );
};

export default ScriptoriumView;
