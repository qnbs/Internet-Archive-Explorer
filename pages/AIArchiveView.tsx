import React, { useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { aiArchiveAtom } from '../store/aiArchive';
import { AIArchiveItemCard } from '../components/ai-archive/AIArchiveItemCard';
import { BrainIcon } from '../components/Icons';
import { useLanguage } from '../hooks/useLanguage';
import { AIArchiveDetailModal } from '../components/ai-archive/AIArchiveDetailModal';

// FIX: Export SortOption type for use in other components.
export type SortOption = 'timestamp_desc' | 'timestamp_asc' | 'type_asc';

const AIArchiveEmptyState: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8 col-span-full">
            <BrainIcon className="w-16 h-16 text-gray-700 mb-4" />
            <h2 className="text-xl font-bold text-white">{t('aiArchive:empty.title')}</h2>
            <p className="mt-2 max-w-sm">{t('aiArchive:empty.description')}</p>
        </div>
    );
};

const AIArchiveView: React.FC = () => {
    const { t } = useLanguage();
    const allEntries = useAtomValue(aiArchiveAtom);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

    const sortedEntries = useMemo(() => {
        return [...allEntries].sort((a, b) => b.timestamp - a.timestamp);
    }, [allEntries]);
    
    const selectedEntry = useMemo(() => {
        return allEntries.find(e => e.id === selectedEntryId) || null;
    }, [allEntries, selectedEntryId]);

    if (allEntries.length === 0) {
        return (
             <div className="animate-page-fade-in flex items-center justify-center min-h-[60vh]">
                <AIArchiveEmptyState />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-page-fade-in">
            <header>
                 <h1 className="text-3xl font-bold text-white flex items-center gap-2"><BrainIcon /> {t('sideMenu:aiArchive')}</h1>
            </header>

            <div className="space-y-2">
                {sortedEntries.map(entry => (
                    <AIArchiveItemCard
                        key={entry.id}
                        entry={entry}
                        isSelected={false}
                        onSelect={() => setSelectedEntryId(entry.id)}
                    />
                ))}
            </div>
            
            {selectedEntry && (
                <AIArchiveDetailModal 
                    entry={selectedEntry}
                    onClose={() => setSelectedEntryId(null)}
                />
            )}
        </div>
    );
};

export default AIArchiveView;
