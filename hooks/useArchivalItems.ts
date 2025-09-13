import { useState, useEffect, useCallback } from 'react';
import type { ArchiveItemSummary } from '../types';
import { searchArchive } from '../services/archiveService';

/**
 * A reusable hook to fetch a list of archival items for carousels or other displays.
 * @param query The search query for the Internet Archive API.
 * @param limit The number of items to fetch.
 * @returns An object containing the items, loading state, and error state.
 */
export const useArchivalItems = (query: string, limit: number = 15) => {
    const [items, setItems] = useState<ArchiveItemSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        if (!query) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Fetch top `limit` most downloaded items matching the query
            const data = await searchArchive(query, 1, ['-downloads'], undefined, limit);
            setItems(data.response?.docs || []);
        } catch (err) {
            console.error(`Failed to fetch archival items for query: ${query}`, err);
            setError('Failed to fetch items.');
        } finally {
            setIsLoading(false);
        }
    }, [query, limit]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return { items, isLoading, error, refetch: fetchItems };
};
