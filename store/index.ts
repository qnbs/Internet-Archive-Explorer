// This file serves as a central hub for exporting all Jotai atoms.
// This simplifies imports in components and avoids circular dependencies.

export type { ModalState } from './app';
export { activeViewAtom, modalAtom, selectItemAtom } from './app';
export { selectedProfileAtom, profileReturnViewAtom } from './atoms';
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
    disableAnimationsAtom,
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
    updateCollectionNameAtom,
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
} from './archive';
export {
    aiArchiveAtom,
    allAIArchiveTagsAtom,
    addAIArchiveEntryAtom,
    deleteAIArchiveEntryAtom,
    updateAIArchiveEntryAtom,
    updateAIEntryTagsAtom
} from './aiArchive';
export {
    playlistAtom,
    currentTrackIndexAtom,
    isPlayingAtom,
    currentTrackAtom,
    playItemAtom,
    addToQueueAtom,
    togglePlayPauseAtom,
    nextTrackAtom,
    prevTrackAtom,
    clearPlaylistAtom,
    removeFromPlaylistAtom
} from './audioPlayer';