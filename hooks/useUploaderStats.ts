import { useState, useEffect, useCallback } from 'react';
import type { UploaderStats, Profile } from '../types';
import { getItemCount } from '../services/archiveService';
import { getProfileApiQuery } from '../utils/profileUtils';

export const useUploaderStats = (profile: Profile) => {
    const [stats, setStats] = useState<UploaderStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const baseQuery = getProfileApiQuery(profile);
            const username = profile.searchIdentifier.split('@')[0];

            const mediaTypes: (keyof Pick<UploaderStats, 'movies' | 'audio' | 'texts' | 'image' | 'software'>)[] = ['movies', 'audio', 'texts', 'image', 'software'];
            
            const promises: Promise<number>[] = [
                getItemCount(baseQuery), // Total
                ...mediaTypes.map(type => getItemCount(`${baseQuery} AND mediatype:${type}`)),
                getItemCount(`uploader:("${profile.searchIdentifier}") AND mediatype:collection`), // Collections
                getItemCount(`collection:(fav-${username})`), // Favorites
                getItemCount(`reviewer:("${profile.searchIdentifier}")`), // Reviews
            ];

            const results = await Promise.all(promises);
            
            const [total, movies, audio, texts, image, software, collections, favorites, reviews] = results;

            setStats({ total, movies, audio, texts, image, software, collections, favorites, reviews });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stats');
        } finally {
            setIsLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, error, refetch: fetchStats };
};