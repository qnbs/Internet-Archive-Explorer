import type { ArchiveSearchResponse, ArchiveMetadata, WaybackResponse, ArchiveItemSummary } from '../types';

const API_BASE_URL = 'https://archive.org';
const SEARCH_PAGE_SIZE = 24;

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

  const response = await fetch(`${API_BASE_URL}/advancedsearch.php?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  try {
    return await response.json();
  } catch (e) {
    console.error("Failed to parse JSON response from Archive.org search", e);
    throw new Error(`Failed to parse response from server.`);
  }
};

export const getItemMetadata = async (identifier: string): Promise<ArchiveMetadata> => {
  const response = await fetch(`${API_BASE_URL}/metadata/${identifier}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  try {
    return await response.json();
  } catch (e) {
    console.error("Failed to parse JSON response from Archive.org metadata", e);
    throw new Error(`Failed to parse response from server.`);
  }
};

export const getItemPlainText = async (identifier: string): Promise<string> => {
  // Texts on archive.org are often available in a _djvu.txt file.
  // This is an assumption, but a common one.
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
      throw new Error(`Failed to fetch plain text. Status: ${response.status}`);
    }
    const text = await response.text();
    // Basic cleanup
    return text.replace(/(\r\n|\n|\r)/gm, "\n").trim();
  } catch (error) {
    console.error('Error fetching plain text:', error);
    return "The plain text version of this document could not be loaded. It might not be available.";
  }
};

export const searchWaybackMachine = async (url: string): Promise<WaybackResponse> => {
  const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&fl=timestamp,original&collapse=digest`;

  const response = await fetch(cdxUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  if (!text) {
    return []; // Empty response means no snapshots found
  }
  
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data) && data.length > 0) {
      // The first row is the header, slice it off.
      return data.slice(1);
    }
    return [];
  } catch (e) {
    console.error("Failed to parse JSON response from Wayback Machine", e);
    throw new Error(`Failed to parse response from server.`);
  }
};

export const getRandomItemFromCollection = async (collection: string): Promise<ArchiveItemSummary | null> => {
  try {
    // First, get the total number of items to determine a random page
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

    // Fetch a single random item
    const randomIndex = Math.floor(Math.random() * Math.min(numFound, 10000)); // API limit for `start`
    
    const itemParams = new URLSearchParams({
      q: `collection:(${collection}) AND mediatype:image`,
      fl: 'identifier,title,creator,publicdate,mediatype,uploader',
      rows: '1',
      start: randomIndex.toString(),
      output: 'json',
    });
    const itemResponse = await fetch(`${API_BASE_URL}/advancedsearch.php?${itemParams.toString()}`);
    if (!itemResponse.ok) throw new Error('Failed to get item');
    const itemData = await itemResponse.json();
    
    if (itemData.response.docs.length > 0) {
      return itemData.response.docs[0];
    }
    return null;

  } catch (error) {
    console.error("Error fetching random item:", error);
    return null;
  }
};

export const getItemCount = async (query: string): Promise<number> => {
    const params = new URLSearchParams({
        q: query,
        rows: '0',
        output: 'json',
    });
    const response = await fetch(`${API_BASE_URL}/advancedsearch.php?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    try {
        const data = await response.json();
        return data.response.numFound;
    } catch (e) {
        console.error("Failed to parse JSON response from Archive.org count", e);
        return 0;
    }
};

export const getReviewsByUploader = async (
  uploader: string,
  page: number,
  limit: number = 10
): Promise<ArchiveSearchResponse> => {
  const query = `reviewer:("${uploader}")`;
  const fields = ['identifier', 'title', 'creator', 'publicdate', 'mediatype', 'reviewdate', 'reviewtitle', 'reviewbody'];
  const sorts = ['-reviewdate'];
  // The searchArchive function uses a page size of 24 by default, so we pass the limit
  return searchArchive(query, page, sorts, fields, limit);
};