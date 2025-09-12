import React, { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
// FIX: Use direct imports to prevent circular dependency issues.
import { updateLibraryItemNotesAtom, updateLibraryItemTagsAtom } from '../../store/favorites';
import { modalAtom } from '../../store/app';
import type { LibraryItem } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { RichTextEditor } from '../RichTextEditor';
import { CloseIcon, TagIcon, PlusIcon } from '../Icons';

interface LibraryDetailPaneProps {
    selectedItem: LibraryItem | null;
}

const Tag: React.FC<{ tag: string, onRemove: () => void }> = ({ tag, onRemove }) => (
    <div className="flex items-center gap-1.5 bg-gray-700 text-cyan-300 text-xs font-semibold px-2 py-1 rounded-full">
        <span>{tag}</span>
        <button onClick={onRemove} className="rounded-full hover:bg-black/20" aria-label={`Remove ${tag} tag`}>
            <CloseIcon className="w-3.5 h-3.5" />
        </button>
    </div>
);

export const LibraryDetailPane: React.FC<LibraryDetailPaneProps> = ({ selectedItem }) => {
    const { t } = useLanguage();
    const setModal = useSetAtom(modalAtom);
    const updateNotes = useSetAtom(updateLibraryItemNotesAtom);
    const updateTags = useSetAtom(updateLibraryItemTagsAtom);
    const [newTag, setNewTag] = useState('');

    const handleSaveNotes = (notes: string) => {
        if (selectedItem) {
            updateNotes({ identifier: selectedItem.identifier, notes });
        }
    };
    
    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItem && newTag.trim()) {
            const newTags = [...selectedItem.tags, newTag.trim()];
            updateTags({ identifier: selectedItem.identifier, tags: newTags });
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (selectedItem) {
            const newTags = selectedItem.tags.filter(t => t !== tagToRemove);
            updateTags({ identifier: selectedItem.identifier, tags: newTags });
        }
    };
    
    if (!selectedItem) {
        return (
            <div className="bg-gray-800/60 rounded-xl h-full flex items-center justify-center">
                <p className="text-gray-500">{t('favorites:noItemSelected')}</p>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800/60 rounded-xl h-full flex flex-col">
            <header className="p-4 border-b border-gray-700 flex-shrink-0">
                <h3 className="font-bold text-lg text-white truncate">{selectedItem.title}</h3>
                <p className="text-sm text-gray-400 truncate">{Array.isArray(selectedItem.creator) ? selectedItem.creator.join(', ') : selectedItem.creator}</p>
                <button onClick={() => setModal({ type: 'itemDetail', item: selectedItem })} className="text-sm text-cyan-400 hover:underline mt-2">
                    {t('favorites:itemDetail.viewFullDetails')} &rarr;
                </button>
            </header>

            <div className="flex-grow flex flex-col p-4 space-y-4 min-h-0">
                <div className="flex-shrink-0">
                     <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2"><TagIcon /> {t('favorites:itemDetail.tags')}</h4>
                     <div className="flex flex-wrap gap-2 items-center">
                        {selectedItem.tags.length > 0 ? selectedItem.tags.map(tag => (
                            <Tag key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
                        )) : <p className="text-sm text-gray-500">{t('favorites:itemDetail.noTags')}</p>}
                        <form onSubmit={handleAddTag} className="flex-grow">
                            <input
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                placeholder={t('favorites:itemDetail.addTagPlaceholder')}
                                className="bg-transparent text-sm w-full focus:outline-none"
                            />
                        </form>
                     </div>
                </div>
                <div className="flex-grow min-h-0">
                    <RichTextEditor
                        key={selectedItem.identifier} // Re-mount editor when item changes
                        initialValue={selectedItem.notes}
                        onSave={handleSaveNotes}
                    />
                </div>
            </div>
        </div>
    );
};