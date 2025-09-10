import React, { useState, useEffect } from 'react';
import { searchArchive } from '../../services/archiveService';
import type { ArchiveItemSummary, Workset } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { Spinner } from '../Spinner';
import { CloseIcon, SearchIcon, PlusIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';

interface AddDocumentModalProps {
    workset: Workset;
    onAdd: (item: ArchiveItemSummary) => void;
    onClose: () => void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ workset, onAdd, onClose }) => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        searchArchive(`(${debouncedQuery}) AND mediatype:(texts)`, 1, [], undefined, 10).then(data => {
            setResults(data.response?.docs || []);
            setIsLoading(false);
        });
    }, [debouncedQuery]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-start pt-20 p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-white">{t('scriptorium.addDocumentTo', { worksetName: workset.name })}</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                <div className="p-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input 
                            value={query} 
                            onChange={e => setQuery(e.target.value)} 
                            placeholder={t('scriptorium.searchPlaceholder')}
                            className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                        />
                    </div>
                </div>
                <div className="p-4 min-h-[300px] max-h-[60vh] overflow-y-auto">
                    {isLoading && <div className="flex justify-center pt-8"><Spinner /></div>}
                    {!isLoading && results.length === 0 && (
                        <p className="text-center text-gray-500 pt-8">{debouncedQuery ? t('common:noResultsFound') : t('scriptorium.startTyping')}</p>
                    )}
                    <div className="space-y-2">
                        {results.map(item => (
                            <div key={item.identifier} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-md">
                                <div>
                                    <p className="font-semibold text-gray-200">{item.title}</p>
                                    <p className="text-xs text-gray-400">{item.creator}</p>
                                </div>
                                <button onClick={() => { onAdd(item); onClose(); }} className="flex-shrink-0 flex items-center space-x-2 text-sm bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-1 px-3 rounded-md transition-colors">
                                    <PlusIcon className="w-4 h-4" />
                                    <span>{t('common:add')}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
