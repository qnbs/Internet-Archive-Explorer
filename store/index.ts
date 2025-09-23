// This file serves as a central hub for exporting all Jotai atoms.
// This simplifies imports in components and avoids circular dependencies.

// Atoms with no dependencies are exported first.
export { toastAtom } from './toast';

export type { ModalState } from './app';
export { 
    activeViewAtom, 
    modalAtom, 
    isModalOpenAtom,
    currentModalTypeAtom,
    selectItemAtom, 
    selectedProfileAtom, 
    profileReturnViewAtom 
} from './app';

export {
    defaultSettings,
    settingsAtom,
    setSettingAtom,
    resetSettingsAtom,
    resultsPerPageAtom,
    showExplorerHubAtom,
    defaultSortAtom,
    rememberFiltersAtom,
    rememberSortAtom,
    layoutDensityAtom,
    disableAnimationsAtom,
    defaultUploaderDetailTabAtom,
    defaultDetailTabAllAtom,
    openLinksInNewTabAtom,
    autoplayMediaAtom,
    enableAiFeaturesAtom,
    autoArchiveAIAtom,
    defaultAiTabAtom,
    autoRunEntityExtractionAtom,
    summaryToneAtom,
    highContrastModeAtom,
    underlineLinksAtom,
    fontSizeAtom,
    themeAtom,
    resolvedThemeAtom,
    accentColorAtom,
    scrollbarColorAtom,
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
    languageAtom,
    loadableTranslationsAtom,
} from './i18n';

export {
    myArchiveProfileAtom,
    disconnectMyArchiveAtom,
} from './archive';

export {
    aiArchiveAtom,
    allAIArchiveTagsAtom,
    addAIArchiveEntryAtom,
    deleteAIArchiveEntryAtom,
    updateAIArchiveEntryAtom,
    updateAIEntryTagsAtom,
    selectedAIEntryIdAtom,
    aiArchiveSearchQueryAtom,
    aiArchiveFilterAtom,
    aiArchiveSortAtom,
    selectedAIEntryAtom,
    aiArchiveCountsAtom,
    filteredAndSortedEntriesAtom,
    clearAIArchiveAtom,
} from './aiArchive';

// These atoms have dependencies on other store files
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
    libraryCountsAtom,
    clearLibraryAtom,
} from './favorites';

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
    clearScriptoriumAtom,
} from './scriptorium';

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

export {
    deferredPromptAtom,
    isAppInstalledAtom
} from './pwa';
