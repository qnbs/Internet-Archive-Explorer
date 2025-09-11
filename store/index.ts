import {
    activeViewAtom,
    selectedProfileAtom,
    profileReturnViewAtom,
    modalAtom,
} from './app';
import type { ModalState } from './app';

export {
    activeViewAtom,
    selectedProfileAtom,
    profileReturnViewAtom,
    modalAtom,
};
export type { ModalState };

// FIX: Explicitly export from each store file to avoid name collision on `STORAGE_KEYS`.
export {
    searchQueryAtom,
    profileSearchQueryAtom,
    facetsAtom,
    searchHistoryAtom,
    addSearchHistoryAtom,
    clearSearchHistoryAtom,
    // FIX: Export webArchiveUrlAtom.
    webArchiveUrlAtom,
} from './search';

export {
    favoritesAtom,
    favoriteIdentifiersAtom,
    addFavoriteAtom,
    removeFavoriteAtom,
    removeMultipleFavoritesAtom,
    uploaderFavoritesAtom,
    uploaderFavoriteSetAtom,
    addUploaderFavoriteAtom,
    removeUploaderFavoriteAtom,
    favoritesSearchQueryAtom,
    favoritesMediaTypeFilterAtom,
    favoritesSortAtom,
    selectedFavoritesForBulkActionAtom,
} from './favorites';

export {
    defaultSettings,
    settingsAtom,
    setSettingAtom,
    resetSettingsAtom,
    resultsPerPageAtom,
    showExplorerHubAtom,
    defaultUploaderDetailTabAtom,
    defaultAiTabAtom,
    autoRunEntityExtractionAtom,
    autoplayMediaAtom,
    reduceMotionAtom,
    enableAiFeaturesAtom,
    themeAtom,
    resolvedThemeAtom,
    languageAtom,
    loadableTranslationsAtom,
} from './settings';
