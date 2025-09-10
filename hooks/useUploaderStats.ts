import { useState, useEffect, useCallback } from 'react';
import type { Uploader, UploaderStats } from '../types';
import { getItemCount } from '../services/archiveService';
import { useLanguage } from '../contexts/LanguageContext';

export const useUploaderStats = (uploader: Uploader) => {
    const [stats, setStats] = useState<UploaderStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const uploaderQuery = `uploader:("${uploader.searchUploader}")`;

            const queries: Record<keyof UploaderStats, string> = {
                total: uploaderQuery,
                movies: `${uploaderQuery} AND mediatype:movies`,
                audio: `${uploaderQuery} AND mediatype:audio`,
                texts: `${uploaderQuery} AND mediatype:texts`,
                image: `${uploaderQuery} AND mediatype:image`,
                software: `${uploaderQuery} AND mediatype:software`,
            };

            const promises = Object.entries(queries).map(async ([key, query]) => {
                const count = await getItemCount(query);
                return { key: key as keyof UploaderStats, count };
            });

            const results = await Promise.all(promises);
            
            const newStats = results.reduce((acc, { key, count }) => {
                acc[key] = count;
                return acc;
            }, {} as UploaderStats);
            
            setStats(newStats);

        } catch (e) {
            console.error("Failed to fetch uploader stats", e);
            setError(t('common:error'));
        } finally {
            setIsLoading(false);
        }
    }, [uploader.searchUploader, t]);
    
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, error };
};