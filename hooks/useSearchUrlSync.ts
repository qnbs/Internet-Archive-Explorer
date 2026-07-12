import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { facetsAtom, searchQueryAtom } from '@/store/search';
import type { Availability, Facets, MediaType } from '@/types';

const QUERY_PARAM = 'q';
const MEDIA_TYPE_PARAM = 'mediaType';
const AVAILABILITY_PARAM = 'availability';
const LANGUAGE_PARAM = 'language';
const YEAR_START_PARAM = 'yearStart';
const YEAR_END_PARAM = 'yearEnd';
const COLLECTION_PARAM = 'collection';

const VALID_MEDIA_TYPES = new Set<string>([
  'audio',
  'movies',
  'texts',
  'image',
  'software',
  'collection',
  'data',
  'web',
]);

const VALID_AVAILABILITY = new Set<Availability>(['all', 'free', 'borrowable']);

function parseMediaTypeParam(value: string | null): Set<MediaType> {
  if (!value) return new Set<MediaType>();
  const types = value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => VALID_MEDIA_TYPES.has(t));
  return new Set<MediaType>(types as MediaType[]);
}

function parseAvailabilityParam(value: string | null): Availability {
  if (value && VALID_AVAILABILITY.has(value as Availability)) {
    return value as Availability;
  }
  return 'all';
}

function parseNumberParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function facetsFromSearchParams(searchParams: URLSearchParams): Facets {
  return {
    mediaType: parseMediaTypeParam(searchParams.get(MEDIA_TYPE_PARAM)),
    availability: parseAvailabilityParam(searchParams.get(AVAILABILITY_PARAM)),
    language: searchParams.get(LANGUAGE_PARAM) ?? undefined,
    yearStart: parseNumberParam(searchParams.get(YEAR_START_PARAM)),
    yearEnd: parseNumberParam(searchParams.get(YEAR_END_PARAM)),
    collection: searchParams.get(COLLECTION_PARAM) ?? undefined,
  };
}

function isSameMediaType(a: Set<MediaType>, b: Set<MediaType>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

function isSameFacets(a: Facets, b: Facets): boolean {
  return (
    isSameMediaType(a.mediaType, b.mediaType) &&
    a.availability === b.availability &&
    a.language === b.language &&
    a.yearStart === b.yearStart &&
    a.yearEnd === b.yearEnd &&
    a.collection === b.collection
  );
}

function buildParamsFromState(
  searchParams: URLSearchParams,
  searchQuery: string,
  facets: Facets,
): URLSearchParams {
  const next = new URLSearchParams(searchParams);

  if (searchQuery.trim()) {
    next.set(QUERY_PARAM, searchQuery.trim());
  } else {
    next.delete(QUERY_PARAM);
  }

  if (facets.mediaType.size > 0) {
    next.set(MEDIA_TYPE_PARAM, Array.from(facets.mediaType).join(','));
  } else {
    next.delete(MEDIA_TYPE_PARAM);
  }

  if (facets.availability !== 'all') {
    next.set(AVAILABILITY_PARAM, facets.availability);
  } else {
    next.delete(AVAILABILITY_PARAM);
  }

  if (facets.language) {
    next.set(LANGUAGE_PARAM, facets.language);
  } else {
    next.delete(LANGUAGE_PARAM);
  }

  if (facets.yearStart !== undefined) {
    next.set(YEAR_START_PARAM, String(facets.yearStart));
  } else {
    next.delete(YEAR_START_PARAM);
  }

  if (facets.yearEnd !== undefined) {
    next.set(YEAR_END_PARAM, String(facets.yearEnd));
  } else {
    next.delete(YEAR_END_PARAM);
  }

  if (facets.collection) {
    next.set(COLLECTION_PARAM, facets.collection);
  } else {
    next.delete(COLLECTION_PARAM);
  }

  return next;
}

/**
 * Keeps the Explorer search query and facets in sync with the URL query string.
 *
 * Supported parameters:
 * - `?q=<query>`
 * - `?mediaType=audio,texts`
 * - `?availability=free|borrowable`
 * - `?language=<language>`
 * - `?yearStart=<year>&yearEnd=<year>`
 * - `?collection=<collection>`
 *
 * Empty/default values are removed from the URL. This hook should be used
 * inside the view that owns the search results (Explorer).
 */
export function useSearchUrlSync(): void {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [facets, setFacets] = useAtom(facetsAtom);
  const [searchParams, setSearchParams] = useSearchParams();
  const lastSynced = useRef<{ query: string; facets: Facets; params: string }>({
    query: searchQuery,
    facets,
    params: '',
  });

  useEffect(() => {
    const currentParams = searchParams.toString();
    const paramsMatch = lastSynced.current.params === currentParams;
    const queryMatch = lastSynced.current.query === searchQuery;
    const facetsMatch = isSameFacets(lastSynced.current.facets, facets);

    if (paramsMatch && queryMatch && facetsMatch) {
      return;
    }

    if (!paramsMatch) {
      // URL changed (initial load, back/forward, external navigation):
      // update atoms to match the URL.
      const queryFromUrl = searchParams.get(QUERY_PARAM) ?? '';
      const facetsFromUrl = facetsFromSearchParams(searchParams);
      if (queryFromUrl !== searchQuery) {
        setSearchQuery(queryFromUrl);
      }
      if (!isSameFacets(facetsFromUrl, facets)) {
        setFacets(facetsFromUrl);
      }
      lastSynced.current = { query: queryFromUrl, facets: facetsFromUrl, params: currentParams };
      return;
    }

    // Atoms changed: update the URL to match.
    const next = buildParamsFromState(searchParams, searchQuery, facets);
    const nextParams = next.toString();
    if (currentParams !== nextParams) {
      setSearchParams(next, { replace: true });
    }
    lastSynced.current = { query: searchQuery, facets, params: nextParams };
  }, [searchParams, searchQuery, facets, setSearchQuery, setFacets, setSearchParams]);
}
