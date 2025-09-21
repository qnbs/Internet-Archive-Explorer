import React, { useState, useMemo, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { aiArchiveAtom } from '../store/aiArchive';
import { aiArchiveSearchQueryAtom, selectedAIEntryIdAtom } from '../store/aiArchive';
import type { AIArchiveEntry, AIArchiveFilter, AIArchiveSortOption } from '../types';
import { BrainIcon, FilterIcon } from '../components/Icons';
import { useLanguage } from '../hooks/useLanguage';
import { useDebounce } from '../hooks/useDebounce';
import { AIArchiveSidebar } from '../components/ai-archive/AIArchiveSidebar';
import { AIArchiveList } from '../components/ai-archive/AIArchiveList';
import { AIArchiveDetailPane } from '../components/ai-archive/AIArchiveDetailPane';

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
    const [searchQuery, setSearchQuery] = useAtom(aiArchiveSearchQueryAtom);
    const [selectedEntryId, setSelectedEntryId] = useAtom(selectedAIEntryIdAtom);
    
    const [filter, setFilter] = useState<AIArchiveFilter>({ type: 'all' });
    const [sort, setSort] = useState<AIArchiveSortOption>('timestamp_desc');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const filteredAndSortedEntries = useMemo(() => {
        let entries = [...allEntries];
        
        // Filter by search query
        if (debouncedSearchQuery) {
            const lowerQuery = debouncedSearchQuery.toLowerCase();
            entries = entries.filter(e => 
                (e.source?.title?.toLowerCase().includes(lowerQuery)) ||
                (typeof e.content === 'string' && e.content.toLowerCase().includes(lowerQuery)) ||
                (e.prompt?.toLowerCase().includes(lowerQuery))
            );
        }

        // Filter by active filter
        switch (filter.type) {
            case 'generation':
                entries = entries.filter(e => e.type === filter.generationType);
                break;
            case 'language':
                entries = entries.filter(e => e.language === filter.language);
                break;
            case 'tag':
                entries = entries.filter(e => e.tags.includes(filter.tag));
                break;
        }

        // Sort
        return entries.sort((a, b) => {
            switch (sort) {
                case 'timestamp_asc': return a.timestamp - b.timestamp;
                case 'type_asc': return a.type.localeCompare(b.type);
                case 'timestamp_desc':
                default:
                    return b.timestamp - a.timestamp;
            }
        });
    }, [allEntries, debouncedSearchQuery, filter, sort]);

    const selectedEntry = useMemo(() => {
        return allEntries.find(e => e.id === selectedEntryId) || null;
    }, [allEntries, selectedEntryId]);

    // When filter changes, deselect entry if it's not in the new filtered list
    useEffect(() => {
        if (selectedEntryId && !filteredAndSortedEntries.some(e => e.id === selectedEntryId)) {
            setSelectedEntryId(null);
        }
    }, [filteredAndSortedEntries, selectedEntryId, setSelectedEntryId]);

    if (allEntries.length === 0) {
        return (
             <div className="animate-page-fade-in flex items-center justify-center min-h-[60vh]">
                <AIArchiveEmptyState />
            </div>
        );
    }
    
    const sidebarProps = { filter, setFilter, searchQuery, setSearchQuery, sort, setSort };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full min-h-[calc(100vh-10rem)] animate-page-fade-in">
             {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}>
                    <div className="bg-gray-900 w-72 h-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <AIArchiveSidebar {...sidebarProps} onClose={() => setIsSidebarOpen(false)} />
                    </div>
                </div>
            )}
            <div className="hidden md:block">
                 <AIArchiveSidebar {...sidebarProps} />
            </div>
            
             <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    <div className="lg:col-span-1">
                        <AIArchiveList
                            entries={filteredAndSortedEntries}
                            selectedEntryId={selectedEntryId}
                            onSelectEntry={setSelectedEntryId}
                            onOpenFilters={() => setIsSidebarOpen(true)}
                        />
                    </div>
                    <div className="hidden lg:block lg:col-span-1">
                        <AIArchiveDetailPane selectedEntry={selectedEntry} onBack={() => setSelectedEntryId(null)} />
                    </div>
                    {selectedEntry && (
                        <div className="fixed inset-0 bg-gray-900 z-20 p-4 md:p-6 lg:hidden animate-fade-in-left">
                           <AIArchiveDetailPane selectedEntry={selectedEntry} onBack={() => setSelectedEntryId(null)} />
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

export default AIArchiveView;