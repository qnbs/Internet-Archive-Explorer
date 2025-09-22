import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { searchArchive } from '../../services/archiveService';
import type { ArchiveItemSummary } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { RecRoomItemCard } from '../RecRoomItemCard';
import { Spinner } from '../Spinner';
import { SparklesIcon } from '../Icons';

const GameFinder: React.FC = () => {
    const { t, language } = useLanguage();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const gameListCache = useRef<ArchiveItemSummary[]>([]);

    useEffect(() => {
        // Fetch a list of high-quality games once to use as context for the AI
        const fetchGameList = async () => {
            try {
                const data = await searchArchive(
                    'collection:softwarelibrary_msdos_games AND avg_rating:[4 TO 5]', 1, ['-downloads'], ['identifier', 'title'], 150
                );
                gameListCache.current = data.response?.docs || [];
            } catch (e) {
                console.error("Failed to fetch game list for AI context", e);
            }
        };
        fetchGameList();
    }, []);
    
    const handleFindGames = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading || gameListCache.current.length === 0) return;

        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            
            const gameListString = gameListCache.current.map(g => `${g.identifier}: ${g.title}`).join('\n');
            
            const systemInstruction = `You are a retro gaming expert. Recommend 3-5 classic MS-DOS games from the provided list based on the user's request. Only recommend games from the list. Respond with a JSON object: {"recommendations": ["game_identifier_1", "game_identifier_2"]}.`;
            
            const prompt = `User request: "${query}".\n\nAvailable games (identifier: title):\n${gameListString}`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                  systemInstruction,
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendations: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                  }
                },
            });

            const result = JSON.parse(response.text.trim());
            const identifiers = result.recommendations as string[];

            if (identifiers && identifiers.length > 0) {
                const searchPromises = identifiers.map(id => searchArchive(`identifier:${id}`, 1, [], undefined, 1));
                const searchResults = await Promise.all(searchPromises);
                const games = searchResults.map(res => res.response?.docs[0]).filter(Boolean);
                setSuggestions(games);
            } else {
                setError(t('recRoom:gameFinder.error'));
            }

        } catch (err) {
            console.error(err);
            setError(t('recRoom:gameFinder.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-800/60 rounded-xl shadow-lg border border-accent-500/20">
            <h2 className="text-2xl font-bold text-accent-400 flex items-center gap-2">
                <SparklesIcon /> {t('recRoom:gameFinder.title')}
            </h2>
            <p className="mt-1 text-gray-300">{t('recRoom:gameFinder.description')}</p>

            <form onSubmit={handleFindGames} className="mt-4 flex flex-col sm:flex-row gap-3">
                 <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('recRoom:gameFinder.placeholder')}
                    className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="flex-shrink-0 flex items-center justify-center bg-accent-600 hover:bg-accent-500 text-white font-semibold py-2 px-5 rounded-lg transition-colors shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Spinner size="sm" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                    <span>{isLoading ? t('recRoom:gameFinder.loading') : t('recRoom:gameFinder.button')}</span>
                </button>
            </form>

            {(isLoading || error || suggestions.length > 0) && (
                 <div className="mt-6">
                    {error && <p className="text-center text-red-400">{error}</p>}
                    {suggestions.length > 0 && !isLoading && (
                        <>
                            <h3 className="text-lg font-semibold text-white mb-3">{t('recRoom:gameFinder.resultsTitle')}</h3>
                             <div className="flex space-x-6 overflow-x-auto pb-4 scroll-smooth">
                                {suggestions.map((item, index) => <RecRoomItemCard key={item.identifier} item={item} index={index} />)}
                            </div>
                        </>
                    )}
                 </div>
            )}
        </div>
    );
};

export default GameFinder;