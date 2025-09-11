
// FIX: Explicitly export from './app' to resolve a potential type inference issue with Jotai's useSetAtom hook.
export {
    activeViewAtom,
    selectedProfileAtom,
    profileReturnViewAtom,
    modalAtom,
} from './app';
export type { ModalState } from './app';

// FIX: Explicitly export from each store file to avoid name collision on `STORAGE_KEYS`.
export {
    searchQueryAtom,
    profileSearchQueryAtom,
    webArchiveUrlAtom,
    facetsAtom,
    searchHistoryAtom,
    addSearchHistoryAtom,
    clearSearchHistoryAtom,
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