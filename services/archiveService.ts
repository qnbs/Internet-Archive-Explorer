import { z } from 'zod';
import { metadataCache } from '@/services/cacheService';
import type { ArchiveMetadata, ArchiveSearchResponse, WaybackResponse } from '@/types';
import {
  archiveMetadataSchema,
  archiveSearchResponseSchema,
  SERVICE_I18N,
  waybackCdxJsonSchema,
} from '@/types/archiveSchemas';
import { delay, fetchWithRetry } from '@/utils/fetchWithRetry';
import { logger } from '@/utils/logger';

const API_BASE_URL = 'https://archive.org';
const SEARCH_PAGE_SIZE = 24;
const REQUEST_TIMEOUT_MS = 20000;
const VALIDATION_MAX_ATTEMPTS = 3;
const VALIDATION_BACKOFF_MS = 400;

export class ArchiveServiceError extends Error {
  readonly statusCode?: number;
  readonly i18nKey?: string;
  constructor(message: string, statusCode?: number, i18nKey?: string) {
    super(message);
    this.name = 'ArchiveServiceError';
    this.statusCode = statusCode;
    this.i18nKey = i18nKey;
  }
}

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

async function fetchRawJson(url: string, context: string): Promise<unknown> {
  try {
    const response = await fetchWithRetry(url, {}, 2, 400, REQUEST_TIMEOUT_MS);

    if (!response.ok) {
      throw new ArchiveServiceError(
        `Failed to fetch ${context}. Status: ${response.status} ${response.statusText}`,
        response.status,
      );
    }

    const text = await response.text();
    if (!text) {
      throw new ArchiveServiceError(`Empty response for ${context}.`);
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new ArchiveServiceError(
        `Invalid JSON response for ${context}.`,
        undefined,
        SERVICE_I18N.archive.invalidJson,
      );
    }
  } catch (error) {
    return handleFetchError(error, context);
  }
}

async function fetchValidated<T>(url: string, context: string, schema: z.ZodType<T>): Promise<T> {
  let lastZodError: z.ZodError | undefined;

  for (let attempt = 0; attempt < VALIDATION_MAX_ATTEMPTS; attempt++) {
    const raw = await fetchRawJson(url, context);
    const parsed = schema.safeParse(raw);
    if (parsed.success) {
      return parsed.data;
    }
    lastZodError = parsed.error;
    if (attempt < VALIDATION_MAX_ATTEMPTS - 1) {
      await delay(VALIDATION_BACKOFF_MS * 2 ** attempt);
    }
  }

  logger.warn(`[archiveService] Zod validation failed for ${context}`, lastZodError?.flatten());
  throw new ArchiveServiceError(
    `The Internet Archive returned an unexpected shape for ${context}. Please try again.`,
    undefined,
    SERVICE_I18N.archive.validationFailed,
  );
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
  const data = await fetchValidated(url, 'search results', archiveSearchResponseSchema);
  // Zod infers string unions for mediatype; runtime values match `MediaType` / `ArchiveItemSummary`.
  return data as ArchiveSearchResponse;
};

export const getItemMetadata = async (identifier: string): Promise<ArchiveMetadata> => {
  const cachedData = await metadataCache.get(identifier);
  if (cachedData !== undefined) {
    const cached = archiveMetadataSchema.safeParse(cachedData);
    if (cached.success) {
      return cached.data as ArchiveMetadata;
    }
  }

  const url = `${API_BASE_URL}/metadata/${identifier}`;
  const data = await fetchValidated(url, `metadata for ${identifier}`, archiveMetadataSchema);
  await metadataCache.set(identifier, data as ArchiveMetadata);
  return data as ArchiveMetadata;
};

export const getItemPlainText = async (identifier: string): Promise<string> => {
  const txtUrl = `${API_BASE_URL}/stream/${identifier}/${identifier}_djvu.txt`;

  try {
    const response = await fetchWithRetry(txtUrl, {}, 2, 400, REQUEST_TIMEOUT_MS);
    if (!response.ok) {
      if (response.status === 404) {
        const fallbackResponse = await fetchWithRetry(
          `${API_BASE_URL}/stream/${identifier}/${identifier}.txt`,
          {},
          2,
          400,
          REQUEST_TIMEOUT_MS,
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
  const data = await fetchValidated(cdxUrl, 'Wayback Machine results', waybackCdxJsonSchema);

  if (!Array.isArray(data) || data.length === 0) {
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
  const data = await fetchValidated(
    url,
    `item count for query "${query}"`,
    archiveSearchResponseSchema,
  );

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
