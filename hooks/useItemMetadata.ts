import { useState, useEffect, useCallback, useRef } from 'react';
import type { ArchiveItemSummary, ArchiveMetadata, ArchiveFile } from '../types';
import { getItemMetadata, getItemPlainText } from '../services/archiveService';
import { useAtomValue } from 'jotai';
import { defaultAiTabAtom, enableAiFeaturesAtom, autoplayMediaAtom } from '../store/settings';

export type ItemDetailTab = 'description' | 'ai' | 'files' | 'related';

const findPlayableFile = (files: ArchiveFile[], itemIdentifier: string, mediaType: 'audio' | 'video'): string | null => {
    // Prioritized list of formats for better web compatibility
    const audioFormats = ['VBR MP3', 'MP3', 'MPEG4', 'Ogg Vorbis', 'Flac'];
    const videoFormats = ['h.264', '512Kb MPEG4', 'MPEG4'];

    const targetFormats = mediaType === 'audio' ? audioFormats : videoFormats;
    
    let bestFile: ArchiveFile | undefined;

    for (const format of targetFormats) {
        // Use `endsWith` for more specific matching on common formats
        if (format === 'MP3' || format === 'MPEG4') {
             bestFile = files.find(f => f.format.endsWith(format));
        } else {
             bestFile = files.find(f => f.format.includes(format));
        }
        if (bestFile) break;
    }

    // Fallback for video: check for .mp4 extension if format matching fails
    if (!bestFile && mediaType === 'video') {
       bestFile = files.find(f => f.name.toLowerCase().endsWith('.mp4'));
    }

    if (bestFile) {
        return `https://archive.org/download/${itemIdentifier}/${encodeURIComponent(bestFile.name)}`;
    }

    return null;
}


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
            getItemPlainText(item.identifier)
                .then(setPlainText)
                .catch(() => setPlainText('Failed to load text content.'))
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
        metadata,
        isLoading,
        error,
        activeTab,
        setActiveTab,
        plainText,
        isLoadingText,
        isPlaying,
        playableMedia,
        mediaRef,
        handlePlayPause,
        mediaEventListeners,
        fetchMetadata,
    };
};