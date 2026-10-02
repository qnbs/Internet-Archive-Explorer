import { GoogleGenAI, Type } from '@google/genai';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { searchArchive } from '@/services/archiveService';
import { resolveGeminiApiKey } from '@/services/geminiApiKeyStorage';
import { GeminiServiceError } from '@/services/geminiService';
import type { ArchiveItemSummary } from '@/types';
import { logger } from '@/utils/logger';

const GAME_LIST_QUERY = 'collection:softwarelibrary_msdos_games AND avg_rating:[4 TO 5]';

export function useGameFinder() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ArchiveItemSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gameListCache = useRef<ArchiveItemSummary[]>([]);

  useEffect(() => {
    const fetchGameList = async () => {
      try {
        const data = await searchArchive(
          GAME_LIST_QUERY,
          1,
          ['-downloads'],
          ['identifier', 'title'],
          150,
        );
        gameListCache.current = data.response?.docs ?? [];
      } catch (e) {
        logger.error('Failed to fetch game list for AI context', e);
      }
    };
    void fetchGameList();
  }, []);

  const findGames = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      if (!query.trim() || isLoading || gameListCache.current.length === 0) return;

      setIsLoading(true);
      setError(null);
      setSuggestions([]);

      try {
        const apiKey = resolveGeminiApiKey();
        if (!apiKey) {
          throw new GeminiServiceError(
            'No Gemini API key',
            'NO_API_KEY',
            'settings:apiKey.noKeyConfigured',
          );
        }

        const ai = new GoogleGenAI({ apiKey });
        const gameListString = gameListCache.current
          .map((g) => `${g.identifier}: ${g.title}`)
          .join('\n');

        const systemInstruction = `You are a retro gaming expert. Recommend 3-5 classic MS-DOS games from the provided list based on the user's request. Only recommend games from the list. Respond with a JSON object: {"recommendations": ["game_identifier_1", "game_identifier_2"]}.`;
        const prompt = `User request: "${query}".\n\nAvailable games (identifier: title):\n${gameListString}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
            },
          },
        });

        const responseText = response.text ?? '';
        if (!responseText.trim()) {
          throw new Error('Empty Gemini response');
        }

        const result = JSON.parse(responseText.trim()) as {
          recommendations?: string[];
        };
        const identifiers = result.recommendations;

        if (identifiers && identifiers.length > 0) {
          const searchResults = await Promise.all(
            identifiers.map((id) => searchArchive(`identifier:${id}`, 1, [], undefined, 1)),
          );
          const games = searchResults
            .map((res) => res.response?.docs[0])
            .filter((doc): doc is ArchiveItemSummary => Boolean(doc));
          setSuggestions(games);
        } else {
          setError(t('recRoom:gameFinder.error'));
        }
      } catch (err) {
        logger.error(err);
        if (err instanceof GeminiServiceError && err.code === 'NO_API_KEY') {
          setError(t('settings:apiKey.noKeyConfigured'));
        } else {
          setError(t('recRoom:gameFinder.error'));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [query, isLoading, t],
  );

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    findGames,
  };
}
