import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ArchiveItemSummary } from '@/types';
import { getItemMetadata, getItemPlainText } from '@/services/archiveService';
import { useAtomValue } from 'jotai';
import { defaultDetailTabAllAtom, enableAiFeaturesAtom, autoplayMediaAtom } from '@/store/settings';
import { findPlayableFile } from '@/utils/mediaUtils';

export type ItemDetailTab = 'description' | 'ai' | 'files' | 'related';

export const useItemDetail = (item: ArchiveItemSummary) => {
  const defaultTab = useAtomValue(defaultDetailTabAllAtom);
  const enableAiFeatures = useAtomValue(enableAiFeaturesAtom);
  const autoplayMedia = useAtomValue(autoplayMediaAtom);

  const [activeTab, setActiveTab] = useState<ItemDetailTab>(
    item.mediatype === 'texts' && enableAiFeatures
      ? defaultTab === 'files' || defaultTab === 'related'
        ? 'description'
        : defaultTab
      : 'description',
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [playableMedia, setPlayableMedia] = useState<{
    url: string;
    type: 'audio' | 'video';
  } | null>(null);
  const mediaRef = useRef<HTMLMediaElement>(null);

  // Metadata query
  const {
    data: metadata,
    isLoading,
    error: metaError,
    refetch: fetchMetadata,
  } = useQuery({
    queryKey: ['metadata', item.identifier],
    queryFn: () => getItemMetadata(item.identifier),
    staleTime: 1000 * 60 * 10,
  });

  // Plain text query — lazy: only fetched when AI tab is active on a text item
  const {
    data: plainText,
    isLoading: isLoadingText,
    error: textQueryError,
  } = useQuery({
    queryKey: ['plaintext', item.identifier],
    queryFn: () => getItemPlainText(item.identifier),
    enabled: activeTab === 'ai' && item.mediatype === 'texts',
    staleTime: 1000 * 60 * 10,
  });

  // Derive playable media URL when metadata arrives
  useEffect(() => {
    if (metadata && (item.mediatype === 'audio' || item.mediatype === 'movies') && metadata.files) {
      const type = item.mediatype === 'movies' ? 'video' : 'audio';
      const url = findPlayableFile(metadata.files, item.identifier, type);
      if (url) setPlayableMedia({ url, type });
    }
  }, [metadata, item.mediatype, item.identifier]);

  const handlePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play().catch((e) => console.error('Media play failed:', e));
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
      const timer = setTimeout(() => {
        handlePlayPause();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playableMedia?.url, autoplayMedia]);

  const error =
    metaError instanceof Error ? metaError.message : metaError ? 'An unknown error occurred' : null;

  const textError =
    textQueryError instanceof Error
      ? textQueryError.message
      : textQueryError
        ? 'Failed to load text content.'
        : null;

  return {
    item,
    metadata: metadata ?? null,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    plainText: plainText ?? null,
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
