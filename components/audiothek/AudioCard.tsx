import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentTrackAtom, isPlayingAtom, playItemAtom, addToQueueAtom, togglePlayPauseAtom } from '../../store/audioPlayer';
import { selectItemAtom } from '../../store/app';
import type { ArchiveItemSummary } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { PlayIcon, PauseIcon, PlusIcon, InfoIcon } from '../Icons';

interface AudioCardProps {
  item: ArchiveItemSummary;
  index: number;
}

export const AudioCard: React.FC<AudioCardProps> = React.memo(({ item, index }) => {
  const { t } = useLanguage();
  const currentTrack = useAtomValue(currentTrackAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const playItem = useSetAtom(playItemAtom);
  const addToQueue = useSetAtom(addToQueueAtom);
  const togglePlay = useSetAtom(togglePlayPauseAtom);
  const selectItem = useSetAtom(selectItemAtom);
  
  const thumbnailUrl = `https://archive.org/services/get-item-image.php?identifier=${item.identifier}`;
  const isCurrentTrack = currentTrack?.identifier === item.identifier;

  const handlePlayPause = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isCurrentTrack) {
          togglePlay();
      } else {
          playItem(item);
      }
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
      e.stopPropagation();
      addToQueue(item);
  };
  
  const handleSelectDetails = (e: React.MouseEvent) => {
      e.stopPropagation();
      selectItem(item);
  };
  
  return (
    <div
      className="flex-shrink-0 w-48 group scroll-snap-align-start"
      style={{ animationDelay: `${Math.min(index % 24 * 30, 500)}ms`, opacity: 0, animationName: 'fadeIn', animationFillMode: 'forwards' }}
    >
      <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300">
        <img
          src={thumbnailUrl}
          alt={`Cover for ${item.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div 
          className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        >
            <button onClick={handlePlayPause} className="p-4 bg-black/50 rounded-full text-white hover:bg-cyan-500/80 hover:scale-110 transition-all">
                {isCurrentTrack && isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8" />}
            </button>
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleAddToQueue} title={t('audiothek:player.addToQueue')} className="p-2 bg-black/50 hover:bg-cyan-500/80 rounded-full text-white transition-colors"><PlusIcon className="w-4 h-4"/></button>
            <button onClick={handleSelectDetails} title={t('common:viewDetails')} className="p-2 bg-black/50 hover:bg-cyan-500/80 rounded-full text-white transition-colors"><InfoIcon className="w-4 h-4"/></button>
        </div>
         {isCurrentTrack && isPlaying && (
            <div className="absolute bottom-2 right-2 flex items-end h-4 space-x-1 pointer-events-none">
                {[0.4, 0.7, 0.5, 0.8].map((h, i) => (
                    <div key={i} className="w-1 bg-cyan-400 rounded-full animate-[bounce] " style={{ height: `${h}rem`, animationDelay: `${i*100}ms`, animationDuration: '1.2s' }}></div>
                ))}
            </div>
         )}
      </div>
      <div className="pt-2 px-1">
        <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors h-10 line-clamp-2" title={item.title}>
          {item.title}
        </h3>
        <p className="text-xs text-gray-400 truncate" title={Array.isArray(item.creator) ? item.creator.join(', ') : item.creator}>
            {Array.isArray(item.creator) ? item.creator.join(', ') : item.creator || t('itemCard:unknownCreator')}
        </p>
      </div>
    </div>
  );
});
