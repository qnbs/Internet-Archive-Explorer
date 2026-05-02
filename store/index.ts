// This file serves as a central hub for exporting all Jotai atoms.
// This simplifies imports in components and avoids circular dependencies.

export {
  addAIArchiveEntryAtom,
  aiArchiveAtom,
  aiArchiveCountsAtom,
  aiArchiveFilterAtom,
  aiArchiveSearchQueryAtom,
  aiArchiveSortAtom,
  allAIArchiveTagsAtom,
  clearAIArchiveAtom,
  deleteAIArchiveEntryAtom,
  filteredAndSortedEntriesAtom,
  selectedAIEntryAtom,
  selectedAIEntryIdAtom,
  updateAIArchiveEntryAtom,
  updateAIEntryTagsAtom,
} from './aiArchive';

export type { ModalState } from './app';
export {
  activeViewAtom,
  currentModalTypeAtom,
  getInitialActiveView,
  isModalOpenAtom,
  isValidView,
  modalAtom,
  profileReturnViewAtom,
  selectedProfileAtom,
  selectItemAtom,
} from './app';
export { disconnectMyArchiveAtom, myArchiveProfileAtom } from './archive';
export {
  addToQueueAtom,
  clearPlaylistAtom,
  currentTrackAtom,
  currentTrackIndexAtom,
  isPlayingAtom,
  nextTrackAtom,
  playItemAtom,
  playlistAtom,
  prevTrackAtom,
  removeFromPlaylistAtom,
  togglePlayPauseAtom,
} from './audioPlayer';
export type { DownloadItem, DownloadStatus } from './downloads';
export {
  activeDownloadCountAtom,
  addDownloadAtom,
  clearCompletedDownloadsAtom,
  downloadManagerOpenAtom,
  downloadQueueAtom,
  removeDownloadAtom,
  updateDownloadProgressAtom,
} from './downloads';
// These atoms have dependencies on other store files
export {
  addItemsToCollectionAtom,
  addLibraryItemAtom,
  addTagsToItemsAtom,
  addUploaderFavoriteAtom,
  allTagsAtom,
  clearLibraryAtom,
  createCollectionAtom,
  deleteCollectionAtom,
  libraryCountsAtom,
  libraryItemIdentifiersAtom,
  libraryItemsAtom,
  removeLibraryItemAtom,
  removeLibraryItemsAtom,
  removeUploaderFavoriteAtom,
  updateCollectionNameAtom,
  updateLibraryItemNotesAtom,
  updateLibraryItemTagsAtom,
  uploaderFavoriteSetAtom,
  uploaderFavoritesAtom,
  userCollectionsAtom,
} from './favorites';
export { languageAtom, loadableTranslationsAtom } from './i18n';
export { deferredPromptAtom, isAppInstalledAtom, waitingWorkerAtom } from './pwa';
export {
  addDocumentToWorksetAtom,
  clearScriptoriumAtom,
  createWorksetAtom,
  deleteWorksetAtom,
  removeDocumentFromWorksetAtom,
  selectedDocumentIdAtom,
  selectedWorksetIdAtom,
  updateDocumentNotesAtom,
  updateWorksetNameAtom,
  worksetsAtom,
} from './scriptorium';
export {
  addSearchHistoryAtom,
  clearSearchHistoryAtom,
  facetsAtom,
  profileSearchQueryAtom,
  searchHistoryAtom,
  searchQueryAtom,
  uploaderHubSearchQueryAtom,
} from './search';
export {
  accentColorAtom,
  autoArchiveAIAtom,
  autoplayMediaAtom,
  autoRunEntityExtractionAtom,
  defaultAiTabAtom,
  defaultDetailTabAllAtom,
  defaultSettings,
  defaultSortAtom,
  defaultUploaderDetailTabAtom,
  disableAnimationsAtom,
  enableAiFeaturesAtom,
  fontSizeAtom,
  highContrastModeAtom,
  layoutDensityAtom,
  openLinksInNewTabAtom,
  rememberFiltersAtom,
  rememberSortAtom,
  resetSettingsAtom,
  resolvedThemeAtom,
  resultsPerPageAtom,
  scrollbarColorAtom,
  setSettingAtom,
  settingsAtom,
  showExplorerHubAtom,
  summaryToneAtom,
  themeAtom,
  underlineLinksAtom,
} from './settings';
// Atoms with no dependencies are exported first.
export { toastAtom } from './toast';
