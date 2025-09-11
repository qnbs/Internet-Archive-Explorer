import { useState, useEffect, useCallback } from 'react';
import type { Profile, UploaderTab } from '../types';
import { getItemCount } from '../services/archiveService';

const getPostsQuery = (profile: Profile) => `creator:("${profile.searchIdentifier}") AND mediatype:(texts) AND collection:(archiveteam_newsposts)`;
const getWebArchiveQuery = (profile: Profile) => `uploader:("${profile.searchIdentifier}") AND mediatype:(web)`;
const getReviewsQuery = (profile: Profile) => `reviewer:("${profile.searchIdentifier}")`;


export const useUploaderTabCounts = (profile: Profile) => {
    const [visibleTabs, setVisibleTabs] = useState<UploaderTab[]>(['uploads', 'collections']);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCounts = useCallback(async () => {
        setIsLoading(true);
        const baseTabs: UploaderTab[] = ['uploads', 'collections'];
        if (profile.type === 'uploader') {
            baseTabs.push('favorites');
        }

        try {
            const counts = await Promise.all([
                getItemCount(getReviewsQuery(profile)),
                getItemCount(getPostsQuery(profile)),
                getItemCount(getWebArchiveQuery(profile)),
            ]);
            
            const [reviewsCount, postsCount, webArchiveCount] = counts;

            const dynamicTabs: UploaderTab[] = [];
            if (reviewsCount > 0) dynamicTabs.push('reviews');
            if (postsCount > 0) dynamicTabs.push('posts');
            if (webArchiveCount > 0) dynamicTabs.push('webArchive');

            setVisibleTabs([...baseTabs, ...dynamicTabs]);
        } catch (error) {
            console.error("Failed to fetch uploader tab counts", error);
            setVisibleTabs(baseTabs); // Fallback to base tabs on error
        } finally {
            setIsLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    return { visibleTabs, isLoading };
};