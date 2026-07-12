# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Dynamic PWA manifest:** `public/manifest.json` is now generated at build time from `public/manifest.template.json` using `VITE_BASE_PATH`. This makes the PWA scope, `start_url`, `id`, `share_target`, and shortcuts correct on both GitHub Pages (`/Internet-Archive-Explorer/`) and Vercel (`/`).
- **Build-time manifest script:** `scripts/generate-pwa-assets.mjs` now also generates the manifest and normalizes the base path (leading slash, trailing slash).

### Changed

- **Dependency cleanup:** Removed unused `@tailwindcss/postcss` v4 package; the project remains on Tailwind CSS v3 with the existing custom theme configuration.

### Fixed

- **PWA manifest base path:** Eliminated hardcoded `/Internet-Archive-Explorer/` paths from the manifest source so the Vercel root deploy is no longer scoped incorrectly.
- **Asset generation script:** Replaced non-existent `createDeflateSync` import with `deflateSync` in `scripts/generate-pwa-assets.mjs`, fixing local PNG generation on Node.js 24+.

## [1.3.0] - 2026-07-12

### Added

- **Deployment pruning:** `.github/workflows/prune-deployments.yml` for manual cleanup and automatic post-deploy pruning in `.github/workflows/deploy-pages.yml`. Keeps the last 3 GitHub deployments and removes inactive older entries.
- **Thumbnail utility:** `utils/imageUtils.ts` now exports `getArchiveThumbnailUrl(identifier)` which prefers the stable `__ia_thumb.jpg` file and falls back to `archive.org/services/get-item-image.php`.

### Changed

- **Thumbnail strategy:** Core cards (`CarouselItemCard`, `ItemCard`, `RecRoomItemCard`, `AudioCard`, `AudioPlayer`, `PlaylistPanel`, library/favorites/AI-archive cards, `ItemDetailSidebar`) now load `__ia_thumb.jpg` first to reduce Opaque Response Blocking (ORB) failures on cross-origin image requests.
- **pnpm configuration:** Dependency overrides moved from `package.json` to `pnpm-workspace.yaml` because pnpm v10+ no longer reads the `pnpm` field in `package.json`. All existing overrides (`protobufjs`, `ws`, `esbuild`, `@babel/core`, `rimraf`, `glob`, `inflight`) are preserved.

### Fixed

- **Stale app shell:** Bumped service worker `CACHE_VERSION` to **v10** so GitHub Pages clients receive the new app shell and bundled chunks instead of stale `index.html` referencing deleted chunks.
- **Live demo content fetch:** Rec Room, Settings, and other dynamic views now load correctly after the stale-cache bust.
- **Audiothek accessibility:** `AudioCard` text now uses `text-gray-900 dark:text-white` and `text-gray-600 dark:text-gray-400`, fixing serious `color-contrast` axe violations in light mode.
- **Deployment pruning reliability:** Pruning deactivates deployments before deletion and tolerates 404s from concurrent cleanup runs.

## [1.2.0] - 2026-07-12

### Added

- **Fetching resilience:** `utils/fetchWithRetry.ts` now uses exponential backoff with jitter, higher default backoff (1s), and a 60s cap for `Retry-After` handling.
- **Concurrency cap:** `utils/requestQueue.ts` limits in-flight archive.org requests; `hooks/useUploaderStats.ts` batches count queries.
- **TanStack Query resilience:** IA query defaults now use `retry: 0` because the service layer already retries.
- **Toast bridge:** `resolveToastMessage()`; `toastAtom` supports `i18nKey` for store-layer toasts.
- **i18n:** `common:skipToMain`; Scriptorium/Audiothek toast keys; `settings:languageUpdated`.
- **Tests:** `tests/unit/resolveToastMessage.test.ts`.
- **Phase 3b navigation:** `settingsFocusSectionAtom` — one-shot Settings focus (e.g. GeminiKeyPrompt → AI section).
- **Tests:** `tests/unit/settingsNavigation.test.ts`.
- **Phase 3 resilience:** `HubErrorBoundary` for inline hub recovery; i18n `ErrorBoundaryFallback`; `GeminiKeyPrompt` CTA across AI surfaces.
- **Utils:** `formatGeminiError()` for consistent Gemini error messages in UI.
- **BYOK (Gemini):** `services/geminiApiKeyStorage.ts`, Jotai `geminiApiKeyAtom`, accessible Settings UI with i18n (EN/DE), legacy localStorage migration.
- **Tests:** `tests/unit/geminiApiKeyStorage.test.ts`.
- **CI artifacts:** Coverage HTML, Playwright report, Lighthouse, bundle report uploads; `concurrency` cancel-in-progress.

### Changed

- **Toast:** Library/Explorer/Scriptorium components use `useToast()` directly; Jotai stores use i18n keys via `toastAtom`.
- **Skip-link:** Localized via `common:skipToMain` (EN/DE).
- **App:** Per-view `HubErrorBoundary` (`key={activeView}`) — hub errors no longer block other views.
- **GeminiKeyPrompt:** Opens Settings with AI section pre-selected via focus atom.
- **Gemini service:** `generateContentHelper` preserves `GeminiServiceError`; maps rate limit, quota, network to i18n keys.
- **ErrorBoundary:** Retry without full reload; bilingual fallback copy (EN/DE).
- **AI components:** AIToolsTab, AIInsightPanel, MagicOrganizeModal, AskAIModal show BYOK prompt when no key.
- **Gemini:** Production AI flows use runtime BYOK only; `VITE_API_KEY` relegated to optional dev fallback (`VITE_ALLOW_BUILD_TIME_GEMINI_KEY=true`).
- **CI:** Unit tests run with coverage thresholds; Playwright HTML/JSON reporters; cloud-first policy documented in README/AGENTS/CONTRIBUTING.
- **Docs:** README, `.env.example`, DEPLOYMENT — BYOK-first security model.

### Fixed

- **Vercel workflow (main):** Secrets gate via step output instead of `if: secrets.*` (Actions validation error).
- **Pages Smoke:** Checks PWA `./manifest.json` instead of the non-existent Vite `assets/manifest-*.json`.
- **PWA cache:** Service Worker `CACHE_VERSION` **v9** after fetching-resilience deploy.

## [1.1.0] - 2026-07-12

### Added

- **AGENTS.md:** Consolidated Cursor Cloud agent guide (dev server, CI gate, esbuild, smoke).
- **Coverage:** `@vitest/coverage-v8`, `pnpm run test:unit:coverage`, thresholds in `vitest.config.ts`.
- **Tests:** `tests/unit/logger.test.ts`.

### Changed

- **Biome:** `useExhaustiveDependencies` upgraded from warn to **error** (tests still exempt).
- **CI / Pages smoke:** Verify `dist/icons/*`, manifest PNG references; live smoke for manifest + icons.
- **PWA:** `sw-register.js` unregisters all SW on dev/preview hosts; disables on `*.vercel.app`.
- **Docs:** README/CONTRIBUTING deployment sections; agent quality gates in `.cursor/rules/`.

### Fixed

- **Security / CI audit:** `pnpm audit --audit-level=moderate` green — Vitest **≥4.1**, pnpm overrides for patched `protobufjs` **≥7.5.8** and `ws` **≥8.20.1**.
- **Dependencies:** `jotai`, `@google/genai`, and **`uuid`** moved to **production** `dependencies` (runtime PWA bundle correctly classified).
- **a11y / axe E2E (June 2026):** Contrast on Uploader Hub, For You, Web Archive, ContentCarousel; `prefers-reduced-motion` in axe tests; no inline `opacity: 0` on animated cards.
- **CI / axe E2E:** Contrast fixes on Scriptorium Hub, AI Archive (empty state), My Archive (Connect), SideMenu navigation, and Command Palette rows — prevents **serious color-contrast** issues on all hubs audited in `a11y.spec.ts` under production `vite preview`.
- **Dependabot:** Configuration moved to **`.github/dependabot.yml`** (previously `.github/workflows/dependabot.yml`, which caused unnecessary workflow failures).

## [1.0.2] - 2026-06-15

### Added

- **PWA assets:** Local PNG icons and screenshots under `public/icons/` and `public/screenshots/`; generator `scripts/generate-pwa-assets.mjs` (`pnpm run generate:pwa-assets`).
- **Tests:** `tests/unit/archiveSchemas.test.ts` — Zod schema regression tests for Archive, Wayback, and Gemini payloads.
- **SEO:** JSON-LD `featureList` / `hasPart`; Open Graph with local `icon-512.png`.

### Changed

- **Lighthouse CI:** Accessibility minimum score **0.95** (`lighthouserc.json`).
- **Manifest:** Primary local PNG icons/screenshots instead of remote URLs.
- **Uploader Hub:** Fixed **nested-interactive** (profile card: no `article role="button"` with child buttons) and **contrast** (sidebar headings/chips readable in light/dark).
- **Live demo / IA fetches:** Service Worker (`public/sw.js`) previously used only **15s** network timeout for JSON/API — slower than typical `advancedsearch`/`metadata` responses → artificial aborts and 503 offline JSON. Now **API timeout 30s**, cache `v7`; `archiveService` **32s** client timeout; `fetchWithRetry` with **408** retry and **`Retry-After`** on **429**; TanStack **no retry** for `ArchiveServiceError` with `retryable: false` (validation / 4xx).
- **Download trim:** Loop condition changed to `length > cap` instead of `>=` (no over-trimming when queue is full).
- **Help Center:** Placeholder text "Thema wählen" now uses **`text-gray-600 dark:text-gray-300`** instead of `text-gray-400` — **WCAG 2.2 contrast** (axe `color-contrast` with `CI=true` / `vite preview`).
- **Deep-link `?view=`:** Under React Strict Mode, the query parameter was not preserved: after `replaceState` (query removed), the second effect run reset the view to the stored default. Now **`activeViewAtom`** uses **`getInitialActiveView()`** (URL before `localStorage`), and the URL effect in **`App.tsx`** only cleans the address bar. Smoke test "Uploader Hub shows contributors" is stable.

## [1.0.1] - 2026-05-24

### Changed

- **README:** Documented GitHub Pages **Source = GitHub Actions**; local CI gate; `.github/workflows/pages-smoke.yml` with diagnostics when live HTML contains `./index.tsx`.
- **AUDIT.md, README.md, CONTRIBUTING.md:** Updated stack (Vite 8, TypeScript 6), CI parity (`ANALYZE=true` before bundle check and E2E), backlog vs. completed (SW LRU, Deep-Link, CONTRIBUTING).
- **E2E `a11y.spec.ts`:** Added **Storyteller** + **Help** (after landmark fix); nested `<main>` in `HelpContent` → `section role="region"` + i18n `help:contentRegion`.
- **Unit tests:** Consolidated under `tests/unit/` (Vitest only this directory); `tsconfig` excludes `vitest.config.ts` from `tsc` check (Vite 8 / Vitest plugin type conflict).
- **Biome:** Extended configuration (artifact ignores, test override, `lint:ci`/`check` scripts), cleaned up hook warnings, CI uses `biome ci`.
- **Cursor Pro+ index issue:** CLAUDE.md visible again + updated to current pnpm/Cursor state.
- **Cursor Pro+ integration:** `.vscode/settings.json` optimized, ESLint conflicts eliminated, Biome as a drop-in replacement for the previous ESLint experience.
- **Security hardening:** `pnpm audit fix` + CI fails on moderate+ vulnerabilities + optimized pnpm cache in GitHub Actions.
- **Package manager:** Migrated from npm to pnpm (faster installs, better CI, less disk usage).
- **Build:** Optimized Vite build with vendor/ui/query chunk splitting for better caching.
- **Cleanup:** Removed unused `loadEnv` call in `vite.config.js`.
- **Locales:** Fixed empty root locale files (`de.json`, `en.json`) to contain valid JSON.
- **DevContainer:** Reduced Docker image by ~200MB (removed WebKit/Firefox/GStreamer deps).
- **DevContainer:** `postCreate.sh` uses `pnpm install --frozen-lockfile` for reproducibility.
- **DevContainer:** Only installs Playwright Chromium (the only browser used in tests).
- **Playwright config:** Added explicit `projects` block with chromium device.

### Added

- **Download queue limit** (`DOWNLOAD_QUEUE_MAX_ITEMS`, default 120) with trim before new entries; unit tests `tests/unit/downloads.test.ts`.
- **PWA:** `public/manifest.json` with additional **`screenshots`** (wide); build checks `dist/manifest.json` in CI.
- **Lighthouse CI:** `lighthouserc.json` + step in `.github/workflows/ci.yml` (`@lhci/cli` after E2E).
- **Cursor:** `.cursor/rules/internet-archive-explorer.mdc` (`alwaysApply`) for repo-wide agent hints.
- **Gitignore:** `graphify-out/cache/` (only CLI cache; no large JSON blobs committed).
- **Vitest suite in `tests/unit/`:** `sanitizeHtml`, `fetchWithTimeout`, `fetchWithRetry`, `useDebounce`, `safeJotaiSyncStorage`, `archiveService` (fetch mock, Zod retries, metadata cache), `useLanguage` (Jotai store + translation mock).
- **PWA perfected:** Cache limits, offline-first behavior, improved update flow.
- **WCAG 2.2 AA compliance:** Focus-visible, target size 24×24, aria-live/busy, forced colors.
- **Zod schemas:** Added for archiveService + geminiService (runtime validation, type safety, error handling).
- **Comprehensive project audit documentation (`AUDIT.md`).**
- **This changelog file.**
- **Expanded Copilot instructions** with architecture docs, patterns, and guidelines.

## [1.0.0] - 2026-04-14

### Added

- React 19 + TypeScript 5 + Vite 7 foundation
- Progressive Web App (PWA) with service worker and offline support
- Bilingual interface (English / German) with 34 i18n namespace files per language
- **Explorer Hub** — global search with filters, trending items, and AI daily insights
- **Videothek** — curated film collections with hero section and carousels
- **Audiothek** — audio hub with player, playlists, and category grid
- **Images Hub** — curated image galleries with detail modal and zoom/rotate viewer
- **Rec Room** — retro game browser with emulator modal and game finder
- **Scriptorium** — document workspace with PDF/text viewer, AI analysis, and search/replace
- **Storyteller** — AI-powered story generation from archive items
- **Web Archive** — Wayback Machine URL lookup with snapshot history
- **My Archive** — personal profile connection with upload browsing
- **For You** — personalized recommendations based on library activity
- **AI Archive** — history of all AI-generated content with filtering and detail view
- **Uploader Hub** — browse and discover archive uploaders with profile pages
- **Library** — personal favorites, tags, collections, notes, drag-to-reorder, bulk actions
- **Help Center** — searchable documentation with category sidebar
- **Settings** — theme (light/dark/sepia/system), density, font size, accessibility, data export/import
- Command palette (Ctrl+K) with navigation, sharing, and AI commands
- Jotai-based state management with 14 atom stores and safe localStorage persistence
- TanStack Query v5 for all data fetching with infinite scroll support
- Framer Motion animations throughout the UI
- Tailwind CSS with Internet Archive color palette and glass morphism effects
- DOMPurify-based HTML sanitization for XSS protection
- Content Security Policy (CSP) in index.html
- OAuth 2.0 with PKCE for Google authentication
- Gemini AI integration (API key + OAuth) for insights, analysis, and content generation
- Playwright E2E tests with axe-core accessibility audits (WCAG 2.1 AA)
- CI/CD with GitHub Actions (build verification, E2E tests, GitHub Pages deployment)
- Responsive design with mobile bottom navigation and desktop sidebar

### Security

- Content Security Policy headers configured
- OAuth Authorization Code + PKCE flow (no client secret in frontend)
- DOMPurify sanitization for all user-generated HTML content
- Session-scoped token storage with expiration validation
- No hardcoded secrets in source code

[Unreleased]: https://github.com/qnbs/Internet-Archive-Explorer/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/qnbs/Internet-Archive-Explorer/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/qnbs/Internet-Archive-Explorer/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/qnbs/Internet-Archive-Explorer/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/qnbs/Internet-Archive-Explorer/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/qnbs/Internet-Archive-Explorer/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/qnbs/Internet-Archive-Explorer/releases/tag/v1.0.0
