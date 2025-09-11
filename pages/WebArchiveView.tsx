import React, { useState, useEffect, useCallback } from 'react';
import { searchWaybackMachine } from '../services/archiveService';
import type { WaybackResponse, WaybackResult } from '../types';
import { Spinner } from '../components/Spinner';
// FIX: Correct import path for useLanguage hook.
import { useLanguage } from '../hooks/useLanguage';
import { WebIcon } from '../components/Icons';
import { useAtom } from 'jotai';
// FIX: Correct import path for jotai atom.
import { webArchiveUrlAtom } from '../store';
import { useDebounce } from '../hooks/useDebounce';

export const WebArchiveView: React.FC = () => {
    const { t, language } = useLanguage();
    const title = t('webArchive:title');
    const description = t('webArchive:description');
    
    const [url, setUrl] = useAtom(webArchiveUrlAtom);
    const debouncedUrl = useDebounce(url, 500);
    
    const [results, setResults] = useState<WaybackResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const formatTimestamp = (ts: string): string => {
        if (ts.length < 14) return ts;
        try {
          const year = ts.substring(0, 4);
          const month = ts.substring(4, 6);
          const day = ts.substring(6, 8);
          const hour = ts.substring(8, 10);
          const minute = ts.substring(10, 12);
          const second = ts.substring(12, 14);
          const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
          return date.toLocaleString(language, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) {
          return ts; // return original timestamp if parsing fails
        }
    };

    const performSearch = useCallback(async (searchUrl: string) => {
        if (!searchUrl.trim()) {
            setResults(null);
            setHasSearched(false);
            setError(null);
            return;
        }
        
        // Basic URL validation
        if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(searchUrl)) {
            setError(t('webArchive:errorInvalidUrl'));
            setResults(null);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setResults(null);
        setHasSearched(true);

        try {
            const data = await searchWaybackMachine(searchUrl);
            setResults(data);
        } catch (err) {
            setError(t('webArchive:errorFetch'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        performSearch(debouncedUrl);
    }, [debouncedUrl, performSearch]);

    // Clear URL when leaving the view
    useEffect(() => {
        return () => {
            setUrl('');
        };
    }, [setUrl]);

    return (
        <div className="space-y-8">
            <div className="p-6 bg-gray-800/60 rounded-xl shadow-lg text-center">
                 <WebIcon className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
                <h2 className="text-3xl font-bold text-cyan-400 mb-2">{title}</h2>
                <div className="text-gray-300 leading-relaxed max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: description }} />
            </div>
            
            <div className="p-6 bg-gray-800/60 rounded-xl shadow-lg min-h-[300px] flex items-center justify-center">
                {isLoading ? (
                    <Spinner size="lg" />
                ) : error ? (
                    <div className="text-center">
                        <p className="text-red-400 text-center">{error}</p>
                    </div>
                ) : hasSearched && results && results.length > 0 ? (
                    <div className="w-full max-h-96 overflow-y-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-cyan-300 uppercase bg-gray-900/50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('webArchive:resultsTable.snapshotDate')}</th>
                                    <th scope="col" className="px-6 py-3">{t('webArchive:resultsTable.originalUrl')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result: WaybackResult, index: number) => (
                                    <tr key={`${result[0]}-${index}`} className="bg-gray-800/80 border-b border-gray-700 hover:bg-gray-700/80">
                                        <td className="px-6 py-4 whitespace-nowrap">{formatTimestamp(result[0])}</td>
                                        <td className="px-6 py-4">
                                            <a 
                                                href={`https://web.archive.org/${result[0]}/${result[1]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-cyan-400 hover:underline truncate block"
                                                title={result[1]}
                                            >
                                                {result[1]}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : hasSearched ? (
                    <p className="text-gray-400 text-center">{t('webArchive:noSnapshots')}</p>
                ) : (
                   <p className="text-gray-500 text-center">{t('webArchive:searchPrompt')}</p>
                )}
            </div>
        </div>
    );
};