
import type { ArchiveSearchResponse, ArchiveMetadata, WaybackResponse, ArchiveItemSummary } from '../types';
import { metadataCache } from './cacheService';

const API_BASE_URL = 'https://archive.org';
const SEARCH_PAGE_SIZE = 24;

export class ArchiveServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArchiveServiceError';
  }
}

const handleFetchError = (e: unknown, context: string): never => {
    console.error(`Archive.org ${context} request failed:`, e);
    // If it's already our custom error, just re-throw it.
    if (e instanceof ArchiveServiceError) throw e;
    
    // Check for a network error (e.g., offline, CORS issue in some environments)
    if (e instanceof TypeError && e.message === 'Failed to fetch') {
        throw new ArchiveServiceError(`A network error occurred. Please check your internet connection and try again.`);
    }

    // Provide a more user-friendly generic message
    throw new ArchiveServiceError(`Could not retrieve ${context} from the Internet Archive. Please try again later.`);
};

/**
 * Fetches a URL with exponential backoff retry logic for 5xx errors and network failures.
 * 
 * @param url The URL to fetch
 * @param options Fetch options
 * @param retries Number of retries remaining (default 3)
 * @param backoff Initial backoff delay in ms (default 500)
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 500): Promise<Response> {
    try {
        const response = await fetch(url, options);
        
        // Retry on server errors (5xx) or rate limiting (429)
        if (!response.ok && (response.status >= 500 || response.status === 429)) {
            if (retries > 0) {
                // Exponential backoff with full jitter: delay = random_between(0, min(cap, base * 2 ^ attempt))
                // Simplified here to: delay = backoff + jitter
                const jitter = Math.random() * 200;
                const delay = backoff + jitter;
                
                console.warn(`Fetch failed with ${response.status}. Retrying in ${Math.round(delay)}ms... (${retries} retries left)`);
                await new Promise(r => setTimeout(r, delay));
                
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
        }
        
        return response;
    } catch (e) {
        // Retry on network errors (fetch throws on network failure)
        if (retries > 0) {
             const jitter = Math.random() * 200;
             const delay = backoff + jitter;
             
             console.warn(`Network request failed. Retrying in ${Math.round(delay)}ms... (${retries} retries left)`);
             await new Promise(r => setTimeout(r, delay));
             
             return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw e;
    }
}

async function apiFetch<T>(url: string, context: string): Promise<T> {
    try {
        const response = await fetchWithRetry(url);
        if (!response.ok) {
            throw new ArchiveServiceError(`Failed to fetch ${context}. Status: ${response.status} ${response.statusText}`);
        }
        // Handle cases where the response might be empty text, like in Wayback Machine
        const text = await response.text();
        if (!text) {
            return [] as T; // Return an empty array or appropriate empty value for the type T
        }
        try {
            return JSON.parse(text) as T;
        } catch (jsonError) {
             // Sometimes Archive.org might return HTML error pages with 200 OK (rare but possible behind load balancers)
             throw new ArchiveServiceError(`Invalid JSON response for ${context}.`);
        }
    } catch (e) {
        handleFetchError(e, context);
    }
}

export const searchArchive = async (
  query: string,
  page: number,
  sorts: string[] = [],
  fields: string[] = ['identifier', 'title', 'creator', 'publicdate', 'mediatype', 'uploader', 'access-restricted-item', 'week', 'downloads', 'avg_rating'],
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
  return apiFetch<ArchiveSearchResponse>(url, 'search results');
};

export const getItemMetadata = async (identifier: string): Promise<ArchiveMetadata> => {
    const cachedData = await metadataCache.get(identifier);
    if (cachedData) {
        return cachedData;
    }
    const url = `${API_BASE_URL}/metadata/${identifier}`;
    const data = await apiFetch<ArchiveMetadata>(url, `metadata for ${identifier}`);
    await metadataCache.set(identifier, data);
    return data;
};

export const getItemPlainText = async (identifier: string): Promise<string> => {
  // Attempt to fetch DjVu TXT first as it's often cleaner
  const txtUrl = `${API_BASE_URL}/stream/${identifier}/${identifier}_djvu.txt`;
  
  try {
    const response = await fetchWithRetry(txtUrl);
    if (!response.ok) {
      if (response.status === 404) {
         // Fallback to standard text file
         const response2 = await fetchWithRetry(`${API_BASE_URL}/stream/${identifier}/${identifier}.txt`);
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
    handleFetchError(error, `plain text for ${identifier}`);
  }
};

export const searchWaybackMachine = async (url: string): Promise<WaybackResponse> => {
  const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&fl=timestamp,original&collapse=digest`;
  
  const data = await apiFetch<any[]>(cdxUrl, 'Wayback Machine results');
  if (Array.isArray(data) && data.length > 0) {
    // The first row is the header, slice it off.
    return data.slice(1);
  }
  return [];
};

export const getItemCount = async (query: string): Promise<number> => {
  const params = new URLSearchParams({
    q: query,
    rows: '0', // We don't need any documents, just the count
    output: 'json',
  });

  const url = `${API_BASE_URL}/advancedsearch.php?${params.toString()}`;
  const data = await apiFetch<ArchiveSearchResponse>(url, `item count for query "${query}"`);
  return data?.response?.numFound || 0;
};

export const getReviewsByUploader = async (
  uploader: string,
  page: number,
  limit: number = 10
): Promise<ArchiveSearchResponse> => {
  const query = `reviewer:("${uploader}")`;
  const fields = [
    'identifier', 'title', 'creator', 'publicdate', 'mediatype', 'uploader',
    'reviewdate', 'reviewtitle', 'reviewbody', 'access-restricted-item'
  ];
  return searchArchive(query, page, ['-reviewdate'], fields, limit);
};
