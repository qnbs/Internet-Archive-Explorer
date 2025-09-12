// This file serves as a central hub for exporting all Jotai atoms.
// This simplifies imports in components and avoids circular dependencies.

// FIX: Added export for atoms from the newly created store/app.ts
export * from './app';
export {
    defaultSettings,
    settingsAtom,
    setSettingAtom,
    resetSettingsAtom,
    resultsPerPageAtom,
    showExplorerHubAtom,
    defaultSortAtom,
    rememberFiltersAtom,
    layoutDensityAtom,
    reduceMotionAtom,
    defaultUploaderDetailTabAtom,
    defaultDetailTabAllAtom,
    openLinksInNewTabAtom,
    autoplayMediaAtom,
    enableAiFeaturesAtom,
    defaultAiTabAtom,
    autoRunEntityExtractionAtom,
    summaryToneAtom,
    highContrastModeAtom,
    underlineLinksAtom,
    fontSizeAtom,
    themeAtom,
    resolvedThemeAtom,
} from './settings';
export {
    searchQueryAtom,
    profileSearchQueryAtom,
    facetsAtom,
    searchHistoryAtom,
    addSearchHistoryAtom,
    clearSearchHistoryAtom,
} from './search';
export {
    libraryItemsAtom,
    libraryItemIdentifiersAtom,
    addLibraryItemAtom,
    removeLibraryItemAtom,
    updateLibraryItemNotesAtom,
    updateLibraryItemTagsAtom,
    uploaderFavoritesAtom,
    uploaderFavoriteSetAtom,
    addUploaderFavoriteAtom,
    removeUploaderFavoriteAtom,
    userCollectionsAtom,
    createCollectionAtom,
    deleteCollectionAtom,
    addItemsToCollectionAtom,
    allTagsAtom,
    addTagsToItemsAtom,
    removeLibraryItemsAtom,
} from './favorites';
export {
    languageAtom,
    loadableTranslationsAtom,
} from './i18n';
export * from './scriptorium';
export * from './archive';