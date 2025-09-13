import React from 'react';
import type { AIArchiveEntry } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { AIArchiveItemCard } from './AIArchiveItemCard';
import { FilterIcon } from '../Icons';

interface AIArchiveListProps {
    entries: AIArchiveEntry[];
    selectedEntryId: string | null;
    onSelectEntry: (id: string | null) => void;
    onOpenFilters: () => void;
}

export const AIArchiveList: React.FC<AIArchiveListProps> = ({ entries, selectedEntryId, onSelectEntry, onOpenFilters }) => {
    const { t } = useLanguage();

    return (
        <div className="bg-gray-800/60 rounded-xl h-full flex flex-col p-4">
            <header className="flex-shrink-0 pb-3 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">{t('aiArchive:list.title')}</h2>
                 <button onClick={onOpenFilters} className="p-2 -mr-2 text-gray-300 md:hidden bg-gray-700/50 rounded-lg hover:bg-gray-700">
                    <FilterIcon className="w-5 h-5" />
                </button>
            </header>
            
            <div className="flex-grow overflow-y-auto space-y-2 pr-1 mt-2">
                {entries.length > 0 ? entries.map(entry => (
                    <AIArchiveItemCard
                        key={entry.id}
                        entry={entry}
                        onSelect={() => onSelectEntry(selectedEntryId === entry.id ? null : entry.id)}
                        isSelected={selectedEntryId === entry.id}
                    />
                )) : (
                  <div className="text-center text-gray-500 pt-16">
                    <p>{t('common:noResultsFound')}</p>
                  </div>
                )}
            </div>
        </div>
    );
};