import React, { useState, useRef, useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { useLanguage } from '../../hooks/useLanguage';
import { answerFromText } from '../../services/geminiService';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { CloseIcon, SparklesIcon } from '../Icons';
import { Spinner } from '../Spinner';
import { archiveAIGeneration } from '../../services/aiPersistenceService';
import { addAIArchiveEntryAtom } from '../../store/aiArchive';
import { AIGenerationType, type WorksetDocument } from '../../types';
import { autoArchiveAIAtom } from '../../store/settings';

interface AskAIModalProps {
    textContent: string;
    document: WorksetDocument;
    onClose: () => void;
}

export const AskAIModal: React.FC<AskAIModalProps> = ({ textContent, document, onClose }) => {
    const { t, language } = useLanguage();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const addAIEntry = useSetAtom(addAIArchiveEntryAtom);
    const autoArchive = useAtomValue(autoArchiveAIAtom);

    useModalFocusTrap({ modalRef, isOpen: true, onClose });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || isLoading) return;
        setIsLoading(true);
        setAnswer('');
        try {
            const result = await answerFromText(question, textContent, language);
            setAnswer(result);
            // FIX: Added missing 'autoArchive' argument to the function call.
            archiveAIGeneration({
                type: AIGenerationType.Answer,
                content: result,
                language,
                prompt: question,
                source: document,
            }, addAIEntry, autoArchive);
        } catch (err) {
            setAnswer(err instanceof Error ? err.message : 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start pt-20 p-4" onClick={onClose}>
            <div ref={modalRef} className="bg-gray-800 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-white">{t('aiTools:askAboutText')}</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                <div className="p-6 space-y-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            ref={inputRef}
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder={t('aiTools:askPlaceholder')}
                            className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !question.trim()} className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center gap-2 disabled:bg-gray-500">
                            <SparklesIcon className="w-4 h-4" />
                            <span>{isLoading ? t('common:loading') : t('aiTools:ask')}</span>
                        </button>
                    </form>
                    <div className="min-h-[100px] bg-gray-900/50 p-4 rounded-lg">
                        {isLoading && <div className="flex justify-center"><Spinner /></div>}
                        {answer && <p className="text-gray-300 whitespace-pre-wrap">{answer}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
