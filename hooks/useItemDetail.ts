import { useState, useEffect, useCallback, useRef } from 'react';
import type { ArchiveItemSummary, ArchiveMetadata, ArchiveFile } from '../types';
import { getItemMetadata, getItemPlainText } from '../services/archiveService';
import { useAtomValue }from 'jotai';
import { defaultDetailTabAllAtom, enableAiFeaturesAtom, autoplayMediaAtom } from '../store/settings';
import { findPlayableFile } from '../utils/mediaUtils';

export type ItemDetailTab = 'description' | 'ai' | 'files' | 'related';

export const useItemDetail = (item: ArchiveItemSummary) => {
    const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const defaultTab = useAtomValue(defaultDetailTabAllAtom);
    const enableAiFeatures = useAtomValue(enableAiFeaturesAtom);
    const autoplayMedia = useAtomValue(autoplayMediaAtom);

    const [activeTab, setActiveTab] = useState<ItemDetailTab>(
        item.mediatype === 'texts' && enableAiFeatures ? (defaultTab === 'files' || defaultTab === 'related' ? 'description' : defaultTab) : 'description'
    );

    // For text content
    const [plainText, setPlainText] = useState<string | null>(null);
    const [isLoadingText, setIsLoadingText] = useState(false);
    const [textError, setTextError] = useState<string | null>(null);

    // For media playback (audio & video)
    const [isPlaying, setIsPlaying] = useState(false);
    const [playableMedia, setPlayableMedia] = useState<{ url: string; type: 'audio' | 'video' } | null>(null);
    const mediaRef = useRef<HTMLMediaElement>(null);

    const fetchMetadata = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getItemMetadata(item.identifier);
            setMetadata(data);
            
            if ((item.mediatype === 'audio' || item.mediatype === 'movies') && data.files) {
                const type = item.mediatype === 'movies' ? 'video' : 'audio';
                const url = findPlayableFile(data.files, item.identifier, type);
                if (url) {
                    setPlayableMedia({ url, type });
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [item.identifier, item.mediatype]);

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    useEffect(() => {
        if (activeTab === 'ai' && item.mediatype === 'texts' && !plainText && !isLoadingText) {
            setIsLoadingText(true);
            setTextError(null);
            getItemPlainText(item.identifier)
                .then(setPlainText)
                .catch((err) => {
                    setPlainText(null);
                    const message = err instanceof Error ? err.message : 'Failed to load text content.';
                    setTextError(message);
                })
                .finally(() => setIsLoadingText(false));
        }
    }, [activeTab, item.mediatype, item.identifier, plainText, isLoadingText]);
    
    const handlePlayPause = () => {
        if (mediaRef.current) {
            if (isPlaying) {
                mediaRef.current.pause();
            } else {
                mediaRef.current.play().catch(e => console.error("Media play failed:", e));
            }
        }
    };
    
    const mediaEventListeners = {
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false),
        onEnded: () => setIsPlaying(false),
    };

    useEffect(() => {
        if (mediaRef.current && autoplayMedia && playableMedia?.url && !isPlaying) {
           // We need a small delay for the media element to be ready
            const timer = setTimeout(() => {
                handlePlayPause();
            }, 100);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playableMedia?.url, autoplayMedia]);
    
    return {
        // FIX: Added 'item' to the return value to make it available in the context.
        item,
        metadata,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        plainText,
        isLoadingText,
        textError,
        isPlaying,
        playableMedia,
        mediaRef,
        handlePlayPause,
        mediaEventListeners,
        fetchMetadata,
    };
};

export type ItemDetailContextType = ReturnType<typeof useItemDetail>;