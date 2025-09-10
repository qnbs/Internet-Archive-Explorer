import { useState, useEffect } from 'react';
import { getItemCount } from '../services/archiveService';
import type { UploaderStats, MediaType } from '../types';
import { MediaType as MediaTypeValue } from '../types';

export const useUploaderStats = (uploaderName: string, isVisible: boolean): { stats: UploaderStats | null; isLoading: boolean } => {
    const [stats, setStats] = useState<UploaderStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch only when visible and not already fetched or loading
        if (!isVisible || stats !== null || isLoading) return;

        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const getCountForType = (mediaType?: MediaType) => {
                    let query = `uploader:("${uploaderName}")`;
                    if (mediaType) {
                        query += ` AND mediatype:(${mediaType})`;
                    }
                    return getItemCount(query);
                };

                const [total, movies, audio, texts, image, software] = await Promise.all([
                    getCountForType(),
                    getCountForType(MediaTypeValue.Movies),
                    getCountForType(MediaTypeValue.Audio),
                    getCountForType(MediaTypeValue.Texts),
                    getCountForType(MediaTypeValue.Image),
                    getCountForType(MediaTypeValue.Software),
                ]);

                setStats({ total, movies, audio, texts, image, software });
            } catch (error) {
                console.error(`Failed to fetch stats for ${uploaderName}:`, error);
                // Set empty stats on error to prevent re-fetching
                setStats({ total: 0, movies: 0, audio: 0, texts: 0, image: 0, software: 0 });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [isVisible, stats, uploaderName, isLoading]);

    return { stats, isLoading: (isLoading || stats === null) && isVisible };
};