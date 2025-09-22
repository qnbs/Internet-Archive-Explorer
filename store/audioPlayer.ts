

import { atom } from 'jotai';
import { safeAtomWithStorage } from './safeStorage';
import type { PlayableTrack, ArchiveItemSummary, ArchiveFile } from '../types';
import { getItemMetadata } from '../services/archiveService';
import { findPlayableAudioFile } from '../utils/audioUtils';
// FIX: Changed toastAtom import to its new isolated file to prevent circular dependencies.
import { toastAtom } from './toast';

// --- Base State Atoms ---
export const playlistAtom = safeAtomWithStorage<PlayableTrack[]>('audio-playlist', []);
export const currentTrackIndexAtom = safeAtomWithStorage<number>('audio-current-index', -1);
export const isPlayingAtom = atom<boolean>(false);

// --- Derived Read-only Atoms ---
export const currentTrackAtom = atom<PlayableTrack | null>(get => {
    const playlist = get(playlistAtom);
    const index = get(currentTrackIndexAtom);
    return playlist[index] || null;
});

// --- Action Atoms (Write-only) ---

const findAndPrepareTrack = async (item: ArchiveItemSummary): Promise<PlayableTrack | null> => {
    try {
        const metadata = await getItemMetadata(item.identifier);
        const playableUrl = findPlayableAudioFile(metadata.files, item.identifier);
        if (playableUrl) {
            return {
                ...item,
                playableUrl,
                duration: metadata.files.find(f => f.name.endsWith('.mp3'))?.length,
            };
        }
        return null;
    } catch (error) {
        console.error("Error preparing track:", error);
        return null;
    }
};

export const playItemAtom = atom(
    null,
    async (get, set, item: ArchiveItemSummary) => {
        const playlist = get(playlistAtom);
        const existingIndex = playlist.findIndex(track => track.identifier === item.identifier);
        
        if (existingIndex !== -1) {
            set(currentTrackIndexAtom, existingIndex);
            set(isPlayingAtom, true);
        } else {
            const newTrack = await findAndPrepareTrack(item);
            if (newTrack) {
                const newPlaylist = [...playlist, newTrack];
                set(playlistAtom, newPlaylist);
                set(currentTrackIndexAtom, newPlaylist.length - 1);
                set(isPlayingAtom, true);
            } else {
                 // FIX: The Jotai type error was caused by a subtle circular dependency issue. Correcting the store's barrel file (`store/index.ts`) allows TypeScript to correctly infer that `toastAtom` is a `WritableAtom`.
                 set(toastAtom, { type: 'error', message: 'No playable audio found for this item.' });
            }
        }
    }
);

export const addToQueueAtom = atom(
    null,
    async (get, set, item: ArchiveItemSummary) => {
        const playlist = get(playlistAtom);
        const isAlreadyInPlaylist = playlist.some(track => track.identifier === item.identifier);

        if (isAlreadyInPlaylist) {
            // FIX: The Jotai type error was caused by a subtle circular dependency issue. Correcting the store's barrel file (`store/index.ts`) allows TypeScript to correctly infer that `toastAtom` is a `WritableAtom`.
            set(toastAtom, { type: 'info', message: 'Item is already in the playlist.' });
            return;
        }

        const newTrack = await findAndPrepareTrack(item);
        if (newTrack) {
            set(playlistAtom, [...playlist, newTrack]);
            // FIX: The Jotai type error was caused by a subtle circular dependency issue. Correcting the store's barrel file (`store/index.ts`) allows TypeScript to correctly infer that `toastAtom` is a `WritableAtom`.
            set(toastAtom, { type: 'success', message: 'Added to queue.' });
        } else {
            // FIX: The Jotai type error was caused by a subtle circular dependency issue. Correcting the store's barrel file (`store/index.ts`) allows TypeScript to correctly infer that `toastAtom` is a `WritableAtom`.
            set(toastAtom, { type: 'error', message: 'No playable audio found for this item.' });
        }
    }
);

export const togglePlayPauseAtom = atom(null, (get, set) => {
    if (get(playlistAtom).length > 0) {
        set(isPlayingAtom, v => !v);
    }
});

export const nextTrackAtom = atom(null, (get, set) => {
    const playlist = get(playlistAtom);
    if (playlist.length === 0) return;
    const currentIndex = get(currentTrackIndexAtom);
    set(currentTrackIndexAtom, (currentIndex + 1) % playlist.length);
    set(isPlayingAtom, true);
});

export const prevTrackAtom = atom(null, (get, set) => {
    const playlist = get(playlistAtom);
    if (playlist.length === 0) return;
    const currentIndex = get(currentTrackIndexAtom);
    set(currentTrackIndexAtom, (currentIndex - 1 + playlist.length) % playlist.length);
    set(isPlayingAtom, true);
});

export const removeFromPlaylistAtom = atom(null, (get, set, index: number) => {
    const playlist = get(playlistAtom);
    const currentIndex = get(currentTrackIndexAtom);
    
    const newPlaylist = playlist.filter((_, i) => i !== index);
    set(playlistAtom, newPlaylist);

    if (index === currentIndex) {
        if (newPlaylist.length === 0) {
            set(currentTrackIndexAtom, -1);
            set(isPlayingAtom, false);
        } else if (index >= newPlaylist.length) {
            // If last item was removed, stay on the new last item
            set(currentTrackIndexAtom, newPlaylist.length - 1);
        }
        // Otherwise, the index remains the same, but the track changes.
    } else if (index < currentIndex) {
        set(currentTrackIndexAtom, currentIndex - 1);
    }
});


export const clearPlaylistAtom = atom(null, (get, set) => {
    set(playlistAtom, []);
    set(currentTrackIndexAtom, -1);
    set(isPlayingAtom, false);
});