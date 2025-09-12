import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { CloseIcon, SparklesIcon } from '../Icons';
import { AILoadingIndicator } from '../AILoadingIndicator';
import { answerFromText } from '../../services/geminiService';
import { sanitizeHtml } from '../../utils/sanitizer';

interface AskAIModalProps {
    documentText: string;
    onClose: () => void;
}

export const AskAIModal: React.FC<AskAIModalProps> = ({ documentText, onClose }) => {
    const { t, language } = useLanguage();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useModalFocusTrap({ modalRef, isOpen: true, onClose });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnswer('');

        try {
            const result = await answerFromText(question, documentText, language);
            setAnswer(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="ask-ai-title"
        >
            <div 
                ref={modalRef} 
                className="bg-gray-800 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[80vh] border border-gray-700" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 id="ask-ai-title" className="text-lg font-bold text-white flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-cyan-400"/>
                        {t('scriptorium:reader.askAIModalTitle')}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full" aria-label={t('common:close')}><CloseIcon /></button>
                </header>
                
                <div className="p-4 flex-grow overflow-y-auto">
                     {isLoading ? (
                        <AILoadingIndicator type="story" /> // Re-using story messages like "formulating answer"
                    ) : error ? (
                        <div className="text-center text-red-400">
                            <h3 className="font-bold text-lg mb-2">Error</h3>
                            <p>{error}</p>
                        </div>
                    ) : answer ? (
                         <div 
                            className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap animate-fade-in"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(answer.replace(/\n/g, '<br />')) }}
                        />
                    ) : (
                        <div className="text-center text-gray-500 py-10">
                            <p>{t('scriptorium:reader.askAIModalTitle')}</p>
                        </div>
                    )}
                </div>
                
                <footer className="p-4 border-t border-gray-700 flex-shrink-0">
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <input
                            ref={inputRef}
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder={t('scriptorium:reader.askAIPlaceholder')}
                            className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="flex-shrink-0 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? t('scriptorium:reader.asking') : t('scriptorium:reader.askAIButton')}
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};