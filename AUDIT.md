# Audit Report — Internet Archive Explorer

**Date:** 2026-04-14
**Scope:** Full application audit (architecture, code quality, security, performance, accessibility, testing, i18n, PWA, configuration)
**App Version:** 1.0.0
**Stack:** React 19 · TypeScript 5 · Vite 7 · Jotai 2 · Tailwind CSS 3 · Framer Motion 12 · TanStack Query v5

---

## Executive Summary

The Internet Archive Explorer is a well-architected, feature-rich PWA with 17 views, 100+ components, 14 Jotai atom stores, and 6 service modules. The codebase follows modern React patterns consistently. No critical runtime errors or security vulnerabilities were found. The primary gaps are in test coverage, build optimization, and documentation.

**Overall Health: ✅ Good** — Production-ready with improvement opportunities documented below.

---

## Issues Fixed in This Audit

| #   | Issue                                                         | Severity | Resolution                                                  |
| --- | ------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| 1   | Empty root locale files (`de.json`, `en.json`) — invalid JSON | Low      | Populated with `{}` (files are unused legacy artifacts)     |
| 2   | No Vite chunk splitting (`manualChunks: undefined`)           | Medium   | Configured vendor/ui/query chunks for optimal caching       |
| 3   | Unused `loadEnv()` import/call in `vite.config.js`            | Low      | Removed                                                     |
| 4   | Missing CHANGELOG.md                                          | Medium   | Created with keepachangelog format                          |
| 5   | Copilot instructions outdated (18 lines, stale "Add:" list)   | High     | Rewritten with full architecture docs, patterns, guidelines |
| 6   | Dockerfile installs WebKit+Firefox deps (~200MB unused)       | Medium   | Removed WebKit/GStreamer deps, kept Chromium-only           |
| 7   | postCreate.sh installs 3 browsers, only chromium needed       | Medium   | Changed to `npx playwright install --with-deps chromium`    |
| 8   | postCreate.sh uses `npm install` instead of `npm ci`          | Low      | Changed to `npm ci` for reproducible installs               |
| 9   | Playwright config missing explicit browser project            | Low      | Added `projects: [{ name: 'chromium' }]` block              |

---

## Remaining Issues by Priority

### 🔴 Critical — None Found

No critical/blocking issues were identified. The application builds cleanly, has zero TypeScript compilation errors, and all existing E2E tests pass.

---

### 🟠 High Priority (Next Sprint)

#### H1: No Unit Test Coverage

- **Impact:** Only 2 Playwright E2E test files exist (~30 scenarios). Hooks, utilities, services, and atom logic are untested.
- **Recommendation:** Add Vitest with React Testing Library. Priority targets:
  - `utils/sanitizer.ts` — XSS protection validation
  - `utils/fetchWithTimeout.ts` — timeout/abort behavior
  - `hooks/useDebounce.ts` — timing behavior
  - `hooks/useLanguage.ts` — translation key resolution
  - `store/safeStorage.ts` — graceful degradation
  - `services/archiveService.ts` — retry/backoff logic
- **Effort:** Medium (2-3 days for core coverage)

#### H2: WCAG 2.2 AA Gap

- **Impact:** Accessibility tests check WCAG 2.1 AA. README targets 2.2 AA.
- **Missing for 2.2:**
  - `focus-visible` enhanced styling
  - Minimum target size (24×24 CSS pixels) on interactive elements
  - `aria-busy` on async-loading regions
  - ARIA live regions for instant search results
- **Files:** `tests/e2e/a11y.spec.ts`, various components
- **Effort:** Medium (2-3 days)

#### H3: API Response Validation

- **Impact:** `services/archiveService.ts` trusts Archive.org API shape without schema validation.
- **Risk:** Unexpected API changes could cause silent failures or runtime errors.
- **Recommendation:** Add Zod schemas for critical API response types (`ArchiveSearchResponse`, `ArchiveMetadata`).
- **Effort:** Low-Medium (1-2 days)

#### H4: Missing `forceConsistentCasingInFileNames` in tsconfig

- **Impact:** Cross-platform file casing issues possible.
- **File:** `tsconfig.json`
- **Fix:** Add `"forceConsistentCasingInFileNames": true`
- **Effort:** Trivial

---

### 🟡 Medium Priority (Planned)

#### M1: No Print Styles

- **Impact:** Printing any page produces unstyled/broken output.
- **File:** `index.css`
- **Fix:** Add `@media print` rules for content pages.
- **Effort:** Low

#### M2: Missing Forced-Colors Support

- **Impact:** High-contrast mode (Windows) renders glass effects incorrectly.
- **File:** `index.css`
- **Fix:** Add `@media (forced-colors: active)` overrides for `.glass` elements.
- **Effort:** Low

#### M3: Firefox Scrollbar Styling

- **Impact:** Custom scrollbar only applies to WebKit browsers.
- **File:** `index.css`
- **Fix:** Add `scrollbar-color` and `scrollbar-width` CSS properties.
- **Effort:** Trivial

#### M4: Missing `<link rel="canonical">` for SEO

- **Impact:** No canonical URL for search engines.
- **File:** `index.html`
- **Fix:** Add `<link rel="canonical" href="https://qnbs.github.io/Internet-Archive-Explorer/" />`
- **Effort:** Trivial

#### M5: Missing JSON-LD Structured Data

- **Impact:** No rich snippets in search results.
- **File:** `index.html`
- **Fix:** Add `<script type="application/ld+json">` with WebApplication schema.
- **Effort:** Trivial

#### M6: `index.html` `lang` Attribute Hardcoded to `"de"`

- **Impact:** Default language meta doesn't match default app language (`en`).
- **File:** `index.html` (line 2)
- **Fix:** Change to `lang="en"` or make dynamic.
- **Effort:** Trivial

#### M7: Service Worker THIRD_PARTY_URLS May Be Stale

- **Impact:** `sw.js` caches URLs for CDN resources that may no longer be used.
- **File:** `sw.js` (lines 13-20)
- **Fix:** Audit and update the list of third-party URLs.
- **Effort:** Low

#### M8: Service Worker No Cache Size Limits

- **Impact:** Unbounded cache growth on devices with limited storage.
- **File:** `sw.js`
- **Fix:** Implement cache eviction strategy (LRU or max-entries).
- **Effort:** Low-Medium

#### M9: Download Manager Queue Unbounded

- **Impact:** Potential memory issue with very large download queues.
- **File:** `store/downloads.ts`
- **Fix:** Add max queue size constant and enforce it.
- **Effort:** Low

#### M10: `noUnusedLocals` / `noUnusedParameters` Disabled

- **Impact:** Dead code can accumulate silently.
- **File:** `tsconfig.json`
- **Note:** Enabling these may produce 50+ warnings. Do in a dedicated PR.
- **Effort:** Medium (requires cleanup pass)

---

### 🟢 Low Priority (Nice-to-Have)

#### L1: No Bundle Size Budget in CI

- Add Lighthouse CI or `bundlesize` to track regressions.

#### L2: No `npm audit` in CI Pipeline

- Add `npm audit --audit-level=moderate` step to `.github/workflows/ci.yml`.

#### L3: Console Logging in Production

- ~54 `console.error/warn/log` statements exist. All are contextual error logging (acceptable) but could be gated behind a debug flag.

#### L4: PWA Manifest Only Has SVG/Base64 Icons

- Add physical PNG icon files for maximum browser compatibility.

#### L5: PWA Manifest Screenshots Incomplete

- Only 2 screenshots. Add 2-3 more showing Videothek, Audiothek, Library.

#### L6: No CONTRIBUTING.md

- Create contributing guidelines for external contributors.

#### L7: RecRoom GameFinder Component Complexity

- `components/recroom/GameFinder.tsx` (~160 lines) — extract filter/sort logic into a custom hook.

#### L8: AI Archive Derived Atom Performance

- `store/aiArchive.ts` has expensive `aiArchiveCountsAtom` — consider splitting into smaller derived atoms.

#### L9: `@types/react` Version Mismatch

- `@types/react: ^18.3.3` while using React 19. Update when `@types/react@19` is stable.

#### L10: Missing ESLint Rules

- Consider adding: `@typescript-eslint/no-floating-promises`, `react/hook-use-state`.

---

## Architecture Assessment

### Strengths

- **Clean separation of concerns:** Store, services, hooks, components, pages
- **Consistent patterns:** All views follow the same page → component → hook → atom flow
- **Good i18n system:** 34 namespaces per language with sync validation script
- **Robust PWA:** Multi-strategy service worker with offline fallback
- **Security-conscious:** DOMPurify, CSP headers, PKCE OAuth, session-scoped tokens
- **Accessibility foundation:** Skip links, focus traps, aria labels, reduced motion

### Architecture Risks

- **Single types.ts file:** At 400+ lines, should be split by domain when it grows further
- **No API layer abstraction:** Services directly construct URLs — consider a base API client
- **Toast dual system:** Both `toastAtom` and `ToastContext` exist — consolidate when possible

---

## Security Assessment

| Area             | Status        | Notes                                                            |
| ---------------- | ------------- | ---------------------------------------------------------------- |
| XSS Protection   | ✅ Secure     | DOMPurify with strict config, FORBID_TAGS includes script/iframe |
| CSP Headers      | ✅ Configured | Meta tag in index.html                                           |
| OAuth Flow       | ✅ Secure     | PKCE flow, no client secret in frontend                          |
| Token Storage    | ✅ Secure     | sessionStorage with expiration validation                        |
| API Keys         | ⚠️ Acceptable | Browser-side by design, documented in README                     |
| Dependencies     | ✅ Current    | All major deps on latest stable versions                         |
| Input Validation | ⚠️ Partial    | No schema validation on API responses (see H3)                   |

---

## Performance Assessment

| Metric               | Current        | Target          | Action                            |
| -------------------- | -------------- | --------------- | --------------------------------- |
| Chunk Splitting      | ✅ Configured  | vendor/ui/query | Fixed in this audit               |
| Image Lazy Loading   | ✅ Implemented | —               | Skeleton placeholders present     |
| Infinite Scroll      | ✅ Implemented | —               | TanStack Query `useInfiniteQuery` |
| Reduced Motion       | ✅ Implemented | —               | `motion-reduce:` Tailwind classes |
| Service Worker Cache | ✅ Implemented | —               | Multi-strategy caching            |
| Bundle Size Budget   | ❌ Missing     | < 300KB gzipped | Add CI check (see L1)             |

---

## File Reference

Key files for follow-up work:

| File                                | Relevance  |
| ----------------------------------- | ---------- |
| `tsconfig.json`                     | H4, M10    |
| `index.html`                        | M4, M5, M6 |
| `index.css`                         | M1, M2, M3 |
| `sw.js`                             | M7, M8     |
| `store/downloads.ts`                | M9         |
| `services/archiveService.ts`        | H3         |
| `tests/e2e/a11y.spec.ts`            | H2         |
| `.github/workflows/ci.yml`          | L1, L2     |
| `components/recroom/GameFinder.tsx` | L7         |
| `store/aiArchive.ts`                | L8         |
