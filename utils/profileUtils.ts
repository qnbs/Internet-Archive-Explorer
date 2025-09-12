import type { Profile } from '../types';

/**
 * Constructs the correct API query string for a given profile.
 * This version is designed to be robust against metadata inconsistencies
 * by searching for both the display name and the specific search identifier
 * in the relevant fields.
 *
 * @param profile The profile object for the uploader or creator.
 * @returns A string formatted for the Internet Archive API 'q' parameter.
 */
export const getProfileApiQuery = (profile: Profile): string => {
    const searchId = profile.searchIdentifier.replace(/"/g, '\\"');
    const displayName = profile.name.replace(/"/g, '\\"');

    // Handle curated profiles with a specific override search field (e.g., 'scanner')
    if (profile.curatedData?.searchField) {
        return `${profile.curatedData.searchField}:("${searchId}")`;
    }
    
    // For 'creator' profiles, the search is simpler as name and identifier are the same.
    if (profile.type === 'creator') {
         return `creator:("${searchId}")`;
    }

    // For 'uploader' profiles, build a comprehensive query to find all associated items.
    if (profile.type === 'uploader') {
        const queries = new Set<string>();

        // 1. Search for the display name/screenname in the `creator` field.
        // (e.g., creator:"Jeff Kaplan")
        queries.add(`creator:("${displayName}")`);

        // 2. Search for the specific uploader identifier in the `uploader` field.
        // (e.g., uploader:"associate-jeff-kaplan@archive.org")
        queries.add(`uploader:("${searchId}")`);

        // 3. If the search identifier is a simple name (not an email), also check
        // for common email-like variants in the `uploader` field.
        // (e.g., for 'scitec', check uploader:"scitec@archive.org")
        if (!searchId.includes('@')) {
            queries.add(`uploader:("${searchId}@archive.org")`);
        }

        // 4. In case the display name is also used as an uploader id and is different.
        if (displayName !== searchId) {
             queries.add(`uploader:("${displayName}")`);
             if (!displayName.includes('@')) {
                queries.add(`uploader:("${displayName}@archive.org")`);
             }
        }

        return `(${Array.from(queries).join(' OR ')})`;
    }

    // Fallback for any other case, though it should be covered above.
    return `uploader:("${searchId}")`;
};