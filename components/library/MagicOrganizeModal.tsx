import React, { useState, useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { libraryItemsAtom, addItemsToCollectionAtom, createCollectionAtom, addTagsToItemsAtom, userCollectionsAtom } from '../../store/favorites';
// Fix: Corrected import path for toastAtom to resolve circular dependency.
import { toastAtom } from '../../store/toast';
import { organizeLibraryItems } from '../../services/geminiService';
import { useLanguage } from '../../hooks/useLanguage';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { CloseIcon, SparklesIcon } from '../Icons';
import { AILoadingIndicator } from '../AILoadingIndicator';
import type { UserCollection } from '../../types';

interface MagicOrganizeModalProps {
    itemIds: string[];
    onClose: () => void;
}

export const MagicOrganizeModal: React.FC<MagicOrganizeModalProps> = ({ itemIds, onClose }) => {
    const { t, language } = useLanguage();
    const allLibraryItems = useAtomValue(libraryItemsAtom);
    const existingCollections = useAtomValue(userCollectionsAtom);
    const addTagsToItems = useSetAtom(addTagsToItemsAtom);
    const addItemsToCollection = useSetAtom(addItemsToCollectionAtom);
    const createCollection = useSetAtom(createCollectionAtom);
    const setToast = useSetAtom(toastAtom);

    const [suggestions, setSuggestions] = useState<{ tags: string[], collections: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());

    const modalRef = useRef<HTMLDivElement>(null);
    useModalFocusTrap({ modalRef, isOpen: true, onClose });

    useEffect(() => {
        const itemsToOrganize = allLibraryItems.filter(item => itemIds.includes(item.identifier))
            .map(item => ({ title: item.title, description: item.creator?.toString() }));

        if (itemsToOrganize.length === 0) {
            setError('No items selected for organization.');
            setIsLoading(false);
            return;
        }

        organizeLibraryItems(itemsToOrganize, language)
            .then(res => {
                setSuggestions(res);
                setSelectedTags(new Set(res.tags));
                setSelectedCollections(new Set(res.collections));
            })
            .catch(err => setError(err.message || t('common:error')))
            .finally(() => setIsLoading(false));

    }, [itemIds, allLibraryItems, language, t]);
    
    const toggleSelection = (set: Set<string>, item: string) => {
        const newSet = new Set(set);
        if (newSet.has(item)) {
            newSet.delete(item);
        } else {
            newSet.add(item);
        }
        return newSet;
    };

    const handleApply = () => {
        // Apply Tags
        if (selectedTags.size > 0) {
            addTagsToItems({ itemIds, tags: Array.from(selectedTags) });
            setToast({ type: 'success', message: t('favorites:magicOrganize.tagsApplied') });
        }

        // Apply Collections
        if (selectedCollections.size > 0) {
            Array.from(selectedCollections).forEach(collectionName => {
                let collection = existingCollections.find(c => c.name.toLowerCase() === collectionName.toLowerCase());
                if (!collection) {
                    collection = createCollection(collectionName);
                }
                addItemsToCollection({ collectionId: collection.id, itemIds });
                 setToast({ type: 'success', message: t('favorites:magicOrganize.collectionCreated', { name: collection.name }) });
            });
        }
        
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog">
            <div ref={modalRef} className="bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <SparklesIcon className="text-cyan-400" /> {t('favorites:bulkActions.magicOrganize')}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {isLoading ? <AILoadingIndicator type="summary" /> :
                     error ? <p className="text-red-400 text-center">{error}</p> :
                     suggestions && (
                        <>
                            <div>
                                <h3 className="font-semibold text-gray-300 mb-2">{t('favorites:magicOrganize.suggestedTags')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.tags.map(tag => (
                                        <button key={tag} onClick={() => setSelectedTags(s => toggleSelection(s, tag))} className={`px-2 py-1 text-xs rounded-full border-2 transition-colors ${selectedTags.has(tag) ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'border-gray-600 text-gray-300 hover:border-gray-500'}`}>{tag}</button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold text-gray-300 mb-2">{t('favorites:magicOrganize.suggestedCollections')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.collections.map(coll => (
                                        <button key={coll} onClick={() => setSelectedCollections(s => toggleSelection(s, coll))} className={`px-2 py-1 text-xs rounded-full border-2 transition-colors ${selectedCollections.has(coll) ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'border-gray-600 text-gray-300 hover:border-gray-500'}`}>{coll}</button>
                                    ))}
                                </div>
                            </div>
                        </>
                     )
                    }
                </div>

                <footer className="px-6 py-4 bg-gray-900/50 rounded-b-xl text-right">
                    <button onClick={handleApply} disabled={isLoading || !!error} className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {t('common:confirm')}
                    </button>
                </footer>
            </div>
        </div>
    );
};