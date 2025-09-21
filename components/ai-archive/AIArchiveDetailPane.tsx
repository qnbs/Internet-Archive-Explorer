
import React, { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { deleteAIArchiveEntryAtom, updateAIEntryTagsAtom, updateAIArchiveEntryAtom } from '../../store/aiArchive';
import { modalAtom } from '../../store/app';
import type { AIArchiveEntry, ExtractedEntities, ImageAnalysisResult, MagicOrganizeResult } from '../../types';
import { AIGenerationType } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { BrainIcon, ArrowLeftIcon, TrashIcon, TagIcon, CloseIcon } from '../Icons';
import { SourceItemCard } from './SourceItemCard';
import { useDebounce } from '../../hooks/useDebounce';

const Tag: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <div className="flex items-center gap-1.5 bg-cyan-500/80 text-white text-xs font-semibold pl-2 pr-1 py-1 rounded-full">
        <span>{label}</span>
        <button onClick={onRemove} className="rounded-full hover:bg-black/20"><CloseIcon className="w-3.5 h-3.5" /></button>
    </div>
);

const ContentRenderer: React.FC<{ entry: AIArchiveEntry }> = ({ entry }) => {
    const { t } = useLanguage();
    const content = entry.content;

    if (typeof content === 'string') {
        return <p className="text-gray-300 whitespace-pre-wrap">{content}</p>;
    }
    
    if (entry.type === AIGenerationType.Entities) {
        const entities = content as ExtractedEntities;
        return (
            <div className="space-y-3 text-sm">
                {entities.people.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:people')}</h4><p>{entities.people.join(', ')}</p></div>}
                {entities.places.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:places')}</h4><p>{entities.places.join(', ')}</p></div>}
                {entities.organizations.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:organizations')}</h4><p>{entities.organizations.join(', ')}</p></div>}
                {entities.dates.length > 0 && <div><h4 className="font-semibold text-gray-400 mb-1">{t('common:dates')}</h4><p>{entities.dates.join(', ')}</p></div>}
            </div>
        );
    }
    
    if (entry.type === AIGenerationType.ImageAnalysis) {
        const analysis = content as ImageAnalysisResult;
        return (
            <div className="space-y-3 text-sm">
                 <p className="italic">"{analysis.description}"</p>
                 <div className="flex flex-wrap gap-2">{analysis.tags.map(t => <span key={t} className="bg-gray-700 text-cyan-300 px-2 py-1 rounded-full text-xs">{t}</span>)}</div>
            </div>
        );
    }
    
    if (entry.type === AIGenerationType.MagicOrganize) {
        const suggestions = content as MagicOrganizeResult;
        return (
            <div className="space-y-3 text-sm">
                <div><h4 className="font-semibold text-gray-400 mb-1">{t('favorites:magicOrganize.suggestedTags')}</h4><p>{suggestions.tags.join(', ')}</p></div>
                <div><h4 className="font-semibold text-gray-400 mb-1">{t('favorites:magicOrganize.suggestedCollections')}</h4><p>{suggestions.collections.join(', ')}</p></div>
            </div>
        );
    }

    return <p className="text-gray-500">Cannot display this content type.</p>;
};


export const AIArchiveDetailPane: React.FC<{ selectedEntry: AIArchiveEntry | null; onBack: () => void; }> = ({ selectedEntry, onBack }) => {
    const { t, language } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const deleteEntry = useSetAtom(deleteAIArchiveEntryAtom);
    const updateTags = useSetAtom(updateAIEntryTagsAtom);
    const updateEntry = useSetAtom(updateAIArchiveEntryAtom);

    const [notes, setNotes] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [isNotesSaved, setIsNotesSaved] = useState(false);
    // Fix: Corrected invalid hook call syntax and improved type safety for the timeout ref.
    const notesSavedTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedNotes = useDebounce(notes, 1000);

    useEffect(() => {
        if (selectedEntry) {
            setNotes(selectedEntry.userNotes || '');
            setIsSavingNotes(false);
            setIsNotesSaved(false);
            // Fix: Guard clearTimeout to prevent errors if the ref is not set.
            if (notesSavedTimeout.current) clearTimeout(notesSavedTimeout.current);
        }
    }, [selectedEntry]);

    useEffect(() => {
        if (selectedEntry && notes !== (selectedEntry.userNotes || '')) {
            setIsSavingNotes(true);
            setIsNotesSaved(false);
            if (notesSavedTimeout.current) clearTimeout(notesSavedTimeout.current);
        }
    }, [notes, selectedEntry]);

    useEffect(() => {
        if (selectedEntry && debouncedNotes !== (selectedEntry.userNotes || '')) {
            updateEntry({ ...selectedEntry, userNotes: debouncedNotes });
            setIsSavingNotes(false);
            setIsNotesSaved(true);
            // FIX: Use standard `setTimeout` for consistency.
            notesSavedTimeout.current = setTimeout(() => setIsNotesSaved(false), 2000);
        }
    }, [debouncedNotes, selectedEntry, updateEntry]);

    const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim() && selectedEntry) {
            e.preventDefault();
            const newTags = [...new Set([...selectedEntry.tags, tagInput.trim()])];
            updateTags({ id: selectedEntry.id, tags: newTags });
            setTagInput('');
        }
    };

    const handleTagRemove = (tagToRemove: string) => {
        if (!selectedEntry) return;
        const newTags = selectedEntry.tags.filter(t => t !== tagToRemove);
        updateTags({ id: selectedEntry.id, tags: newTags });
    };

    if (!selectedEntry) {
        return (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-gray-500 p-8 bg-gray-800/60 rounded-xl">
                 <BrainIcon className="w-16 h-16 text-gray-700 mb-4" />
                <h2 className="text-xl font-bold text-white">{t('aiArchive:details.select')}</h2>
            </div>
        );
    }
    
    const handleDelete = () => {
        setModal({
            type: 'confirmation',
            options: {
                title: t('aiArchive:details.deleteTitle'),
                message: t('aiArchive:details.deleteMessage'),
                onConfirm: () => deleteEntry(selectedEntry.id),
            }
        });
    };
    
    const date = new Date(selectedEntry.timestamp).toLocaleString(language, { dateStyle: 'long', timeStyle: 'short' });

    return (
        <div className="bg-gray-800/60 rounded-xl h-full flex flex-col p-4">
            <header className="flex-shrink-0 pb-3 flex items-center justify-between gap-3 border-b border-gray-700">
                <button onClick={onBack} className="md:hidden p-1 text-gray-400 hover:text-white"><ArrowLeftIcon className="w-5 h-5" /></button>
                <div className="min-w-0">
                    <h2 className="text-md font-bold text-white truncate">{t(`aiArchive:types.${selectedEntry.type}`)}</h2>
                    <p className="text-sm text-gray-400 truncate">{date}</p>
                </div>
                <button onClick={handleDelete} className="ml-auto p-2 text-gray-400 hover:text-red-400 rounded-full"><TrashIcon className="w-5 h-5" /></button>
            </header>
            
            <div className="flex-grow overflow-y-auto mt-4 space-y-4 pr-1">
                {selectedEntry.source && <SourceItemCard source={selectedEntry.source} />}
                {selectedEntry.sources && (
                    <div className="mt-1">
                        <h4 className="font-semibold text-gray-300 mb-2">{t('aiArchive:details.sources')}</h4>
                        <div className="space-y-2">
                            {selectedEntry.sources.map(s => <SourceItemCard key={s.identifier} source={s} />)}
                        </div>
                    </div>
                )}
                
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ContentRenderer entry={selectedEntry} />
                </div>
                
                <div>
                    <h3 className="font-semibold text-gray-300 mb-2 flex items-center gap-2"><TagIcon className="w-5 h-5 text-gray-400"/> {t('favorites:details.tags')}</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map(tag => <Tag key={tag} label={tag} onRemove={() => handleTagRemove(tag)} />)}
                    </div>
                     <input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleTagAdd}
                        placeholder={t('favorites:details.addTagPlaceholder')}
                        className="w-full bg-gray-900/50 mt-2 py-1.5 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-300">{t('favorites:details.notes')}</h3>
                        <div className="text-right text-xs text-gray-500 h-4">
                            {isSavingNotes && <span>Saving...</span>}
                            {isNotesSaved && <span className="text-green-400">Saved</span>}
                        </div>
                    </div>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder={t('favorites:details.notesPlaceholder')}
                        className="w-full h-32 bg-gray-900/50 p-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
            </div>
        </div>
    );
};
