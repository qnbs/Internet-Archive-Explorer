import type { ArchiveMetadata, ArchiveSearchResponse, WaybackResponse } from '@/types';
import { metadataCache } from '@/services/cacheService';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

const API_BASE_URL = 'https://archive.org';
const SEARCH_PAGE_SIZE = 24;
const REQUEST_TIMEOUT_MS = 20000;

class ArchiveServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArchiveServiceError';
  }
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const handleFetchError = (error: unknown, context: string): never => {
  if (error instanceof ArchiveServiceError) {
    throw error;
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    throw new ArchiveServiceError(`The request for ${context} timed out. Please try again.`);
  }

  if (error instanceof TypeError) {
    throw new ArchiveServiceError(
      'A network error occurred. Please check your internet connection and try again.',
    );
  }

  throw new ArchiveServiceError(
    `Could not load ${context} from the Internet Archive. Please try again later.`,
  );
};

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 2,
  backoffMs = 400,
): Promise<Response> {
  try {
    const response = await fetchWithTimeout(url, options, REQUEST_TIMEOUT_MS);

    if (response.ok) {
      return response;
    }

    if ((response.status === 429 || response.status >= 500) && retries > 0) {
      await delay(backoffMs);
      return fetchWithRetry(url, options, retries - 1, backoffMs * 2);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(backoffMs);
      return fetchWithRetry(url, options, retries - 1, backoffMs * 2);
    }

    throw error;
  }
}

async function apiFetch<T>(url: string, context: string): Promise<T> {
  try {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new ArchiveServiceError(
        `Failed to fetch ${context}. Status: ${response.status} ${response.statusText}`,
      );
    }

    const text = await response.text();
    if (!text) {
      throw new ArchiveServiceError(`Empty response for ${context}.`);
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ArchiveServiceError(`Invalid JSON response for ${context}.`);
    }
  } catch (error) {
    return handleFetchError(error, context);
  }
}

export const searchArchive = async (
  query: string,
  page: number,
  sorts: string[] = [],
  fields: string[] = [
    'identifier',
    'title',
    'creator',
    'publicdate',
    'mediatype',
    'uploader',
    'access-restricted-item',
    'week',
    'downloads',
    'avg_rating',
  ],
  limit: number = SEARCH_PAGE_SIZE,
): Promise<ArchiveSearchResponse> => {
  const params = new URLSearchParams({
    q: query || 'featured',
    fl: fields.join(','),
    rows: limit.toString(),
    page: page.toString(),
    output: 'json',
  });

  if (sorts.length > 0) {
    sorts.forEach((sort) => params.append('sort[]', sort));
  } else if (query !== 'featured') {
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
  const txtUrl = `${API_BASE_URL}/stream/${identifier}/${identifier}_djvu.txt`;

  try {
    const response = await fetchWithRetry(txtUrl);
    if (!response.ok) {
      if (response.status === 404) {
        const fallbackResponse = await fetchWithRetry(
          `${API_BASE_URL}/stream/${identifier}/${identifier}.txt`,
        );
        if (fallbackResponse.ok) {
          return (await fallbackResponse.text()).replace(/(\r\n|\n|\r)/gm, '\n').trim();
        }
      }

      throw new ArchiveServiceError(
        `Failed to fetch plain text for ${identifier}. Status: ${response.status}`,
      );
    }

    const text = await response.text();
    return text.replace(/(\r\n|\n|\r)/gm, '\n').trim();
  } catch (error) {
    return handleFetchError(error, `plain text for ${identifier}`);
  }
};

export const searchWaybackMachine = async (url: string): Promise<WaybackResponse> => {
  const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&fl=timestamp,original&collapse=digest`;
  const data = await apiFetch<unknown>(cdxUrl, 'Wayback Machine results');

  if (!Array.isArray(data)) {
    return [];
  }

  const rows = data.slice(1);
  const snapshots: WaybackResponse = rows
    .filter(
      (row): row is [string, string] =>
        Array.isArray(row) &&
        row.length >= 2 &&
        typeof row[0] === 'string' &&
        typeof row[1] === 'string',
    )
    .map((row) => [row[0], row[1]]);

  return snapshots;
};

export const getItemCount = async (query: string): Promise<number> => {
  const params = new URLSearchParams({
    q: query,
    rows: '0',
    output: 'json',
  });

  const url = `${API_BASE_URL}/advancedsearch.php?${params.toString()}`;
  const data = await apiFetch<ArchiveSearchResponse>(url, `item count for query "${query}"`);

  return data.response?.numFound ?? 0;
};

export const getReviewsByUploader = async (
  uploader: string,
  page: number,
  limit: number = 10,
): Promise<ArchiveSearchResponse> => {
  const query = `reviewer:("${uploader}")`;
  const fields = [
    'identifier',
    'title',
    'creator',
    'publicdate',
    'mediatype',
    'uploader',
    'reviewdate',
    'reviewtitle',
    'reviewbody',
    'access-restricted-item',
  ];

  return searchArchive(query, page, ['-reviewdate'], fields, limit);
};
