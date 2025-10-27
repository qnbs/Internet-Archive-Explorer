import type { ArchiveFile } from '../types';

/**
 * Finds the best-quality, web-compatible media URL from a list of files.
 * @param files - The array of file objects from the item's metadata.
 * @param itemIdentifier - The identifier of the Internet Archive item.
 * @param mediaType - The type of media to search for ('audio' or 'video').
 * @returns The full URL to the best media file, or null if not found.
 */
export const findPlayableFile = (files: ArchiveFile[], itemIdentifier: string, mediaType: 'audio' | 'video'): string | null => {
    // Prioritized list of formats for better web compatibility
    const audioFormats = ['VBR MP3', 'MP3', 'MPEG4', 'Ogg Vorbis', 'FLAC'];
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
