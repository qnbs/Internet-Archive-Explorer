import React, { useState, useMemo, useEffect } from 'react';
import { useAtomValue, useAtom, useSetAtom } from 'jotai';
import { aiArchiveAtom, selectedAIEntryIdAtom, aiArchiveSearchQueryAtom } from '../store/aiArchive';
import type { AIArchiveEntry, AIArchiveFilter } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { BrainIcon } from '../components/Icons';
import { AIArchiveSidebar } from '../components/ai-archive/AIArchiveSidebar';
import { AIArchiveList } from '../components/ai-archive/AIArchiveList';
import { AIArchiveDetailPane } from '../components/ai-archive/AIArchiveDetailPane';
import { useDebounce } from '../hooks/useDebounce';

const AIArchiveEmptyState: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8 col-span-2">
            <BrainIcon className="w-16 h-16 text-gray-700 mb-4" />
            <h2 className="text-xl font-bold text-white">{t('aiArchive:empty.title')}</h2>
            <p className="mt-2 max-w-sm">{t('aiArchive:empty.description')}</p>
        </div>
    );
};

export type SortOption = 'timestamp_desc' | 'timestamp_asc' | 'type_asc';

const AIArchiveView: React.FC = () => {
    const [filter, setFilter] = useState<AIArchiveFilter>({ type: 'all' });
    const [selectedEntryId, setSelectedEntryId] = useAtom(selectedAIEntryIdAtom);
    const allEntries = useAtomValue(aiArchiveAtom);
    const [searchQuery, setSearchQuery] = useAtom(aiArchiveSearchQueryAtom);
    const [sort, setSort] = useState<SortOption>('timestamp_desc');
    const debouncedQuery = useDebounce(searchQuery, 300);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredEntries = useMemo(() => {
        let entries = [...allEntries];
        
        // Filter by selected category/tag
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
        
        // Sort entries
        const [sortKey, sortDir] = sort.split('_');
        entries.sort((a, b) => {
            let comparison = 0;
            if (sortKey === 'timestamp') {
                comparison = a.timestamp - b.timestamp;
            } else if (sortKey === 'type') {
                comparison = a.type.localeCompare(b.type);
            }
            return sortDir === 'asc' ? comparison : -comparison;
        });

        // Filter by search query
        if (debouncedQuery.trim()) {
            const lowerQuery = debouncedQuery.toLowerCase();
            entries = entries.filter(e => {
                const contentMatch = typeof e.content === 'string' && e.content.toLowerCase().includes(lowerQuery);
                const sourceMatch = e.source?.title.toLowerCase().includes(lowerQuery);
                const notesMatch = e.userNotes?.toLowerCase().includes(lowerQuery);
                return contentMatch || sourceMatch || notesMatch;
            });
        }
        return entries;
    }, [allEntries, filter, debouncedQuery, sort]);

    const selectedEntry = useMemo(() => 
        allEntries.find(entry => entry.id === selectedEntryId) || null,
        [selectedEntryId, allEntries]
    );

    useEffect(() => {
        if (selectedEntryId && !filteredEntries.some(entry => entry.id === selectedEntryId)) {
            setSelectedEntryId(null);
        }
    }, [filter, filteredEntries, selectedEntryId, setSelectedEntryId]);

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full animate-page-fade-in">
            <div className="hidden md:block">
                <AIArchiveSidebar
                    filter={filter}
                    setFilter={setFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sort={sort}
                    setSort={setSort}
                />
            </div>

            {isFilterOpen && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsFilterOpen(false)}>
                    <div className="absolute inset-y-0 left-0 w-4/5 max-w-xs bg-gray-800 shadow-xl animate-fade-in-left" onClick={e => e.stopPropagation()}>
                        <AIArchiveSidebar
                            filter={filter}
                            setFilter={setFilter}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            sort={sort}
                            setSort={setSort}
                            onClose={() => setIsFilterOpen(false)}
                        />
                    </div>
                </div>
            )}

            <main className="flex-grow flex-col md:flex-row gap-6 min-w-0 flex">
                {allEntries.length === 0 ? (
                    <AIArchiveEmptyState />
                ) : (
                    <div className="relative flex-grow overflow-hidden md:flex md:gap-6">
                        {/* List Panel */}
                        <div className={`absolute inset-0 transition-transform duration-300 ease-in-out md:relative md:w-2/5 lg:w-1/3 md:flex-shrink-0 ${selectedEntryId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                            <AIArchiveList
                                entries={filteredEntries}
                                selectedEntryId={selectedEntryId}
                                onSelectEntry={setSelectedEntryId}
                                onOpenFilters={() => setIsFilterOpen(true)}
                            />
                        </div>
                        {/* Detail Pane */}
                        <div className={`absolute inset-0 transition-transform duration-300 ease-in-out md:relative md:w-3/5 lg:w-2/3 md:flex-shrink-0 ${selectedEntryId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                            <AIArchiveDetailPane 
                                selectedEntry={selectedEntry}
                                onBack={() => setSelectedEntryId(null)}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AIArchiveView;