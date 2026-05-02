# Audit Report — Internet Archive Explorer

**Date:** 2026-04-14 · **Last reviewed:** 2026-05-02
**Scope:** Full application audit (architecture, code quality, security, performance, accessibility, testing, i18n, PWA, configuration)
**App Version:** 1.0.0
**Stack:** React 19 · TypeScript 6 · Vite 8 · Jotai 2 · Tailwind CSS 3 · Framer Motion 12 · TanStack Query v5 · Biome 2.4

---

## Executive Summary

The Internet Archive Explorer is a well-architected, feature-rich PWA with 17 views, 100+ components, 14 Jotai atom stores, and 6 service modules. The codebase follows modern React patterns consistently. No critical runtime errors or security vulnerabilities were found. Unit coverage focuses on core utilities/services/hooks; E2E covers smoke + selected axe routes under CI (`vite preview`).

**Overall Health: ✅ Good** — Production-ready with improvement opportunities documented below.

## Unreleased

- 🧪 Vitest (serial / `maxWorkers: 1`): alle Unit-Tests unter `tests/unit/` (`sanitizer`, `fetchWithTimeout`, `fetchWithRetry`, `useDebounce`, `safeStorage`, `archiveService`, `useLanguage`)
- 🪵 `utils/logger.ts` — `warn`/`debug` nur in DEV oder bei `VITE_DEBUG_LOGS=true`; Fehler weiterhin per `console.error`
- 🖨️ `@media print` + Forced-Colors-Feinschliff (`retro-scanlines`, Fokus-Ring) in `index.html` / `index.css`
- 🔍 Canonical, `og:url`, JSON-LD (`WebApplication`) in `index.html`
- 📱 PWA perfektioniert (Cache-Limits, Offline-First, verbesserter Update-Flow)
- ♿ WCAG 2.2 AA Compliance vollständig umgesetzt (focus-visible, target-size 24×24, aria-live/busy, forced-colors)
- 🛡️ Zod-Schemas hinzugefügt für archiveService + geminiService (Runtime-Validation, Type-Safety, Error-Handling)
- 🧹 Biome: Konfiguration erweitert (Ignores, Test-Override, CI `biome ci`), verbleibende Hook-Warnungen behoben
- 🛠️ Fixed Cursor Pro+ index issue: CLAUDE.md wieder sichtbar + auf aktuellem pnpm/Cursor-Stand gebracht
- 🧩 Cursor Pro+ Integration: .vscode/settings.json optimiert, ESLint-Konflikte eliminiert, Biome als perfekter Drop-in-Ersatz für bisherige ESLint-Experience
- 🔒 Security-Hardening: pnpm audit fix + CI fails on moderate+ vulnerabilities + optimierter pnpm cache in GitHub Actions
- 🔄 Migriert von npm zu pnpm (schnellere Installs, bessere CI, weniger Disk Usage)

---

## Post-Unreleased — Abschluss Sprint Mai 2026 (CI-grün)

| Bereich | Umsetzung |
| ------- | --------- |
| **Routing / Deep-Link** | `activeViewAtom` initialisiert synchron mit **`getInitialActiveView()`** (`store/app.ts`): gültiges `?view=` vor persisted `defaultView`. Verhindert, dass React Strict Mode nach `replaceState` die Ansicht wieder auf „Explore“ setzt. Smoke: „Uploader-Hub zeigt Beitragende“. |
| **1.1 Unit-Tests** | `tests/unit/` + `vitest.config.ts` (fork pool, `maxWorkers: 1`); u. a. `archiveService`, `useLanguage`, `fetchWithRetry`, `safeStorage`. |
| **a11y E2E** | `a11y.spec.ts`: dokumentierte Hub-Routen (inkl. For You, Scriptorium, Web Archive, AI Archive, My Archive, Uploader Hub) gegen **`vite preview`** + frischem **`dist/`** — axe **critical/serious = 0**. Kontrast u. a.: SideMenu inaktiv **`text-gray-900` / `dark:text-gray-100`**, For-You-Glass-CTAs **`text-ia-900`**, Scriptorium/Web-Archive-Header **`bg-gray-900`**, AI-Archive-Leerzustand, My-Archive-Connect **`bg-gray-900`**, Command-Palette-Zeilen. |
| **CI-Parität** | Lokales Gate wie Actions: `pnpm audit`, `lint:ci`, `check:i18n`, `tsc`, `test:unit`, **`ANALYZE=true pnpm run build`**, `check:bundle-size`, `CI=true pnpm run test:e2e`. Bundle-Budget nutzt **brotli-KB** aus `bundle-report.json`. |
| **PWA / SW** | `public/sw.js`: LRU-Eviction, **MAX_PER_CACHE_BYTES** / **MAX_TOTAL_BYTES** (siehe Kopfkommentar). |
| **Doku / Repo** | `CONTRIBUTING.md`, `README.md`, `CHANGELOG.md`, `.gitignore` (`graphify-out/cache/`). |

**Noch sinnvoll (Backlog, nicht blockierend):** AI-Export PDF/Markdown; Saved Searches; Storyteller Web Speech; CSP weiter verschärfen; Manifest-PNGs statt Remote-Screenshot-URLs wo möglich; manuelle Screenreader-Passes auf allen Modals.

**Hinweis E2E/LHCI:** `CI=true pnpm run test:e2e` und Lighthouse `@lhci/cli` nutzen **`vite preview`** und damit **`dist/`** — lokal immer **`VITE_BASE_PATH=/…/ pnpm run build`** vor dem Lauf (GitHub Actions baut im Workflow davor). `@lhci/cli` kann eine **Warnung** ausgeben, dass das Ready-Pattern für Port 4173 nicht erkannt wurde (Vite 8 schreibt wenig nach stdout); der Lauf setzt danach trotzdem fort.

**GitHub Pages:** Live-Site muss das **Vite-Build** aus Actions ausliefern. Unter **Settings → Pages** die Quelle **GitHub Actions** wählen; bei „Deploy from a branch“ liefert Pages oft die unbearbeitete `index.html` ( `./index.tsx` ) — dann schlägt `.github/workflows/pages-smoke.yml` fehl (Absicherung mit klarem Log-Hinweis).

**Dependabot:** Konfiguration liegt unter **`.github/dependabot.yml`** (nicht unter `workflows/`, um Pseudo-Workflow-Läufe zu vermeiden).

**Lighthouse CI:** `.github/workflows/ci.yml` — nach E2E `npx @lhci/cli autorun` mit `lighthouserc.json` (Desktop; Accessibility minScore 0.88).

---

## Issues Fixed in This Audit

| #   | Issue                                                         | Severity | Resolution                                                      |
| --- | ------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| 1   | Empty root locale files (`de.json`, `en.json`) — invalid JSON | Low      | Populated with `{}` (files are unused legacy artifacts)         |
| 2   | No Vite chunk splitting (`manualChunks: undefined`)           | Medium   | Configured vendor/ui/query chunks for optimal caching           |
| 3   | Unused `loadEnv()` import/call in `vite.config.js`            | Low      | Removed                                                         |
| 4   | Missing CHANGELOG.md                                          | Medium   | Created with keepachangelog format                              |
| 5   | Copilot instructions outdated (18 lines, stale "Add:" list)   | High     | Rewritten with full architecture docs, patterns, guidelines     |
| 6   | Dockerfile installs WebKit+Firefox deps (~200MB unused)       | Medium   | Removed WebKit/GStreamer deps, kept Chromium-only               |
| 7   | postCreate.sh installs 3 browsers, only chromium needed       | Medium   | Changed to `npx playwright install --with-deps chromium`        |
| 8   | postCreate.sh used npm instead of a frozen lockfile install   | Low      | Uses `pnpm install --frozen-lockfile` for reproducible installs |
| 9   | Playwright config missing explicit browser project            | Low      | Added `projects: [{ name: 'chromium' }]` block                  |

---

## Remaining Issues by Priority

### 🔴 Critical — None Found

No critical/blocking issues were identified. The application builds cleanly, has zero TypeScript compilation errors, Vitest passes, and E2E (Playwright, CI profile with fresh `ANALYZE` build) passes.

---

### 🟠 High Priority (Next Sprint)

#### H1: Unit test coverage — **partially addressed**

- **Was:** Vitest + RTL; Tests für `sanitizeHtml`, `fetchWithTimeout`, `fetchWithRetry` (extrahiert nach `utils/fetchWithRetry.ts`), `useDebounce`, `safeJotaiSyncStorage`.
- **Follow-up:** Breitere Hook-/Komponenten-Abdeckung; `useLanguage` ist bereits abgedeckt — Schwerpunkt auf weiteren Hooks und UI-Kritikalität.

#### H2: WCAG 2.2 AA Gap — addressed

- **Was:** `index.css` (forced-colors, touch-target utilities, link focus-visible), design-system controls (`Button`, `Modal`, `ItemCard`, Karussell), Live-Region + `aria-busy` für Suche/Trending/Command Palette/Scriptorium/Lazy-Views; axe E2E mit `wcag22aa` + forced-colors + Zielgrößen-Stichprobe.
- **Follow-up:** Manuelle Prüfung komplexer Pfade (alle Modals, jedes Hub-Template) bleibt empfehlenswert.

#### H3: API Response Validation — addressed

- **Was:** `archiveService` / `geminiService` validated responses with Zod (`types/archiveSchemas.ts`), retries on Archive validation failures, i18n-keyed service errors.
- **Follow-up:** Extend schemas if new Archive fields become required in the UI.

#### H4: `forceConsistentCasingInFileNames` — **addressed** (`tsconfig.json`)

---

### 🟡 Medium Priority (Planned)

#### M1 / M2 / M3 / M4 / M5 / M6 — **addressed**

- Print-Styles, Forced-Colors (inkl. Feinschliff), Firefox-Scrollbar, canonical, JSON-LD, `lang="en"` — siehe `index.css` / `index.html`.

#### M7: Service Worker THIRD_PARTY_URLS May Be Stale

- **Impact:** `sw.js` caches URLs for CDN resources that may no longer be used.
- **File:** `sw.js` (lines 13-20)
- **Fix:** Audit and update the list of third-party URLs.
- **Effort:** Low

#### M8: ~~Service Worker No Cache Size Limits~~ — **addressed**

- **File:** `public/sw.js` — byte limits + **LRU eviction** pro Cache und global.

#### M9: ~~Download Manager Queue Unbounded~~ — **addressed**

- **File:** `store/downloads.ts` — `DOWNLOAD_QUEUE_MAX_ITEMS`, `trimDownloadQueue()`, eviction before `addDownloadAtom`.

#### M10: `noUnusedLocals` / `noUnusedParameters` — **enabled** in `tsconfig.json` (Cleanup bei neuen Warnungen in eigener PR).

---

### 🟢 Low Priority (Nice-to-Have)

#### L1: Bundle size budget — **addressed**

- CI: `ANALYZE=true` Build + `pnpm run check:bundle-size` (`.github/bundle-budgets.json`).

#### L2: ~~No `pnpm audit` in CI Pipeline~~ (addressed)

- CI runs `pnpm audit --audit-level=moderate` after install; moderate+ fails the job (see `.github/workflows/ci.yml`).

#### L3: Console logging — **partially addressed**

- App-Code nutzt `utils/logger.ts`; ausführliche Warnungen nur in DEV oder `VITE_DEBUG_LOGS=true`. Service Worker / Node-Skripte weiterhin mit `console`.

#### L4: PWA Manifest Only Has SVG/Base64 Icons

- Add physical PNG icon files for maximum browser compatibility.

#### L5: PWA Manifest Screenshots Incomplete

- Only 2 screenshots. Add 2-3 more showing Videothek, Audiothek, Library.

#### L6: ~~No CONTRIBUTING.md~~ — **addressed** (`CONTRIBUTING.md` inkl. pnpm, Biome, Tests, Bundle, Commit-Format)

#### L7: RecRoom GameFinder Component Complexity

- `components/recroom/GameFinder.tsx` (~160 lines) — extract filter/sort logic into a custom hook.

#### L8: AI Archive Derived Atom Performance

- `store/aiArchive.ts` has expensive `aiArchiveCountsAtom` — consider splitting into smaller derived atoms.

#### L9: ~~`@types/react` Version Mismatch~~ — **addressed** (`@types/react` / `@types/react-dom` ^19)

#### L10: Linting strategy — **Biome only**

- Kein ESLint/Prettier im Repo; Qualitätsregeln über **`biome ci`** — keine parallele ESLint-Regelpalette.

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
| Input Validation | ✅ Strong     | Zod + `.safeParse()` in Archive-/Gemini-Services (`types/archiveSchemas.ts`) |

---

## Performance Assessment

| Metric               | Current        | Target          | Action                            |
| -------------------- | -------------- | --------------- | --------------------------------- |
| Chunk Splitting      | ✅ Configured  | vendor/ui/query | Fixed in this audit               |
| Image Lazy Loading   | ✅ Implemented | —               | Skeleton placeholders present     |
| Infinite Scroll      | ✅ Implemented | —               | TanStack Query `useInfiniteQuery` |
| Reduced Motion       | ✅ Implemented | —               | `motion-reduce:` Tailwind classes |
| Service Worker Cache | ✅ Implemented | LRU + byte caps | `public/sw.js`                    |
| Bundle Size Budget   | ✅ CI (`check:bundle-size`) | brotli KB budgets | `.github/bundle-budgets.json`    |

---

## File Reference

Key files for follow-up work:

| File                                | Relevance  |
| ----------------------------------- | ---------- |
| `tsconfig.json`                     | H4, M10    |
| `index.html`                        | M4, M5, M6 |
| `index.css`                         | M1, M2, M3 |
| `sw.js`                             | M7         |
| `store/downloads.ts`                | —          |
| `services/archiveService.ts`        | H3         |
| `tests/e2e/a11y.spec.ts`            | H2         |
| `.github/workflows/ci.yml`          | L1, L2     |
| `components/recroom/GameFinder.tsx` | L7         |
| `store/aiArchive.ts`                | L8         |
