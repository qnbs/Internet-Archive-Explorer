# Graph Report - Internet-Archive-Explorer  (2026-05-01)

## Corpus Check
- 196 files · ~76,531 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 450 nodes · 384 edges · 15 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 84 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 23 edges
2. `error()` - 12 edges
3. `generateContentHelper()` - 11 edges
4. `generateContent()` - 10 edges
5. `searchArchive()` - 8 edges
6. `useInfiniteScroll()` - 7 edges
7. `generateInsightFromTitles()` - 7 edges
8. `useUploaderUploads()` - 6 edges
9. `getStoredOAuthTokenMeta()` - 6 edges
10. `useExplorerSearch()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `fetchWithTimeout()` --calls--> `fetchWithRetry()`  [INFERRED]
  utils/fetchWithTimeout.ts → services/archiveService.ts
- `error()` --calls--> `handleAskFollowUp()`  [INFERRED]
  pages/ForYouView.tsx → components/ImageDetailModal.tsx
- `error()` --calls--> `componentDidCatch()`  [INFERRED]
  pages/ForYouView.tsx → components/ErrorBoundary.tsx
- `error()` --calls--> `handleError()`  [INFERRED]
  pages/ForYouView.tsx → components/audiothek/AudioPlayer.tsx
- `error()` --calls--> `exportAllData()`  [INFERRED]
  pages/ForYouView.tsx → services/dataService.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (22): AILoadingIndicator(), getMessageKeys(), ArchivalCarousel(), BookReaderModal(), CollectionCarousel(), ConfirmationModal(), EmulatorModal(), BulkActionsToolbar() (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (28): archiveAIGeneration(), handleSubmit(), fetchWithTimeout(), analyzeImage(), answerFromText(), askAboutImage(), extractEntities(), extractJson() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (15): apiFetch(), ArchiveServiceError, delay(), fetchWithRetry(), getItemCount(), getItemMetadata(), getItemPlainText(), getReviewsByUploader() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (9): getProfileApiQuery(), buildArchiveQuery(), UploaderDetailView(), getUploaderUrl(), useDebounce(), useExplorerSearch(), useUploaderStats(), useUploaderTabCounts() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (7): AppContent(), ToastBridge(), handleFullscreen(), catch(), SettingRow(), useToast(), useNavigation()

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (9): handleError(), exportAllData(), importData(), componentDidCatch(), error(), fetchGameList(), getApiKey(), handleFindGames() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.2
Nodes (4): EntitySection(), CategoryGrid(), OnThisDay(), useSearchAndGo()

### Community 7 - "Community 7"
Cohesion: 0.57
Nodes (7): clearStoredOAuthToken(), getLocalStorage(), getSessionStorage(), getStoredOAuthTokenMeta(), getValidAccessToken(), isValid(), setStoredOAuthToken()

### Community 8 - "Community 8"
Cohesion: 0.47
Nodes (3): closeModal(), handleCreatorSelect(), handleUploaderSelect()

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (2): base64UrlEncode(), createCodeChallenge()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (2): getMediaTypeIconPath(), handleImageError()

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (2): isImageRequest(), timeoutFetch()

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (2): ScriptoriumView(), useWorksets()

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (2): HelpSearchBar(), useHelpViewContext()

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (2): handleDismiss(), handleInstall()

## Knowledge Gaps
- **Thin community `Community 10`** (5 nodes): `useGeminiAuth.ts`, `base64UrlEncode()`, `createCodeChallenge()`, `createCodeVerifier()`, `useGeminiAuth()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (5 nodes): `ItemCard.tsx`, `getCreator()`, `getMediaTypeIconPath()`, `handleFavoriteClick()`, `handleImageError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (4 nodes): `sw.js`, `isImageRequest()`, `sw.js`, `timeoutFetch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (4 nodes): `useWorksets.ts`, `ScriptoriumView.tsx`, `ScriptoriumView()`, `useWorksets()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (4 nodes): `HelpSearchBar.tsx`, `HelpViewContext.tsx`, `HelpSearchBar()`, `useHelpViewContext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (3 nodes): `InstallBanner.tsx`, `handleDismiss()`, `handleInstall()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Community 0` to `Community 3`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `error()` connect `Community 5` to `Community 1`, `Community 2`, `Community 4`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `SettingRow()` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `useLanguage()` (e.g. with `SettingRow()` and `useExplorerSearch()`) actually correct?**
  _`useLanguage()` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `error()` (e.g. with `fetchHeroImages()` and `fetchData()`) actually correct?**
  _`error()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `generateContent()` (e.g. with `handleFindGames()` and `getValidAccessToken()`) actually correct?**
  _`generateContent()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `searchArchive()` (e.g. with `fetchHeroImages()` and `fetchData()`) actually correct?**
  _`searchArchive()` has 5 INFERRED edges - model-reasoned connections that need verification._