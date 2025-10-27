import React, { useState } from 'react';
import { useHelpViewContext } from '../../contexts/HelpViewContext';
import { sanitizeHtml } from '../../utils/sanitizer';

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; searchQuery: string }> = ({ title, children, searchQuery }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const highlight = (text: string) => {
        if (!searchQuery.trim()) return text;
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-400/50 text-white rounded px-1">$1</mark>');
    };
    
    return (
        <div className="border-b border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-4" aria-expanded={isOpen}>
                <h3 className="font-semibold text-lg text-gray-200" dangerouslySetInnerHTML={{ __html: sanitizeHtml(highlight(title)) }} />
                <svg className={`w-6 h-6 text-accent-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 text-gray-300 leading-relaxed space-y-3 prose-a:text-accent-400 hover:prose-a:underline prose-ul:list-disc prose-ul:pl-6 prose-li:mb-1 prose-code:bg-gray-700 prose-code:px-1 prose-code:rounded prose-strong:text-gray-200"
                         dangerouslySetInnerHTML={{ __html: sanitizeHtml(highlight(children as string)) }} />
                </div>
            </div>
        </div>
    );
};

export const HelpContent: React.FC = () => {
    const { t, activeTopic, searchQuery } = useHelpViewContext();

    const filteredQuestions = React.useMemo(() => {
        if (!activeTopic) return [];
        if (!searchQuery.trim()) return activeTopic.questions;

        const lowerQuery = searchQuery.toLowerCase();
        return activeTopic.questions.filter(qa => 
            qa.q.toLowerCase().includes(lowerQuery) || 
            qa.a.toLowerCase().includes(lowerQuery)
        );
    }, [activeTopic, searchQuery]);

    return (
        <main className="flex-1 p-6 bg-white dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 min-h-[50vh]">
            {activeTopic ? (
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">{activeTopic.title}</h2>
                    <div className="space-y-2">
                        {filteredQuestions.map((qa, index) => (
                            <AccordionItem key={index} title={qa.q} searchQuery={searchQuery}>
                                {qa.a}
                            </AccordionItem>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">{searchQuery ? t('common:noResultsFound') : t('help:selectTopic')}</p>
                </div>
            )}
        </main>
    );
};