# Graph Report - Internet-Archive-Explorer  (2026-05-01)

## Corpus Check
- 198 files · ~76,852 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 458 nodes · 395 edges · 14 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 83 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 32|Community 32]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 25 edges
2. `error()` - 12 edges
3. `generateContentHelper()` - 11 edges
4. `generateContent()` - 10 edges
5. `searchArchive()` - 8 edges
6. `useInfiniteScroll()` - 7 edges
7. `generateInsightFromTitles()` - 7 edges
8. `fetchValidated()` - 7 edges
9. `useUploaderUploads()` - 6 edges
10. `getStoredOAuthTokenMeta()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `fetchWithTimeout()` --calls--> `generateContent()`  [INFERRED]
  utils/fetchWithTimeout.ts → services/geminiService.ts
- `fetchWithTimeout()` --calls--> `fetchWithRetry()`  [INFERRED]
  utils/fetchWithTimeout.ts → services/archiveService.ts
- `handleGenerate()` --calls--> `generateStory()`  [INFERRED]
  pages/StorytellerView.tsx → services/geminiService.ts
- `error()` --calls--> `handleAskFollowUp()`  [INFERRED]
  pages/ForYouView.tsx → components/ImageDetailModal.tsx
- `error()` --calls--> `componentDidCatch()`  [INFERRED]
  pages/ForYouView.tsx → components/ErrorBoundary.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (23): AILoadingIndicator(), getMessageKeys(), ArchivalCarousel(), BookReaderModal(), CollectionCarousel(), ConfirmationModal(), EmulatorModal(), BulkActionsToolbar() (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (17): ArchiveServiceError, delay(), fetchRawJson(), fetchValidated(), fetchWithRetry(), getItemCount(), getItemMetadata(), getItemPlainText() (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.16
Nodes (23): analyzeImage(), answerFromText(), askAboutImage(), extractEntities(), extractJson(), GeminiServiceError, generateContent(), generateContentHelper() (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (9): getProfileApiQuery(), buildArchiveQuery(), UploaderDetailView(), getUploaderUrl(), useDebounce(), useExplorerSearch(), useUploaderStats(), useUploaderTabCounts() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (7): archiveAIGeneration(), handleSubmit(), fetchWithTimeout(), handleAnalyze(), handleAskFollowUp(), urlToBase64(), handleGenerate()

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (9): handleError(), exportAllData(), importData(), componentDidCatch(), error(), fetchGameList(), getApiKey(), handleFindGames() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.2
Nodes (4): EntitySection(), CategoryGrid(), OnThisDay(), useSearchAndGo()

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (4): handleFullscreen(), catch(), SettingRow(), useToast()

### Community 8 - "Community 8"
Cohesion: 0.57
Nodes (7): clearStoredOAuthToken(), getLocalStorage(), getSessionStorage(), getStoredOAuthTokenMeta(), getValidAccessToken(), isValid(), setStoredOAuthToken()

### Community 10 - "Community 10"
Cohesion: 0.47
Nodes (3): closeModal(), handleCreatorSelect(), handleUploaderSelect()

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (2): base64UrlEncode(), createCodeChallenge()

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (2): getMediaTypeIconPath(), handleImageError()

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (2): HelpSearchBar(), useHelpViewContext()

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (2): handleDismiss(), handleInstall()

## Knowledge Gaps
- **Thin community `Community 12`** (5 nodes): `useGeminiAuth.ts`, `base64UrlEncode()`, `createCodeChallenge()`, `createCodeVerifier()`, `useGeminiAuth()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (5 nodes): `ItemCard.tsx`, `getCreator()`, `getMediaTypeIconPath()`, `handleFavoriteClick()`, `handleImageError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (4 nodes): `HelpSearchBar.tsx`, `HelpViewContext.tsx`, `HelpSearchBar()`, `useHelpViewContext()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (3 nodes): `InstallBanner.tsx`, `handleDismiss()`, `handleInstall()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Community 0` to `Community 3`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `error()` connect `Community 5` to `Community 1`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `SettingRow()` connect `Community 7` to `Community 0`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `useLanguage()` (e.g. with `UploaderDetailView()` and `SettingRow()`) actually correct?**
  _`useLanguage()` has 24 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `error()` (e.g. with `fetchHeroImages()` and `fetchData()`) actually correct?**
  _`error()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `generateContent()` (e.g. with `handleFindGames()` and `getValidAccessToken()`) actually correct?**
  _`generateContent()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `searchArchive()` (e.g. with `fetchHeroImages()` and `fetchData()`) actually correct?**
  _`searchArchive()` has 5 INFERRED edges - model-reasoned connections that need verification._