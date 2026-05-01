# Graph Report - Internet-Archive-Explorer  (2026-05-01)

## Corpus Check
- 203 files · ~77,958 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 482 nodes · 429 edges · 15 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 32|Community 32]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 26 edges
2. `error()` - 12 edges
3. `generateContent()` - 11 edges
4. `generateContentHelper()` - 11 edges
5. `fetchValidated()` - 8 edges
6. `searchArchive()` - 8 edges
7. `safeParse()` - 7 edges
8. `useInfiniteScroll()` - 7 edges
9. `generateInsightFromTitles()` - 7 edges
10. `useUploaderUploads()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `fetchWithTimeout()` --calls--> `fetchWithRetry()`  [INFERRED]
  utils/fetchWithTimeout.ts → services/archiveService.ts
- `parseAiJson()` --calls--> `safeParse()`  [INFERRED]
  services/geminiService.ts → utils/offlineHubCache.ts
- `generateContent()` --calls--> `safeParse()`  [INFERRED]
  services/geminiService.ts → utils/offlineHubCache.ts
- `error()` --calls--> `handleAskFollowUp()`  [INFERRED]
  pages/ForYouView.tsx → components/ImageDetailModal.tsx
- `error()` --calls--> `componentDidCatch()`  [INFERRED]
  pages/ForYouView.tsx → components/ErrorBoundary.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (23): AILoadingIndicator(), getMessageKeys(), ArchivalCarousel(), BookReaderModal(), CollectionCarousel(), ConfirmationModal(), EmulatorModal(), BulkActionsToolbar() (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (30): archiveAIGeneration(), handleSubmit(), fetchWithTimeout(), analyzeImage(), answerFromText(), askAboutImage(), extractEntities(), extractJson() (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (18): ArchiveServiceError, delay(), fetchRawJson(), fetchValidated(), fetchWithRetry(), getItemCount(), getItemMetadata(), getItemPlainText() (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (9): getProfileApiQuery(), buildArchiveQuery(), UploaderDetailView(), getUploaderUrl(), useDebounce(), useExplorerSearch(), useUploaderStats(), useUploaderTabCounts() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (9): handleError(), exportAllData(), importData(), componentDidCatch(), error(), fetchGameList(), getApiKey(), handleFindGames() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (6): handleFullscreen(), PwaWorkerBridge(), catch(), SettingRow(), useToast(), useLibraryBackgroundSync()

### Community 6 - "Community 6"
Cohesion: 0.23
Nodes (6): enforceBudgetsAfterPut(), evictGlobalLRU(), evictLRUFromCache(), measureResponseBytes(), putInCache(), touch()

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (4): EntitySection(), CategoryGrid(), OnThisDay(), useSearchAndGo()

### Community 8 - "Community 8"
Cohesion: 0.57
Nodes (7): clearStoredOAuthToken(), getLocalStorage(), getSessionStorage(), getStoredOAuthTokenMeta(), getValidAccessToken(), isValid(), setStoredOAuthToken()

### Community 10 - "Community 10"
Cohesion: 0.47
Nodes (3): closeModal(), handleCreatorSelect(), handleUploaderSelect()

### Community 12 - "Community 12"
Cohesion: 0.4
Nodes (2): findAndPrepareTrack(), findPlayableAudioFile()

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (2): base64UrlEncode(), createCodeChallenge()

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (2): getMediaTypeIconPath(), handleImageError()

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (2): HelpSearchBar(), useHelpViewContext()

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (2): handleDismiss(), handleInstall()

## Knowledge Gaps
- **Thin community `Community 12`** (5 nodes): `findAndPrepareTrack()`, `findPlayableAudioFile()`, `formatTime()`, `audioPlayer.ts`, `audioUtils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (5 nodes): `useGeminiAuth.ts`, `base64UrlEncode()`, `createCodeChallenge()`, `createCodeVerifier()`, `useGeminiAuth()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (5 nodes): `ItemCard.tsx`, `getCreator()`, `getMediaTypeIconPath()`, `handleFavoriteClick()`, `handleImageError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (4 nodes): `HelpSearchBar.tsx`, `HelpViewContext.tsx`, `HelpSearchBar()`, `useHelpViewContext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (3 nodes): `InstallBanner.tsx`, `handleDismiss()`, `handleInstall()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Community 0` to `Community 3`, `Community 5`, `Community 7`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `error()` connect `Community 4` to `Community 1`, `Community 2`, `Community 5`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `catch()` connect `Community 5` to `Community 4`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `useLanguage()` (e.g. with `UploaderDetailView()` and `SettingRow()`) actually correct?**
  _`useLanguage()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `error()` (e.g. with `fetchHeroImages()` and `fetchData()`) actually correct?**
  _`error()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `generateContent()` (e.g. with `handleFindGames()` and `getValidAccessToken()`) actually correct?**
  _`generateContent()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._