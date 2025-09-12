import React, { useState, useRef, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { createCollectionAtom, toastAtom } from '../../store';
import { useLanguage } from '../../hooks/useLanguage';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { CloseIcon } from '../Icons';
import { v4 as uuidv4 } from 'uuid';


interface NewCollectionModalProps {
    onClose: () => void;
}

export const NewCollectionModal: React.FC<NewCollectionModalProps> = ({ onClose }) => {
    const { t } = useLanguage();
    const createCollection = useSetAtom(createCollectionAtom);
    const setToast = useSetAtom(toastAtom);
    const [name, setName] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    useModalFocusTrap({ modalRef, isOpen: true, onClose });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (trimmedName) {
            createCollection(trimmedName);
            setToast({ type: 'success', message: t('favorites:modals.collectionCreated', { name: trimmedName }), id: uuidv4() });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start pt-20 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="new-collection-title">
            <div ref={modalRef} className="bg-gray-800 w-full max-w-md rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 id="new-collection-title" className="text-lg font-bold text-white">{t('favorites:modals.newCollectionTitle')}</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="collection-name" className="block text-sm font-medium text-gray-300 mb-2">{t('favorites:modals.newCollectionName')}</label>
                        <input
                            ref={inputRef}
                            id="collection-name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder={t('favorites:modals.newCollectionPlaceholder')}
                            className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <footer className="px-6 py-4 bg-gray-900/50 rounded-b-xl text-right">
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                            {t('favorites:modals.create')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};
