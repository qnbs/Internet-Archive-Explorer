import React, { useState, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
// FIX: Modified createCollectionAtom to return the new collection, which is necessary for this component.
import { libraryItemsAtom, addItemsToCollectionAtom, createCollectionAtom, addTagsToItemsAtom } from '../../store/favorites';
import { toastAtom } from '../../store/archive';
import { organizeLibraryItems } from '../../services/geminiService';
import { useLanguage } from '../../hooks/useLanguage';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { CloseIcon, SparklesIcon } from '../Icons';
import { AILoadingIndicator } from '../AILoadingIndicator';
import { v4 as uuidv4 } from 'uuid';
import { UserCollection } from '../../types';

interface MagicOrganizeModalProps {
    itemIds: string[];
    onClose: () => void;
}

export const MagicOrganizeModal: React.FC<MagicOrganizeModalProps> = ({ itemIds, onClose }) => {
    const { t, language } = useLanguage();
    const allItems = useAtomValue(libraryItemsAtom);
    const addTags = useSetAtom(addTagsToItemsAtom);
    const addItemsToCollection = useSetAtom(addItemsToCollectionAtom);
    const createCollection = useSetAtom(createCollectionAtom);
    const setToast = useSetAtom(toastAtom);

    const [suggestions, setSuggestions] = useState<{ tags: string[], collections: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const modalRef = React.useRef<HTMLDivElement>(null);
    useModalFocusTrap({ modalRef, isOpen: true, onClose });

    useEffect(() => {
        const itemsToOrganize = allItems.filter(item => itemIds.includes(item.identifier))
            .map(item => ({ title: item.title }));

        if (itemsToOrganize.length > 0) {
            organizeLibraryItems(itemsToOrganize, language)
                .then(setSuggestions)
                .catch(err => setError(err.message))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [itemIds, allItems, language]);

    const handleApplyTags = () => {
        if (!suggestions || suggestions.tags.length === 0) return;
        addTags({ itemIds, tags: suggestions.tags });
        setToast({ type: 'success', message: t('favorites:magicOrganize.tagsApplied'), id: uuidv4() });
        onClose();
    };
    
    const handleCreateCollection = (name: string) => {
        const newCollection: UserCollection = createCollection(name);
        if (newCollection) {
            addItemsToCollection({ collectionId: newCollection.id, itemIds });
            setToast({ type: 'success', message: t('favorites:magicOrganize.collectionCreated', { name }), id: uuidv4() });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="magic-organize-title">
             <div ref={modalRef} className="bg-gray-800 w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
                 <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 id="magic-organize-title" className="text-lg font-bold text-white flex items-center gap-2">
                        <SparklesIcon className="text-cyan-400" />
                        {t('favorites:magicOrganize.title')}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                <div className="p-6 overflow-y-auto">
                    {isLoading && <AILoadingIndicator type="summary" />}
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    {suggestions && (
                        <div className="space-y-6">
                             <div>
                                <h3 className="font-semibold text-white mb-2">{t('favorites:magicOrganize.suggestedTags')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.tags.map(tag => <span key={tag} className="bg-gray-700 text-cyan-300 text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>)}
                                </div>
                                <button onClick={handleApplyTags} className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 text-sm rounded-lg">
                                    {t('favorites:magicOrganize.applyTags')}
                                </button>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-2">{t('favorites:magicOrganize.suggestedCollections')}</h3>
                                <div className="space-y-2">
                                    {suggestions.collections.map(name => (
                                        <button key={name} onClick={() => handleCreateCollection(name)} className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-md">
                                            {t('favorites:magicOrganize.createAndAdd', { name })}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};
