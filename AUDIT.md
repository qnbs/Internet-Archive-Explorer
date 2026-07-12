# Audit Report — Internet Archive Explorer

**Date:** 2026-04-14 · **Last reviewed:** 2026-07-12
**Scope:** Full application audit (architecture, code quality, security, performance, accessibility, testing, i18n, PWA, configuration)
**App Version:** 1.3.0
**Stack:** React 19 · TypeScript 6 · Vite 8 · Jotai 2 · Tailwind CSS 3 · Framer Motion 12 · TanStack Query v5 · Biome 2.4

---

## Executive Summary

Internet Archive Explorer is a well-architected, feature-rich PWA with 17 views, 100+ components, 14 Jotai atom stores, and 6 service modules. The codebase follows modern React patterns consistently. No critical runtime errors or security vulnerabilities were found. Unit coverage focuses on core utilities/services/hooks; E2E covers smoke + selected axe routes under CI (`vite preview`).

A July 2026 deep audit identified fetching resilience as the highest-priority improvement area. The app now includes exponential backoff with jitter, a per-host concurrency cap, and TanStack Query retry reduction for Internet Archive endpoints. A follow-up production cache fix (v1.3.0) bumped the service worker cache, introduced a thumbnail URL utility to reduce ORB failures, and added automatic GitHub deployment pruning.

**Overall Health: ✅ Good** — Production-ready with continuous improvement opportunities documented below.

---

## July 2026 Deep Audit — Fetching Resilience

| Area | Status | Details |
|------|--------|---------|
| **Retry backoff + jitter** | ✅ | `utils/fetchWithRetry.ts`: default 1s backoff, exponential doubling, ±30% jitter, 60s `Retry-After` cap |
| **Concurrency cap** | ✅ | `utils/requestQueue.ts` caps archive.org requests; `hooks/useUploaderStats.ts` batches count queries |
| **TanStack Query retry** | ✅ | IA query defaults set `retry: 0`; service layer remains the retry source of truth |
| **Validation logging** | ✅ | `archiveService.ts` logs Zod validation failures; `publicdate`/`mediatype`/`avg_rating` relaxed based on live data |
| **List caching** | 🔄 | IndexedDB metadata cache exists; search/hub list cache is the next planned improvement |
| **Offline feedback** | 🔄 | Service Worker returns 503 JSON when offline; explicit UI offline state is planned |

---

## Perfection Sprint June 2026 — Completion

| Area | Status | Details |
|------|--------|---------|
| **Dependencies** | ✅ | `jotai`, `@google/genai`, and `uuid` in production `dependencies` |
| **Security audit** | ✅ | `pnpm audit --audit-level=moderate` green: Vitest ≥4.1, `pnpm.overrides` for patched `protobufjs` ≥7.5.8 and `ws` ≥8.20.1 |
| **Zod / Services** | ✅ | `types/archiveSchemas.ts` + unit tests `tests/unit/archiveSchemas.test.ts`; Archive/Gemini services validated |
| **PWA Manifest** | ✅ | Local `public/icons/*.png` + `public/screenshots/*.png`; `scripts/generate-pwa-assets.mjs` |
| **SEO** | ✅ | `index.html`: `og:*` with local icon, JSON-LD `WebApplication` + `hasPart` / `featureList` |
| **Lighthouse CI** | ✅ | Accessibility threshold **0.95** in `lighthouserc.json` |
| **CI Gate** | ✅ | `lint:ci`, `check:i18n`, `tsc`, `test:unit`, `test:unit:coverage`, `ANALYZE=true build`, `check:bundle-size`, `CI=true test:e2e`, Pages Smoke green |
| **a11y E2E** | ✅ | Contrast on Uploader Hub / For You / Web Archive; `prefers-reduced-motion` in axe tests; no inline `opacity: 0` on cards |

**Remaining (non-blocking):** Real marketing screenshots instead of generated placeholders; split `types.ts`; manual screenreader passes on all modals.

---

## Housekeeping Sprint June 2026 — Deployment & Toolchain

| Area | Status | Details |
|------|--------|---------|
| **Merge PR #4** | ✅ | Perfection Sprint on `main` |
| **Vercel** | ✅ | `vercel.json`, `vercel-deploy.yml` (runs on every push to `main` and on PRs), `docs/DEPLOYMENT.md` |
| **GitHub Pages** | ✅ | Smoke extended (manifest, icons); CI checks PWA assets in `dist/` |
| **Quality gates** | ✅ | Biome `useExhaustiveDependencies` → error; coverage via `@vitest/coverage-v8` |
| **SW / Vercel preview** | ✅ | `sw-register.js`: unregisters all SW on preview hosts; `*.vercel.app` excluded |
| **Agent rules** | ✅ | Strict gates + PR bot comments in `.cursor/rules/` |
| **Tests** | ✅ | `tests/unit/logger.test.ts`; `pnpm run test:unit:coverage` |

---

## Final Housekeeping June 2026 — Main stable

| Area | Status | Details |
|------|--------|---------|
| **PRs #4–#6** | ✅ | Perfection Sprint, Deploy Housekeeping, Pages-Smoke-Fix on `main` |
| **Pages Smoke** | ✅ | PWA `./manifest.json` + icons; CI run success |
| **Vercel Actions** | ✅ | Step-output gate (no `secrets` in `if`); skip when secrets missing |
| **AGENTS.md** | ✅ | Consolidated from draft PRs #1/#3 |
| **Branch cleanup** | ✅ | Merged `cursor/*` branches removed |

---

## July 2026 Deep Audit — BYOK, CI & Resilience

| Area | Status | Details |
|------|--------|---------|
| **PR #9 BYOK** | ✅ | `geminiApiKeyStorage.ts`, Settings UI, no prod key in bundle; security deps patched |
| **PR #10 Resilience** | ✅ | `HubErrorBoundary`, i18n `ErrorBoundaryFallback`, `GeminiKeyPrompt`, `formatGeminiError()` |
| **PR #11 Phase 3b** | ✅ | `settingsFocusSectionAtom`, per-view `HubErrorBoundary`, Gemini error mapping |
| **CI cloud-first** | ✅ | Coverage + Playwright/Lighthouse/Bundle artifacts; `concurrency` cancel-in-progress |
| **Deploy** | ✅ | GitHub Pages + Pages Smoke green after #9–#11 |
| **Unit tests** | ✅ | 57 including `geminiApiKeyStorage`, `geminiErrorMessage`, `settingsNavigation` |
| **E2E** | ✅ | 23/23 including axe (GeminiKeyPrompt contrast on dark hub cards) |
| **Open PRs** | ✅ | #1, #3, #8 closed by maintainer |

**Remaining (non-blocking):** `types.ts` split; real marketing screenshots; optional backend proxy for Gemini.

---

## July 2026 — Production Cache & Thumbnail Fix (v1.3.0)

| Area | Status | Details |
|------|--------|---------|
| **Service Worker cache** | ✅ | `CACHE_VERSION` bumped to **v10**; stale app shell issue on GitHub Pages resolved |
| **Thumbnail strategy** | ✅ | `utils/imageUtils.ts` `getArchiveThumbnailUrl()` prefers `__ia_thumb.jpg`; reduces ORB failures |
| **Audiothek a11y** | ✅ | `AudioCard` light-mode contrast fixed; axe E2E green |
| **Deployment pruning** | ✅ | `.github/workflows/prune-deployments.yml` + auto-prune in `deploy-pages.yml`; deployments reduced from 132 to 3 |
| **pnpm overrides** | ✅ | Moved from `package.json` to `pnpm-workspace.yaml` for pnpm v10+ compatibility |
| **Settings View** | ✅ | Loads correctly after cache bust |
| **Rec Room** | ✅ | Carousels load correctly after cache bust and schema relaxation |

---

## Backlog — i18n & Toast

| Area | Status | Details |
|------|--------|---------|
| **Skip-link i18n** | ✅ | `common:skipToMain` (EN/DE) in `App.tsx` |
| **Toast consolidation** | ✅ | Components → `useToast()`; stores → `toastAtom` with `i18nKey`; `resolveToastMessage()` |
| **Store toasts i18n** | ✅ | Scriptorium + Audiothek toast keys; Settings `languageUpdated` |

---

## Unreleased

- **Fetching resilience:** `utils/fetchWithRetry.ts` with jitter; `utils/requestQueue.ts` concurrency cap; IA TanStack Query `retry: 0`.
- **Vitest** (serial / `maxWorkers: 1`): all unit tests under `tests/unit/` (`sanitizer`, `fetchWithTimeout`, `fetchWithRetry`, `useDebounce`, `safeStorage`, `archiveService`, `archiveSchemas`, `useLanguage`, `requestQueue`).
- `utils/logger.ts` — `warn`/`debug` only in DEV or with `VITE_DEBUG_LOGS=true`; errors still use `console.error`.
- `@media print` + forced-colors refinement (`retro-scanlines`, focus ring) in `index.html` / `index.css`.
- Canonical, `og:url`, JSON-LD (`WebApplication`) in `index.html`.
- PWA perfected (cache limits, offline-first behavior, improved update flow).
- WCAG 2.2 AA compliance implemented (focus-visible, target size 24×24, aria-live/busy, forced-colors).
- Zod schemas added for archiveService + geminiService (runtime validation, type safety, error handling).
- Biome: extended configuration (ignores, test override, CI `biome ci`), remaining hook warnings fixed.
- Cursor Pro+ index issue fixed: CLAUDE.md visible + updated to current pnpm/Cursor state.
- Cursor Pro+ integration: `.vscode/settings.json` optimized, ESLint conflicts eliminated, Biome as a drop-in replacement.
- Security hardening: `pnpm audit fix` + CI fails on moderate+ vulnerabilities + optimized pnpm cache in GitHub Actions.
- Migrated from npm to pnpm (faster installs, better CI, less disk usage).

---

## Post-Unreleased — May 2026 CI-Green Wrap-up

| Area | Implementation |
|------|----------------|
| **Routing / Deep-Link** | `activeViewAtom` initializes synchronously with `getInitialActiveView()` (`store/app.ts`): valid `?view=` before persisted `defaultView`. Prevents React Strict Mode from resetting the view to "Explore" after `replaceState`. Smoke: "Uploader Hub shows contributors". |
| **Unit tests** | `tests/unit/` + `vitest.config.ts` (fork pool, `maxWorkers: 1`); e.g. `archiveService`, `useLanguage`, `fetchWithRetry`, `safeStorage`. |
| **a11y E2E** | `a11y.spec.ts`: documented hub routes (including For You, Scriptorium, Web Archive, AI Archive, My Archive, Uploader Hub) against `vite preview` + fresh `dist/` — axe critical/serious = 0. Contrast fixes: SideMenu inactive `text-gray-900` / `dark:text-gray-100`, For You glass CTAs `text-ia-900`, Scriptorium/Web Archive header `bg-gray-900`, AI Archive empty state, My Archive Connect `bg-gray-900`, Command Palette rows. |
| **CI parity** | Local gate matches Actions: `pnpm audit`, `lint:ci`, `check:i18n`, `tsc`, `test:unit`, `ANALYZE=true pnpm run build`, `check:bundle-size`, `CI=true pnpm run test:e2e`. Bundle budget uses brotli-KB from `bundle-report.json`. |
| **PWA / SW** | `public/sw.js`: LRU eviction, `MAX_PER_CACHE_BYTES` / `MAX_TOTAL_BYTES` (see header comment). |
| **Docs / Repo** | `CONTRIBUTING.md`, `README.md`, `CHANGELOG.md`, `.gitignore` (`graphify-out/cache/`). |

**Still worthwhile (backlog, non-blocking):** AI export PDF/Markdown; saved searches; Storyteller Web Speech; further CSP tightening; manifest PNGs instead of remote screenshot URLs where possible; manual screenreader passes on all modals.

**Note on E2E/LHCI:** `CI=true pnpm run test:e2e` and Lighthouse `@lhci/cli` use `vite preview` and therefore `dist/` — locally always run `VITE_BASE_PATH=/…/ pnpm run build` first (GitHub Actions builds in the workflow before this step). `@lhci/cli` may emit a warning that the ready pattern for port 4173 was not detected (Vite 8 writes little to stdout); the run continues anyway.

**GitHub Pages:** The live site must serve the Vite build from Actions. Under **Settings → Pages** choose source **GitHub Actions**; with "Deploy from a branch" Pages often serves the unprocessed `index.html` (`./index.tsx`) — then `.github/workflows/pages-smoke.yml` fails (clear log hint).

**Dependabot:** Configuration is at `.github/dependabot.yml` (not under `workflows/`, to avoid pseudo-workflow runs).

**Lighthouse CI:** `.github/workflows/ci.yml` runs `npx @lhci/cli autorun` after E2E with `lighthouserc.json` (Desktop; Accessibility minScore **0.95**).

---

## Issues Fixed in This Audit

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | Empty root locale files (`de.json`, `en.json`) — invalid JSON | Low | Populated with `{}` (files are unused legacy artifacts) |
| 2 | No Vite chunk splitting (`manualChunks: undefined`) | Medium | Configured vendor/ui/query chunks for optimal caching |
| 3 | Unused `loadEnv()` import/call in `vite.config.js` | Low | Removed |
| 4 | Missing CHANGELOG.md | Medium | Created with keepachangelog format |
| 5 | Copilot instructions outdated (18 lines, stale "Add:" list) | High | Rewritten with full architecture docs, patterns, guidelines |
| 6 | Dockerfile installs WebKit+Firefox deps (~200MB unused) | Medium | Removed WebKit/GStreamer deps, kept Chromium-only |
| 7 | `postCreate.sh` installs 3 browsers, only chromium needed | Medium | Changed to `npx playwright install --with-deps chromium` |
| 8 | `postCreate.sh` used npm instead of a frozen lockfile install | Low | Uses `pnpm install --frozen-lockfile` for reproducible installs |
| 9 | Playwright config missing explicit browser project | Low | Added `projects: [{ name: 'chromium' }]` block |
| 10 | Fetching resilience insufficient for archive.org | High | Added jitter, higher backoff, concurrency cap, retry deduplication |

---

## Remaining Issues by Priority

### 🔴 Critical — None Found

No critical/blocking issues were identified. The application builds cleanly, has zero TypeScript compilation errors, Vitest passes, and E2E (Playwright, CI profile with fresh `ANALYZE` build) passes.

---

### 🟠 High Priority (Next Sprint)

#### H1: Fetching resilience — partially addressed

- **Done:** Retry backoff + jitter, concurrency cap, TanStack retry reduction.
- **Follow-up:** IndexedDB list cache for search/hub results, explicit offline UI state, cache-age transparency in service worker.

#### H2: Unit test coverage — partially addressed

- **Done:** Vitest + RTL; tests for `sanitizeHtml`, `fetchWithTimeout`, `fetchWithRetry`, `requestQueue`, `useDebounce`, `safeJotaiSyncStorage`.
- **Follow-up:** Broader hook/component coverage; focus on high-impact UI paths.

#### H3: WCAG 2.2 AA gap — addressed

- **Done:** `index.css` (forced-colors, touch-target utilities, link focus-visible), design-system controls, live regions + `aria-busy`, axe E2E with `wcag22aa` + forced-colors + target-size sampling.
- **Follow-up:** Manual review of complex paths (all modals, every hub template) remains recommended.

#### H4: API response validation — addressed

- **Done:** `archiveService` / `geminiService` validate responses with Zod (`types/archiveSchemas.ts`), retries on Archive validation failures, i18n-keyed service errors.
- **Follow-up:** Extend schemas if new Archive fields become required in the UI.

#### H5: `forceConsistentCasingInFileNames` — addressed (`tsconfig.json`)

---

### 🟡 Medium Priority (Planned)

#### M1–M6 — addressed

- Print styles, forced-colors refinement, Firefox scrollbar, canonical, JSON-LD, `lang="en"` — see `index.css` / `index.html`.

#### M7: Service Worker third-party URLs may be stale

- **Impact:** `sw.js` precaches Google Fonts CSS that may no longer be required.
- **File:** `public/sw.js` (lines 13-20)
- **Fix:** Audit and update the list of third-party URLs; current list is harmless.
- **Effort:** Low

#### M8: Service worker cache size limits — addressed

- **File:** `public/sw.js` — byte limits + LRU eviction per cache and globally.

#### M9: Download manager queue unbounded — addressed

- **File:** `store/downloads.ts` — `DOWNLOAD_QUEUE_MAX_ITEMS`, `trimDownloadQueue()`, eviction before `addDownloadAtom`.

#### M10: `noUnusedLocals` / `noUnusedParameters` — enabled in `tsconfig.json`

#### M11: IndexedDB list cache for search and hubs

- **Impact:** Reduces repeated archive.org calls and improves perceived performance.
- **Files:** `services/cacheService.ts`, new `services/searchCache.ts`, TanStack Query hooks.
- **Effort:** Medium

#### M12: URL-sync for views and modals

- **Impact:** Enables deep-linking and browser history for the Jotai-based router.
- **Files:** `store/app.ts`, `App.tsx`.
- **Effort:** Medium

---

### 🟢 Low Priority (Nice-to-Have)

#### L1: Bundle size budget — addressed

- CI: `ANALYZE=true` build + `pnpm run check:bundle-size` (`.github/bundle-budgets.json`).

#### L2: `pnpm audit` in CI pipeline — addressed

- CI runs `pnpm audit --audit-level=moderate` after install; moderate+ fails the job.

#### L3: Console logging — partially addressed

- App code uses `utils/logger.ts`; verbose warnings only in DEV or with `VITE_DEBUG_LOGS=true`. Service Worker / Node scripts still use `console`.

#### L4: PWA manifest only had SVG/base64 icons — addressed

- Physical PNG icon files added for maximum browser compatibility.

#### L5: PWA manifest screenshots incomplete — addressed

- Local wide screenshots added under `public/screenshots/`.

#### L6: No CONTRIBUTING.md — addressed

- `CONTRIBUTING.md` includes pnpm, Biome, tests, bundle, and commit format.

#### L7: RecRoom GameFinder component complexity

- `components/recroom/GameFinder.tsx` (~160 lines) — extract filter/sort logic into a custom hook.

#### L8: AI Archive derived atom performance

- `store/aiArchive.ts` has expensive `aiArchiveCountsAtom` — consider splitting into smaller derived atoms.

#### L9: `@types/react` version mismatch — addressed

- `@types/react` / `@types/react-dom` are ^19.

#### L10: Linting strategy — Biome only

- No ESLint/Prettier in the repo; quality rules enforced via `biome ci`.

---

## Architecture Assessment

### Strengths

- **Clean separation of concerns:** Store, services, hooks, components, pages
- **Consistent patterns:** All views follow the same page → component → hook → atom flow
- **Good i18n system:** 34 namespaces per language with sync validation script
- **Robust PWA:** Multi-strategy service worker with offline fallback
- **Security-conscious:** DOMPurify, CSP headers, PKCE OAuth, session-scoped tokens
- **Accessibility foundation:** Skip links, focus traps, aria labels, reduced motion
- **Fetching resilience:** Backoff jitter, concurrency cap, retry deduplication

### Architecture Risks

- **Single types.ts file:** At 400+ lines, should be split by domain when it grows further.
- **No API layer abstraction:** Services directly construct URLs — consider a base API client.
- **Toast dual system:** Both `toastAtom` and `ToastContext` exist — consolidate when possible.
- **localStorage-only persistence:** Large libraries/worksets may approach quota; consider IndexedDB migration.

---

## Security Assessment

| Area | Status | Notes |
|------|--------|-------|
| XSS Protection | ✅ Secure | DOMPurify with strict config, FORBID_TAGS includes script/iframe |
| CSP Headers | ✅ Configured | Meta tag in index.html |
| OAuth Flow | ✅ Secure | PKCE flow, no client secret in frontend |
| Token Storage | ✅ Secure | sessionStorage with expiration validation |
| API Keys | ✅ Secure | BYOK browser-side only; never embedded in bundle |
| Dependencies | ✅ Current | All major deps on latest stable versions |
| Input Validation | ✅ Strong | Zod + `.safeParse()` in Archive/Gemini services |

---

## Performance Assessment

| Metric | Current | Target | Action |
|--------|---------|--------|--------|
| Chunk Splitting | ✅ Configured | vendor/ui/query | Fixed in this audit |
| Image Lazy Loading | ✅ Implemented | — | Skeleton placeholders present |
| Infinite Scroll | ✅ Implemented | — | TanStack Query `useInfiniteQuery` |
| Reduced Motion | ✅ Implemented | — | `motion-reduce:` Tailwind classes |
| Service Worker Cache | ✅ Implemented | LRU + byte caps | `public/sw.js` |
| Bundle Size Budget | ✅ CI (`check:bundle-size`) | brotli KB budgets | `.github/bundle-budgets.json` |
| Fetching Concurrency | ✅ Implemented | ≤3 archive.org requests | `utils/requestQueue.ts` |

---

## File Reference

Key files for follow-up work:

| File | Relevance |
|------|-----------|
| `tsconfig.json` | H5, M10 |
| `index.html` | M4, M5, M6 |
| `index.css` | M1, M2, M3 |
| `sw.js` | M7 |
| `store/downloads.ts` | M9 |
| `services/archiveService.ts` | H1, H3 |
| `utils/requestQueue.ts` | H1 |
| `utils/fetchWithRetry.ts` | H1 |
| `tests/e2e/a11y.spec.ts` | H2 |
| `.github/workflows/ci.yml` | L1, L2 |
| `components/recroom/GameFinder.tsx` | L7 |
| `store/aiArchive.ts` | L8 |
