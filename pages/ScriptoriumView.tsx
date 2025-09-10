
import React, { useState } from 'react';
import { useWorksets } from '../hooks/useWorksets';
import { ScriptoriumHub } from '../components/scriptorium/ScriptoriumHub';
import { WorkspacePanel } from '../components/scriptorium/WorkspacePanel';
import type { Workset, WorksetDocument, ConfirmationOptions } from '../types';
import { Spinner } from '../components/Spinner';
import { useLanguage } from '../contexts/LanguageContext';

interface ScriptoriumViewProps {
    showConfirmation: (options: ConfirmationOptions) => void;
}

export const ScriptoriumView: React.FC<ScriptoriumViewProps> = ({ showConfirmation }) => {
    const worksetsApi = useWorksets();
    const { t } = useLanguage();
    const [selectedWorkset, setSelectedWorkset] = useState<Workset | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<WorksetDocument | null>(null);

    const handleSelectWorkset = (workset: Workset) => {
        const fullWorkset = worksetsApi.worksets.find(ws => ws.id === workset.id);
        setSelectedWorkset(fullWorkset || null);
        setSelectedDocument(null); // Clear document selection when changing workset
    };

    const handleBackToHub = () => {
        setSelectedWorkset(null);
        setSelectedDocument(null);
    };

    const handleDeleteWorkset = (id: string) => {
        const workset = worksetsApi.worksets.find(ws => ws.id === id);
        if (!workset) return;

        showConfirmation({
            title: t('scriptorium:deleteWorkset'),
            message: t('scriptorium:confirmDelete', { worksetName: workset.name }),
            confirmLabel: t('common:delete'),
            confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            onConfirm: () => worksetsApi.deleteWorkset(id),
        });
    };
    
    if (worksetsApi.isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    }

    return (
        <div className="animate-page-fade-in">
            {selectedWorkset ? (
                <WorkspacePanel 
                    workset={selectedWorkset} 
                    worksetsApi={worksetsApi}
                    onBack={handleBackToHub}
                    selectedDocument={selectedDocument}
                    onSelectDocument={setSelectedDocument}
                />
            ) : (
                <ScriptoriumHub 
                    worksets={worksetsApi.worksets} 
                    onSelectWorkset={handleSelectWorkset}
                    onCreateWorkset={worksetsApi.createWorkset}
                    onDeleteWorkset={handleDeleteWorkset}
                />
            )}
        </div>
    );
};
