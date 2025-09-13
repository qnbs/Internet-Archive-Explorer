import React, { useState, useRef, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { addTagsToItemsAtom } from '../../store/favorites';
import { toastAtom } from '../../store/archive';
import { useLanguage } from '../../hooks/useLanguage';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { CloseIcon } from '../Icons';
import { v4 as uuidv4 } from 'uuid';

interface AddTagsModalProps {
    itemIds: string[];
    onClose: () => void;
}

export const AddTagsModal: React.FC<AddTagsModalProps> = ({ itemIds, onClose }) => {
    const { t } = useLanguage();
    const addTagsToItems = useSetAtom(addTagsToItemsAtom);
    const setToast = useSetAtom(toastAtom);
    const [tagsInput, setTagsInput] = useState('');

    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useModalFocusTrap({ modalRef, isOpen: true, onClose });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length > 0) {
            addTagsToItems({ itemIds, tags });
            setToast({ type: 'success', message: t('favorites:bulkActions.tagsAdded'), id: uuidv4() });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start pt-20 p-4" onClick={onClose} role="dialog">
            <div ref={modalRef} className="bg-gray-800 w-full max-w-md rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-white">{t('favorites:bulkActions.addTags')}</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                 <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="tags-input" className="block text-sm font-medium text-gray-300 mb-2">{t('favorites:bulkActions.addTagsPrompt')}</label>
                        <input
                            ref={inputRef}
                            id="tags-input"
                            value={tagsInput}
                            onChange={e => setTagsInput(e.target.value)}
                            placeholder="e.g., research, sci-fi, 1950s"
                            className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <footer className="px-6 py-4 bg-gray-900/50 rounded-b-xl text-right">
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                           {t('favorites:bulkActions.addTags')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};