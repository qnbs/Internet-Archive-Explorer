
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ArchiveItemSummary, ArchiveMetadata } from '../types';
import { getItemMetadata, getItemPlainText } from '../services/archiveService';
import { useAtomValue } from 'jotai';
import { defaultAiTabAtom, enableAiFeaturesAtom, autoplayMediaAtom } from '../store';

export type ItemDetailTab = 'description' | 'ai' | 'files' | 'related';

export const useItemMetadata = (item: ArchiveItemSummary) => {
    const [metadata, setMetadata] = useState<ArchiveMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const defaultAiTab = useAtomValue(defaultAiTabAtom);
    const enableAiFeatures = useAtomValue(enableAiFeaturesAtom);
    const autoplayMedia = useAtomValue(autoplayMediaAtom);

    const [activeTab, setActiveTab] = useState<ItemDetailTab>(
        item.mediatype === 'texts' && enableAiFeatures ? defaultAiTab : 'description'
    );

    // For text content
    const [plainText, setPlainText] = useState<string | null>(null);
    const [isLoadingText, setIsLoadingText] = useState(false);

    // For audio playback
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const fetchMetadata = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getItemMetadata(item.identifier);
            setMetadata(data);
            
            if (item.mediatype === 'audio' && data.files) {
                const audioFile = data.files.find(f => f.format.includes('VBR MP3') || f.format.includes('Ogg Vorbis') || f.format.includes('MP3'));
                if (audioFile) {
                    setAudioUrl(`https://archive.org/download/${item.identifier}/${encodeURIComponent(audioFile.name)}`);
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
            getItemPlainText(item.identifier)
                .then(setPlainText)
                .catch(() => setPlainText('Failed to load text content.'))
                .finally(() => setIsLoadingText(false));
        }
    }, [activeTab, item.mediatype, item.identifier, plainText, isLoadingText]);
    
    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        }
    };
    
    const audioEventListeners = {
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false),
        onEnded: () => setIsPlaying(false),
    };

    useEffect(() => {
        if (audioRef.current && autoplayMedia && audioUrl && !isPlaying) {
           // We need a small delay for the audio element to be ready
            const timer = setTimeout(() => {
                handlePlayPause();
            }, 100);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioUrl, autoplayMedia]);
    
    return {
        metadata,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        plainText,
        isLoadingText,
        isPlaying,
        audioUrl,
        audioRef,
        handlePlayPause,
        audioEventListeners,
        fetchMetadata,
    };
};
