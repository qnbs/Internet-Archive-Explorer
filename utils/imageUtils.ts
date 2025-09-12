import type { ArchiveFile } from '../types';

/**
 * A list of preferred image formats for web display, ordered by preference.
 */
const PREFERRED_FORMATS = ['PNG', 'JPEG', 'Single Page Processed JP2 ZIP', 'GIF'];

/**
 * Finds the best-quality, web-compatible image URL from a list of files for an Internet Archive item.
 *
 * @param files - The array of file objects from the item's metadata.
 * @param identifier - The identifier of the Internet Archive item.
 * @returns The full URL to the best image file, or null if no suitable file is found.
 */
export const findBestImageUrl = (files: ArchiveFile[], identifier: string): string | null => {
  if (!files || files.length === 0) {
    return null;
  }

  let bestFile: ArchiveFile | null = null;

  // First pass: Look for preferred formats, excluding thumbnails.
  for (const format of PREFERRED_FORMATS) {
    const foundFile = files.find(f => f.format === format && !f.name.toLowerCase().includes('thumb'));
    if (foundFile) {
      bestFile = foundFile;
      break;
    }
  }

  // Second pass (fallback): If no preferred format is found, take the largest JPG or PNG file.
  if (!bestFile) {
    const imageFiles = files
      .filter(f => 
        (f.format.toLowerCase().includes('jpeg') || f.format.toLowerCase().includes('png')) &&
        !f.name.toLowerCase().includes('thumb') &&
        f.size
      )
      .sort((a, b) => Number(b.size!) - Number(a.size!));

    if (imageFiles.length > 0) {
      bestFile = imageFiles[0];
    }
  }

  // Final fallback: Use the item's main image service if all else fails.
  if (!bestFile && files.some(f => f.format === 'Item Image')) {
     return `https://archive.org/services/get-item-image.php?identifier=${identifier}`;
  }
  
  if (bestFile) {
      return `https://archive.org/download/${identifier}/${encodeURIComponent(bestFile.name)}`;
  }

  return null;
};