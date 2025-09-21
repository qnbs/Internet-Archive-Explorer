import type { ArchiveFile } from '../types';

/**
 * Finds the best-quality, web-compatible audio URL from a list of files.
 * @param files - The array of file objects from the item's metadata.
 * @param itemIdentifier - The identifier of the Internet Archive item.
 * @returns The full URL to the best audio file, or null if not found.
 */
export const findPlayableAudioFile = (files: ArchiveFile[], itemIdentifier: string): string | null => {
    // Prioritized list of formats for better web compatibility and quality
    const audioFormats = ['VBR MP3', 'MP3', 'MPEG4', 'Ogg Vorbis', 'FLAC'];
    
    let bestFile: ArchiveFile | undefined;

    for (const format of audioFormats) {
        // Find the first file that includes the format string. This is more robust than exact matching.
        bestFile = files.find(f => f.format.includes(format));
        if (bestFile) break;
    }

    // Fallback: if no priority format found, look for any file ending with .mp3
    if (!bestFile) {
        bestFile = files.find(f => f.name.toLowerCase().endsWith('.mp3'));
    }

    if (bestFile) {
        return `https://archive.org/download/${itemIdentifier}/${encodeURIComponent(bestFile.name)}`;
    }

    return null;
}

export const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }
    const floorSeconds = Math.floor(seconds);
    const min = Math.floor(floorSeconds / 60);
    const sec = floorSeconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};