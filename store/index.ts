// This file serves as a central hub for exporting all Jotai atoms.
// This simplifies imports in components and avoids circular dependencies.

export type { ModalState } from './app';
export { activeViewAtom, modalAtom } from './app';
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
export {
    worksetsAtom,
    selectedWorksetIdAtom,
    selectedDocumentIdAtom,
    createWorksetAtom,
    deleteWorksetAtom,
    updateWorksetNameAtom,
    addDocumentToWorksetAtom,
    removeDocumentFromWorksetAtom,
    updateDocumentNotesAtom,
} from './scriptorium';
export {
    myArchiveProfileAtom,
    selectedProfileAtom,
    profileReturnViewAtom,
    toastAtom,
} from './archive';
export {
    aiArchiveAtom,
    selectedAIEntryIdAtom,
    aiArchiveSearchQueryAtom,
    allAIArchiveTagsAtom,
    addAIArchiveEntryAtom,
    deleteAIArchiveEntryAtom,
    updateAIArchiveEntryAtom,
    updateAIEntryTagsAtom
} from './aiArchive';