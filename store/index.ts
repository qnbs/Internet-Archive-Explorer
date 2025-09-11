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

export {
    searchQueryAtom,
    profileSearchQueryAtom,
    facetsAtom,
    searchHistoryAtom,
    addSearchHistoryAtom,
    clearSearchHistoryAtom,
    webArchiveUrlAtom,
} from './search';

// FIX: Corrected typo `addItemToCollectionAtom` to `addItemsToCollectionAtom` and exported missing atoms.
export {
    libraryItemsAtom,
    libraryItemIdentifiersAtom,
    addLibraryItemAtom,
    removeLibraryItemAtom,
    removeMultipleLibraryItemsAtom,
    updateLibraryItemNotesAtom,
    updateLibraryItemTagsAtom,
    addTagsToMultipleItemsAtom,
    uploaderFavoritesAtom,
    uploaderFavoriteSetAtom,
    addUploaderFavoriteAtom,
    removeUploaderFavoriteAtom,
    userCollectionsAtom,
    createCollectionAtom,
    deleteCollectionAtom,
    addItemsToCollectionAtom,
    librarySearchQueryAtom,
    libraryMediaTypeFilterAtom,
    librarySortAtom,
    selectedLibraryItemsForBulkActionAtom,
    allLibraryTagsAtom,
    selectedLibraryItemIdentifierAtom,
    libraryActiveFilterAtom,
} from './favorites';

export {
    defaultSettings,
    settingsAtom,
    setSettingAtom,
    resetSettingsAtom,
    // Search
    resultsPerPageAtom,
    showExplorerHubAtom,
    defaultSortAtom,
    rememberFiltersAtom,
    // Appearance
    layoutDensityAtom,
    reduceMotionAtom,
    // Content
    defaultUploaderDetailTabAtom,
    defaultDetailTabAllAtom,
    openLinksInNewTabAtom,
    autoplayMediaAtom,
    // AI
    enableAiFeaturesAtom,
    defaultAiTabAtom,
    autoRunEntityExtractionAtom,
    summaryToneAtom,
    // Accessibility
    highContrastModeAtom,
    underlineLinksAtom,
    fontSizeAtom,
    // Theme
    themeAtom,
    resolvedThemeAtom,
} from './settings';

export {
    languageAtom,
    loadableTranslationsAtom,
} from './i18n';