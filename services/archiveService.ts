import type { ArchiveSearchResponse, ArchiveMetadata, WaybackResponse, ArchiveItemSummary } from '../types';

const API_BASE_URL = 'https://archive.org';
const SEARCH_PAGE_SIZE = 24;

export class ArchiveServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArchiveServiceError';
  }
}

export const searchArchive = async (
  query: string,
  page: number,
  sorts: string[] = [],
  fields: string[] = ['identifier', 'title', 'creator', 'publicdate', 'mediatype', 'uploader'],
  limit: number = SEARCH_PAGE_SIZE
): Promise<ArchiveSearchResponse> => {
  
  const params = new URLSearchParams({
    q: query || 'featured', // API requires a query
    fl: fields.join(','),
    rows: limit.toString(),
    page: page.toString(),
    output: 'json',
  });

  if (sorts.length > 0) {
    sorts.forEach(sort => params.append('sort[]', sort));
  } else if (query !== 'featured') { // only apply default sort if not a featured query
     params.append('sort[]', '-publicdate');
  }

  const url = `${API_BASE_URL}/advancedsearch.php?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new ArchiveServiceError(`Failed to fetch search results. Status: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (e) {
    console.error("Archive.org search request failed for URL:", url, e);
    if (e instanceof ArchiveServiceError) throw e;
    throw new ArchiveServiceError(`A network error occurred while searching. Please check your connection.`);
  }
};

export const getItemMetadata = async (identifier: string): Promise<ArchiveMetadata> => {
    const url = `${API_BASE_URL}/metadata/${identifier}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new ArchiveServiceError(`Failed to fetch metadata for ${identifier}. Status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Archive.org metadata request failed for URL:", url, e);
        if (e instanceof ArchiveServiceError) throw e;
        throw new ArchiveServiceError(`A network error occurred while fetching item details.`);
    }
};

export const getItemPlainText = async (identifier: string): Promise<string> => {
  const txtUrl = `${API_BASE_URL}/stream/${identifier}/${identifier}_djvu.txt`;
  
  try {
    const response = await fetch(txtUrl);
    if (!response.ok) {
      if (response.status === 404) {
         const response2 = await fetch(`${API_BASE_URL}/stream/${identifier}/${identifier}.txt`);
         if(response2.ok) {
            return await response2.text();
         }
      }
      throw new ArchiveServiceError(`Failed to fetch plain text for ${identifier}. Status: ${response.status}`);
    }
    const text = await response.text();
    // Basic cleanup
    return text.replace(/(\r\n|\n|\r)/gm, "\n").trim();
  } catch (error) {
    console.error('Error fetching plain text:', error);
    if (error instanceof ArchiveServiceError) throw error;
    return "The plain text version of this document could not be loaded. It might not be available.";
  }
};

export const searchWaybackMachine = async (url: string): Promise<WaybackResponse> => {
  const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&fl=timestamp,original&collapse=digest`;

  try {
      const response = await fetch(cdxUrl);
      if (!response.ok) {
        throw new ArchiveServiceError(`Failed to search Wayback Machine. Status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        return []; // Empty response means no snapshots found
      }
      
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0) {
        // The first row is the header, slice it off.
        return data.slice(1);
      }
      return [];
  } catch (e) {
    console.error("Failed to parse JSON response from Wayback Machine", e);
    if (e instanceof ArchiveServiceError) throw e;
    throw new ArchiveServiceError(`A network error occurred while searching the Wayback Machine.`);
  }
};

export const getRandomItemFromCollection = async (collection: string): Promise<ArchiveItemSummary | null> => {
  try {
    const countParams = new URLSearchParams({
      q: `collection:(${collection}) AND mediatype:image`,
      rows: '0',
      output: 'json',
    });
    const countResponse = await fetch(`${API_BASE_URL}/advancedsearch.php?${countParams.toString()}`);
    if (!countResponse.ok) throw new Error('Failed to get count');
    const countData = await countResponse.json();
    const numFound = countData.response.numFound;
    if (numFound === 0) return null;

    const randomIndex = Math.floor(Math.random() * Math.min(numFound, 10000)); // API limit for `start`
    
    const itemParams = new URLSearchParams({
      q: `collection:(${collection}) AND mediatype:image`,
      fl: 'identifier,title,creator,publicdate,mediatype,uploader',
      rows: '1',
      start: randomIndex.toString(),
      output: 'json',
    });
    // FIX: Completed the fetch URL.
    const itemResponse = await fetch(`${API_BASE_URL}/advancedsearch.php?${itemParams.toString()}`);
    if (!itemResponse.ok) throw new Error('Failed to get item');
    const itemData = await itemResponse.json();
    return itemData.response.docs[0] || null;
  } catch (error) {
    console.error(`Failed to get random item from ${collection}`, error);
    return null;
  }
};

// FIX: Added missing getItemCount function.
export const getItemCount = async (query: string): Promise<number> => {
  const params = new URLSearchParams({
    q: query,
    rows: '0', // We don't need any documents, just the count
    output: 'json',
  });

  const url = `${API_BASE_URL}/advancedsearch.php?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new ArchiveServiceError(`Failed to fetch item count. Status: ${response.status}`);
    }
    const data: ArchiveSearchResponse = await response.json();
    return data.response.numFound;
  } catch (e) {
    console.error("Archive.org count request failed for URL:", url, e);
    if (e instanceof ArchiveServiceError) throw e;
    throw new ArchiveServiceError(`A network error occurred while fetching item count.`);
  }
};

// FIX: Added missing getReviewsByUploader function.
export const getReviewsByUploader = async (
  uploader: string,
  page: number,
  limit: number = 10
): Promise<ArchiveSearchResponse> => {
  const query = `reviewer:("${uploader}")`;
  const fields = [
    'identifier', 'title', 'creator', 'publicdate', 'mediatype', 'uploader',
    'reviewdate', 'reviewtitle', 'reviewbody'
  ];
  return searchArchive(query, page, ['-reviewdate'], fields, limit);
};