# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Phase 3b navigation:** `settingsFocusSectionAtom` — one-shot Settings focus (e.g. GeminiKeyPrompt → AI section)
- **Tests:** `tests/unit/settingsNavigation.test.ts`
- **Phase 3 resilience:** `HubErrorBoundary` for inline hub recovery; i18n `ErrorBoundaryFallback`; `GeminiKeyPrompt` CTA across AI surfaces
- **Utils:** `formatGeminiError()` for consistent Gemini error messages in UI
- **BYOK (Gemini):** `services/geminiApiKeyStorage.ts`, Jotai `geminiApiKeyAtom`, accessible Settings UI with i18n (EN/DE), legacy localStorage migration
- **Tests:** `tests/unit/geminiApiKeyStorage.test.ts`
- **CI artifacts:** Coverage HTML, Playwright report, Lighthouse, bundle report uploads; `concurrency` cancel-in-progress

### Changed

- **App:** Per-view `HubErrorBoundary` (`key={activeView}`) — hub errors no longer block other views
- **GeminiKeyPrompt:** Opens Settings with AI section pre-selected via focus atom
- **Gemini service:** `generateContentHelper` preserves `GeminiServiceError`; maps rate limit, quota, network to i18n keys
- **ErrorBoundary:** Retry without full reload; bilingual fallback copy (EN/DE)
- **AI components:** AIToolsTab, AIInsightPanel, MagicOrganizeModal, AskAIModal show BYOK prompt when no key
- **Gemini:** Production AI flows use runtime BYOK only; `VITE_API_KEY` relegated to optional dev fallback (`VITE_ALLOW_BUILD_TIME_GEMINI_KEY=true`)
- **CI:** Unit tests run with coverage thresholds; Playwright HTML/JSON reporters; cloud-first policy documented in README/AGENTS/CONTRIBUTING
- **Docs:** README, `.env.example`, DEPLOYMENT — BYOK-first security model

### Fixed

- **Vercel workflow (main):** Secrets-Gate über Step-Output statt `if: secrets.*` (Actions-Validierungsfehler)
- **Pages Smoke:** Prüft PWA `./manifest.json` statt nicht existierendem Vite-`assets/manifest-*.json`
- **PWA cache:** Service Worker `CACHE_VERSION` **v8** nach Deploy-Housekeeping

### Added

- **AGENTS.md:** Konsolidierte Cursor-Cloud-Agent-Anleitung (Dev-Server, CI-Gate, esbuild, Smoke)
- **Coverage:** `@vitest/coverage-v8`, `pnpm run test:unit:coverage`, thresholds in `vitest.config.ts`
- **Tests:** `tests/unit/logger.test.ts`

### Changed

- **Biome:** `useExhaustiveDependencies` upgraded from warn to **error** (tests still exempt)
- **CI / Pages smoke:** Verify `dist/icons/*`, manifest PNG references; live smoke for manifest + icons
- **PWA:** `sw-register.js` unregisters all SW on dev/preview hosts; disables on `*.vercel.app`
- **Docs:** README/CONTRIBUTING deployment sections; agent quality gates in `.cursor/rules/`

### Fixed

- **Security / CI audit:** `pnpm audit --audit-level=moderate` grün — Vitest **4.1+**, `pnpm.overrides` für gepatchtes `protobufjs` und `ws`
- **Dependencies:** `jotai`, `@google/genai` und **`uuid`** in **production** `dependencies` (Runtime-PWA-Bundle korrekt klassifiziert)
- **a11y / axe E2E (Juni 2026):** Kontrast Uploader Hub, For You, Web Archive, ContentCarousel; `prefers-reduced-motion` in axe-Tests; keine inline `opacity: 0` auf animierten Karten
- **CI / axe E2E:** Kontrast u. a. auf Scriptorium-Hub, AI Archive (Leerzustand), My Archive (Connect), SideMenu-Navigation und Command Palette — verhindert **serious color-contrast** bei allen in `a11y.spec.ts` auditierten Hubs unter Production-`vite preview`
- **Dependabot:** Konfiguration unter **`.github/dependabot.yml`** (frühere `.github/workflows/dependabot.yml` verursachte unnötige Workflow-Fehler ohne Jobs)

### Added

- **PWA assets:** Lokale PNG-Icons und Screenshots unter `public/icons/` und `public/screenshots/`; Generator `scripts/generate-pwa-assets.mjs` (`pnpm run generate:pwa-assets`)
- **Tests:** `tests/unit/archiveSchemas.test.ts` — Zod-Schema-Regressionen für Archive-, Wayback- und Gemini-Payloads
- **SEO:** JSON-LD `featureList` / `hasPart`; Open Graph mit lokalem `icon-512.png`

### Changed

- **Lighthouse CI:** Accessibility-Mindestscore **0.95** (`lighthouserc.json`)
- **Manifest:** Primär lokale PNG-Icons/Screenshots statt Remote-URLs

- **Uploader Hub:** **nested-interactive** (Profilkarte: keine `article role="button"` mit Kind-Buttons) und **Kontrast** (Sidebar-Überschriften/Chips hell/dunkel lesbar)
- **Live-Demo / IA-Fetches:** Service Worker (`public/sw.js`) nutzte für JSON/API nur **15 s** Netzwerk-Timeout — langsamer als typische `advancedsearch`/`metadata`-Antworten → künstliche Abbrüche und 503-Offline-JSON; **API-Timeout 30 s**, Cache `v7`; `archiveService` **32 s** Client-Timeout; `fetchWithRetry` mit **408**-Retry und **`Retry-After`** bei **429**; TanStack **kein Retry** bei `ArchiveServiceError` mit `retryable: false` (Validierung/4xx)
- **Download-Trim:** Schleifenbedingung `length > cap` statt `>=` (kein Über-Trimmen bei voller Queue)
- Help Center: Platzhalter-Text „Thema wählen“ nutzt **`text-gray-600 dark:text-gray-300`** statt `text-gray-400` — **WCAG-2.2-Kontrast** (axe `color-contrast` bei `CI=true` / `vite preview`)
- Deep-Link `?view=` blieb unter **React Strict Mode** nicht erhalten: Nach `replaceState` (Query entfernt) setzte der zweite Effect-Lauf die Ansicht wieder auf die gespeicherte Standard-View — **`activeViewAtom`** nutzt jetzt **`getInitialActiveView()`** (URL vor `localStorage`), der URL-Effekt in **`App.tsx`** räumt nur noch die Adresszeile auf; Smoke-Test „Uploader-Hub zeigt Beitragende“ stabil

### Changed

- 📄 **README**: GitHub Pages **Source = GitHub Actions** dokumentiert; lokales CI-Gate; `.github/workflows/pages-smoke.yml` mit Diagnose, wenn Live-HTML `./index.tsx` enthält
- 📚 **AUDIT.md**, **README.md**, **CONTRIBUTING.md**: Stack (Vite 8, TypeScript 6), CI-Parität (`ANALYZE=true` vor Bundle-Check und E2E), Backlog vs. erledigt (SW-LRU, Deep-Link, CONTRIBUTING)
- ♿ E2E `a11y.spec.ts`: zusätzlich **Storyteller** + **Help** (nach Landmark-Fix); verschachteltes `<main>` in `HelpContent` → `section role="region"` + i18n `help:contentRegion`
- 🧪 Unit-Tests konsolidiert unter `tests/unit/` (Vitest nur noch dieses Verzeichnis); `tsconfig` schließt `vitest.config.ts` vom `tsc`-Check aus (Vite-8-/Vitest-Plugin-Typkonflikt)
- 🧹 Biome: Konfiguration erweitert (Ignores für Artefakte, Test-Override, `lint:ci`/`check`-Scripts), Hook-Warnungen bereinigt, CI nutzt `biome ci`
- 🛠️ Fixed Cursor Pro+ index issue: CLAUDE.md wieder sichtbar + auf aktuellem pnpm/Cursor-Stand gebracht
- 🧩 Cursor Pro+ Integration: .vscode/settings.json optimiert, ESLint-Konflikte eliminiert, Biome als perfekter Drop-in-Ersatz für bisherige ESLint-Experience
- 🔒 Security-Hardening: pnpm audit fix + CI fails on moderate+ vulnerabilities + optimierter pnpm cache in GitHub Actions
- 🔄 Migriert von npm zu pnpm (schnellere Installs, bessere CI, weniger Disk Usage)
- Optimized Vite build with vendor/ui/query chunk splitting for better caching
- Removed unused `loadEnv` call in vite.config.js
- Fixed empty root locale files (`de.json`, `en.json`) to contain valid JSON
- DevContainer: reduced Docker image by ~200MB (removed WebKit/Firefox/GStreamer deps)
- DevContainer: `postCreate.sh` uses `pnpm install --frozen-lockfile` for reproducibility
- DevContainer: only installs Playwright Chromium (the only browser used in tests)
- Playwright config: added explicit `projects` block with chromium device

### Added

- **Download-Queue-Limit** (`DOWNLOAD_QUEUE_MAX_ITEMS`, Standard 120) mit Trim vor neuen Einträgen; Unit-Tests `tests/unit/downloads.test.ts`
- **PWA:** `public/manifest.json` mit zusätzlichen **`screenshots`** (Wide); Build prüft `dist/manifest.json` in CI
- **Lighthouse CI:** `lighthouserc.json` + Schritt in `.github/workflows/ci.yml` (`@lhci/cli` nach E2E)
- ♿ **E2E `a11y.spec.ts`:** weitere Hub-Routen (Uploader, For You, Scriptorium, Web Archive, AI Archive, My Archive)
- **Cursor:** `.cursor/rules/internet-archive-explorer.mdc` (`alwaysApply`) für Repo-weite Agent-Hinweise
- 🙈 `.gitignore`: `graphify-out/cache/` (nur CLI-Cache; keine großen JSON-Blobs committen)
- 🧪 Vitest-Suite in `tests/unit/`: `sanitizeHtml`, `fetchWithTimeout`, `fetchWithRetry`, `useDebounce`, `safeJotaiSyncStorage`, `archiveService` (Fetch-Mock, Zod-Retries, Metadata-Cache), `useLanguage` (Jotai-Store + Übersetzungs-Mock)
- 📱 PWA perfektioniert (Cache-Limits, Offline-First, verbesserter Update-Flow)
- ♿ E2E `a11y.spec.ts`: `prefers-reduced-motion` + stabilere Kontrast-Fixes (Uploader Hub, For You, Web Archive, ContentCarousel)
- 🛡️ Zod-Schemas hinzugefügt für archiveService + geminiService (Runtime-Validation, Type-Safety, Error-Handling)
- Comprehensive project audit documentation (`AUDIT.md`)
- This changelog file
- Expanded Copilot instructions with architecture docs, patterns, and guidelines

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

[Unreleased]: https://github.com/qnbs/Internet-Archive-Explorer/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/qnbs/Internet-Archive-Explorer/releases/tag/v1.0.0
