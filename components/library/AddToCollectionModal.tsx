

import React, { useState, useRef, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { userCollectionsAtom, addItemsToCollectionAtom } from '../../store/favorites';
// FIX: Import toastAtom from the correct module 'store/app' instead of the deprecated 'store/atoms'.
import { toastAtom } from '../../store/app';
import { useLanguage } from '../../hooks/useLanguage';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { CloseIcon, CollectionIcon } from '../Icons';

interface AddToCollectionModalProps {
    itemIds: string[];
    onClose: () => void;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ itemIds, onClose }) => {
    const { t } = useLanguage();
    const collections = useAtomValue(userCollectionsAtom);
    const addItemsToCollection = useSetAtom(addItemsToCollectionAtom);
    const setToast = useSetAtom(toastAtom);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');

    const modalRef = useRef<HTMLDivElement>(null);
    useModalFocusTrap({ modalRef, isOpen: true, onClose });
    
    const handleSubmit = () => {
        if (!selectedCollectionId) return;
        addItemsToCollection({ collectionId: selectedCollectionId, itemIds });
        const collectionName = collections.find(c => c.id === selectedCollectionId)?.name || '';
        setToast({ type: 'success', message: t('favorites:bulkActions.addedToCollection', { count: itemIds.length, collectionName }) });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog">
            <div ref={modalRef} className="bg-gray-800 w-full max-w-md rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
                 <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-white">{t('favorites:bulkActions.addToCollection')}</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                <div className="p-6">
                    <label htmlFor="collection-select" className="block text-sm font-medium text-gray-300 mb-2">{t('favorites:bulkActions.selectCollection')}</label>
                    <select
                        id="collection-select"
                        value={selectedCollectionId}
                        onChange={e => setSelectedCollectionId(e.target.value)}
                        className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="" disabled>-- {t('favorites:bulkActions.selectCollection')} --</option>
                        {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <footer className="px-6 py-4 bg-gray-900/50 rounded-b-xl text-right">
                    <button onClick={handleSubmit} disabled={!selectedCollectionId} className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {t('favorites:bulkActions.addToCollection')}
                    </button>
                </footer>
            </div>
        </div>
    );
};