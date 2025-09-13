
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


/**
 * Fetches an image from a URL and converts it to a base64 string.
 * @param imageUrl The URL of the image to fetch.
 * @returns A promise that resolves to an object containing the base64 string and MIME type.
 */
export const urlToBase64 = async (imageUrl: string): Promise<{ base64: string; mimeType: string }> => {
    // AI Studio provides a CORS proxy, which is necessary for fetching images from archive.org
    const proxyUrl = `/proxy?url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            if (base64String) {
                resolve({ base64: base64String, mimeType });
            } else {
                reject(new Error('Failed to convert blob to base64'));
            }
        };
        reader.readAsDataURL(blob);
    });
};
