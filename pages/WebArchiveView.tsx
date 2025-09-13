import React, { useState, useEffect, useCallback } from 'react';
import { searchWaybackMachine } from '../services/archiveService';
import type { WaybackResponse } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useDebounce } from '../hooks/useDebounce';
import { Spinner } from '../components/Spinner';
import { WebIcon, SearchIcon, HistoryIcon } from '../components/Icons';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const waybackHistoryAtom = atomWithStorage<string[]>('wayback-history', []);

const isValidUrl = (url: string) => {
    // A simple check for a domain name with a TLD.
    return /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(url);
};

const WebArchiveView: React.FC = () => {
    const { t, language } = useLanguage();
    const [url, setUrl] = useState('');
    const [results, setResults] = useState<WaybackResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useAtom(waybackHistoryAtom);
    
    const performSearch = useCallback(async (searchUrl: string) => {
        const trimmedUrl = searchUrl.trim();
        if (!trimmedUrl) {
            setResults(null);
            setError(null);
            return;
        }
        if (!isValidUrl(trimmedUrl)) {
            setError(t('webArchive:errorInvalidUrl'));
            setResults([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        
        try {
            const data = await searchWaybackMachine(trimmedUrl);
            setResults(data);
            if (data.length === 0) {
                setError(t('webArchive:noSnapshots'));
            }
            // Add to history
            const fullUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
            setHistory(prev => [fullUrl, ...prev.filter(h => h !== fullUrl)].slice(0, 10));
        } catch (err) {
            setError(t('webArchive:errorFetch'));
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [t, setHistory]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(url);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-page-fade-in">
            <header className="text-center p-6 bg-gray-800/60 rounded-xl">
                <WebIcon className="w-12 h-12 mx-auto text-accent-400 mb-4" />
                <h1 className="text-3xl font-bold text-accent-400">{t('webArchive:title')}</h1>
                <p className="mt-2 text-gray-300">{t('webArchive:description')}</p>
            </header>
            
            <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder={t('webArchive:urlPlaceholder')}
                        className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700/50 focus-within:border-accent-500 rounded-lg py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-colors"
                        disabled={isLoading}
                    />
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white dark:bg-gray-800/60 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50 min-h-[300px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>
                    ) : error && (!results || results.length === 0) ? (
                        <div className="flex justify-center items-center h-full text-center text-gray-400 px-4"><p>{error}</p></div>
                    ) : results && results.length > 0 ? (
                        <div className="overflow-auto max-h-[60vh]">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('webArchive:resultsTable.snapshotDate')}</th>
                                        <th scope="col" className="px-6 py-3">{t('webArchive:resultsTable.originalUrl')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map(([timestamp, original], i) => {
                                        const date = new Date(parseInt(`${timestamp.slice(0,4)}-${timestamp.slice(4,6)}-${timestamp.slice(6,8)}T${timestamp.slice(8,10)}:${timestamp.slice(10,12)}:${timestamp.slice(12,14)}Z`));
                                        return (
                                            <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
                                                <td className="px-6 py-4 font-mono text-accent-400">
                                                    <a href={`https://web.archive.org/web/${timestamp}/${original}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        {date.toLocaleString(language, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 truncate max-w-xs" title={original}>{original}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-full text-center text-gray-500 px-4"><p>{t('webArchive:searchPrompt')}</p></div>
                    )}
                </div>
                <div className="space-y-3">
                    <h3 className="font-semibold text-white flex items-center gap-2"><HistoryIcon className="w-5 h-5"/> {t('webArchive:searchHistory')}</h3>
                    <div className="space-y-2">
                        {history.map(h => (
                             <button key={h} onClick={() => { setUrl(h); performSearch(h); }} className="w-full text-left text-sm text-accent-400 hover:underline p-2 bg-gray-800/60 rounded-md truncate">
                                {h}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebArchiveView;