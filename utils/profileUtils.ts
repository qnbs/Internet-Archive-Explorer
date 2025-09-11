import type { Profile } from '../types';

/**
 * Constructs the correct API query string for a given profile.
 * It accounts for curated uploaders who might use a different search field
 * like 'creator' or 'scanner' instead of the default 'uploader'.
 *
 * @param profile The profile object for the uploader or creator.
 * @returns A string formatted for the Internet Archive API 'q' parameter.
 */
export const getProfileApiQuery = (profile: Profile): string => {
    // For curated uploaders, check if they have a custom search field.
    if (profile.curatedData && profile.curatedData.searchField) {
        return `${profile.curatedData.searchField}:("${profile.searchIdentifier}")`;
    }

    // For all other uploaders and creators, use their designated type.
    return `${profile.type}:("${profile.searchIdentifier}")`;
};
