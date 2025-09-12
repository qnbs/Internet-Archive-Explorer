import type { Facets } from '../types';

interface QueryOptions {
    base?: string;
    text?: string;
    facets?: Partial<Facets>;
}

/**
 * Builds a valid Lucene query string for the Internet Archive API.
 * @param options An object containing the query parts.
 * @returns A formatted query string.
 */
export const buildArchiveQuery = (options: QueryOptions = {}): string => {
    const { base, text, facets } = options;
    const queryParts: string[] = [];

    if (base) {
        queryParts.push(base);
    }
    
    if (text?.trim()) {
        queryParts.push(`(${text.trim()})`);
    }

    if (facets) {
        if (facets.mediaType?.size) {
            const mediaTypes = Array.from(facets.mediaType).join(' OR ');
            queryParts.push(`mediatype:(${mediaTypes})`);
        }

        if (facets.yearStart && facets.yearEnd) {
            queryParts.push(`publicdate:[${facets.yearStart} TO ${facets.yearEnd}]`);
        } else if (facets.yearStart) {
            queryParts.push(`publicdate:[${facets.yearStart} TO 9999]`);
        } else if (facets.yearEnd) {
            queryParts.push(`publicdate:[0000 TO ${facets.yearEnd}]`);
        }

        if (facets.collection) {
            queryParts.push(`collection:(${facets.collection})`);
        }
        
        if (facets.availability === 'borrowable') {
            queryParts.push(`access-restricted-item:"true"`);
        } else if (facets.availability === 'free') {
            queryParts.push(`NOT access-restricted-item:"true"`);
        }
    }
    
    return queryParts.join(' AND ');
};