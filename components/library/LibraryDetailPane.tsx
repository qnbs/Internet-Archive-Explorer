import React, { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { updateLibraryItemNotesAtom, updateLibraryItemTagsAtom } from '../../store/favorites';
import type { LibraryItem } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { useDebounce } from '../../hooks/useDebounce';
import { StarIcon, ArrowLeftIcon, TagIcon, CloseIcon } from '../Icons';
import { modalAtom } from '../../store/app';

const Tag: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
    <div className="flex items-center gap-1.5 bg-cyan-500/80 text-white text-xs font-semibold pl-2 pr-1 py-1 rounded-full">
        <span>{label}</span>
        <button onClick={onRemove} className="rounded-full hover:bg-black/20"><CloseIcon className="w-3.5 h-3.5" /></button>
    </div>
);

export const LibraryDetailPane: React.FC<{ selectedItem: LibraryItem | null; onBack: () => void; }> = ({ selectedItem, onBack }) => {
    const { t } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const updateNotesAtom = useSetAtom(updateLibraryItemNotesAtom);
    const updateTagsAtom = useSetAtom(updateLibraryItemTagsAtom);
    
    const debouncedNotes = useDebounce(notes, 500);

    useEffect(() => {
        if (selectedItem) {
            setNotes(selectedItem.notes);
            setTags(selectedItem.tags);
        }
    }, [selectedItem]);
    
    useEffect(() => {
        if (selectedItem && debouncedNotes !== selectedItem.notes) {
            updateNotesAtom({ id: selectedItem.identifier, notes: debouncedNotes });
        }
    }, [debouncedNotes, selectedItem, updateNotesAtom]);
    
    const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim() && selectedItem) {
            e.preventDefault();
            const newTags = [...new Set([...tags, tagInput.trim()])];
            setTags(newTags);
            updateTagsAtom({ id: selectedItem.identifier, tags: newTags });
            setTagInput('');
        }
    };
    
    const handleTagRemove = (tagToRemove: string) => {
        if (!selectedItem) return;
        const newTags = tags.filter(t => t !== tagToRemove);
        setTags(newTags);
        updateTagsAtom({ id: selectedItem.identifier, tags: newTags });
    };

    if (!selectedItem) {
        return (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-gray-500 p-8 bg-gray-800/60 rounded-xl">
                 <StarIcon className="w-16 h-16 text-gray-700 mb-4" />
                <h2 className="text-xl font-bold text-white">{t('favorites:details.selectItem')}</h2>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/60 rounded-xl h-full flex flex-col p-4">
            <header className="flex-shrink-0 pb-3 flex items-center gap-3 border-b border-gray-700">
                <button onClick={onBack} className="md:hidden p-1 text-gray-400 hover:text-white"><ArrowLeftIcon className="w-5 h-5" /></button>
                <img src={`https://archive.org/services/get-item-image.php?identifier=${selectedItem.identifier}`} alt="" className="w-10 h-10 object-cover rounded-md flex-shrink-0" />
                <div className="min-w-0">
                    <h2 className="text-md font-bold text-white truncate">{selectedItem.title}</h2>
                    <p className="text-sm text-gray-400 truncate">{Array.isArray(selectedItem.creator) ? selectedItem.creator.join(', ') : selectedItem.creator}</p>
                </div>
                 <button onClick={() => setModal({ type: 'itemDetail', item: selectedItem })} className="ml-auto flex-shrink-0 px-3 py-1.5 text-sm font-semibold rounded-lg text-cyan-400 hover:bg-cyan-500/10">
                    {t('common:viewDetails')}
                </button>
            </header>
            
            <div className="flex-grow overflow-y-auto mt-4 space-y-4 pr-1">
                 <div>
                    <h3 className="font-semibold text-gray-300 mb-2 flex items-center gap-2"><TagIcon className="w-5 h-5 text-gray-400"/> {t('favorites:details.tags')}</h3>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => <Tag key={tag} label={tag} onRemove={() => handleTagRemove(tag)} />)}
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
                    <h3 className="font-semibold text-gray-300 mb-2">{t('favorites:details.notes')}</h3>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder={t('favorites:details.notesPlaceholder')}
                        className="w-full h-48 bg-gray-900/50 p-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
            </div>
        </div>
    );
};
