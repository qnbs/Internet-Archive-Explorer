import React, { useRef, useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    currentTrackAtom, isPlayingAtom, togglePlayPauseAtom, nextTrackAtom, prevTrackAtom, playlistAtom
} from '../../store/audioPlayer';
import { useLanguage } from '../../hooks/useLanguage';
import { PlayIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon, QueueListIcon } from '../Icons';
import { PlaylistPanel } from './PlaylistPanel';
import { formatTime } from '../../utils/audioUtils';


export const AudioPlayer: React.FC = () => {
    const { t } = useLanguage();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

    const currentTrack = useAtomValue(currentTrackAtom);
    const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
    const playlist = useAtomValue(playlistAtom);
    const togglePlayPause = useSetAtom(togglePlayPauseAtom);
    const next = useSetAtom(nextTrackAtom);
    const prev = useSetAtom(prevTrackAtom);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => next();

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [next]);

    useEffect(() => {
        if (audioRef.current && currentTrack) {
            if (audioRef.current.src !== currentTrack.playableUrl) {
                audioRef.current.src = currentTrack.playableUrl;
            }
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [currentTrack, isPlaying]);
    
    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value);
        }
    };
    
    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-30">
            <div className="bg-gray-800/80 backdrop-blur-md border-t border-gray-700/50 p-3 shadow-t-lg flex items-center gap-4">
                <img src={`https://archive.org/services/get-item-image.php?identifier=${currentTrack.identifier}`} alt="" className="w-12 h-12 rounded-md flex-shrink-0" />
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-white truncate">{currentTrack.title}</p>
                    <p className="text-sm text-gray-400 truncate">{Array.isArray(currentTrack.creator) ? currentTrack.creator.join(', ') : currentTrack.creator}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => prev()} className="p-1 text-gray-300 hover:text-white"><ChevronLeftIcon /></button>
                    <button onClick={togglePlayPause} className="w-10 h-10 flex items-center justify-center bg-cyan-500 text-white rounded-full hover:bg-cyan-400 transition-colors">
                        {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                    </button>
                    <button onClick={() => next()} className="p-1 text-gray-300 hover:text-white"><ChevronRightIcon /></button>
                </div>
                 <div className="hidden md:flex items-center gap-3 flex-grow max-w-xs">
                    <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleProgressChange}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm"
                    />
                    <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                </div>
                <div className="flex items-center">
                    <button onClick={() => setIsPlaylistOpen(o => !o)} className={`p-2 rounded-lg ${isPlaylistOpen ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700'}`}>
                        <QueueListIcon className="w-5 h-5"/>
                    </button>
                </div>
                {isPlaylistOpen && <PlaylistPanel onClose={() => setIsPlaylistOpen(false)} />}
                <audio ref={audioRef} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
            </div>
        </div>
    );
};