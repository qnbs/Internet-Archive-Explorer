# Internet Archive Explorer

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Vite](https://img.shields.io/badge/Vite-8.x-blue?logo=vite)](https://vitejs.dev/) [![PWA](https://img.shields.io/badge/PWA-Ready-blue?logo=pwa)](https://web.dev/progressive-web-apps/)

Modern web app for discovering and exploring Internet Archive content with curated hubs, personal library workflows, and optional AI features.

Live app: https://qnbs.github.io/Internet-Archive-Explorer/

---

## English

### 1) Overview

Internet Archive Explorer is a React + TypeScript single-page app using Vite and Jotai. It runs as a Progressive Web App (PWA), supports English and German, and is deployed to GitHub Pages under the base path `/Internet-Archive-Explorer/`.

### 2) Main Features

- Global search with filters and detail modals
- Content hubs: Videothek, Audiothek, Images Hub, Rec Room, Web Archive, Storyteller
- Personal library: favorites, tags, collections, notes, bulk actions
- Scriptorium workspace with document flows and AI helpers
- AI Archive history for generated insights/summaries
- Optional Gemini integration (**Bring Your Own Key** in Settings → AI Features; optional Google OAuth)
- Installable PWA with update notification flow

### 3) Tech Stack

- React 19
- TypeScript 6
- Vite 8
- Jotai (state management)
- Tailwind CSS
- Biome — lint and format (CLI + [biomejs.biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) in Cursor/VS Code; single tool instead of ESLint + Prettier)
- Vitest + Testing Library (unit tests under `tests/unit/`)
- Playwright (E2E: smoke + accessibility checks; CI uses `vite preview` + `ANALYZE` build)
- Tooling: **pnpm** for packages; **Cursor Pro+** / VS Code with workspace `.vscode/settings.json` (see `CONTRIBUTING.md`)

### 4) Project Structure

```text
/
├── App.tsx
├── index.tsx
├── index.html
├── package.json
├── vite.config.js
├── components/
├── hooks/
├── pages/
├── services/
├── store/
├── locales/
├── public/
│   ├── locales/
│   ├── sw-register.js
│   └── .nojekyll
├── tests/
│   ├── unit/
│   └── e2e/
└── scripts/
    └── sync-locales.mjs
```

### 5) Local Development

Requirements:

- Node.js 20+ with Corepack (pnpm enabled) (recommended)

Install and run:

```bash
pnpm install
pnpm run dev
```

Default local URL:

- http://localhost:5173

**Editor:** For format-on-save and fast checks without global ESLint clashes, open the repo in **Cursor Pro+** or VS Code, install the **Biome** extension, and rely on the committed `.vscode` settings (ESLint is turned off in this workspace). See `CONTRIBUTING.md` → *Cursor Pro+ Setup*.

### 6) Environment Variables

Create `.env.local` only if you need optional OAuth or dev flags (do not commit):

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_RECROOM_OPEN_ON_ARCHIVE=false
```

Template: `.env.example`

**Gemini AI (recommended):** Add your personal API key in the app under **Settings → AI Features → Gemini API Key**. The key is stored only in your browser (`sessionStorage`) and is never bundled into the build.

Variable notes:

- `VITE_GOOGLE_CLIENT_ID`: optional OAuth client id (Google sign-in for Gemini)
- `VITE_RECROOM_OPEN_ON_ARCHIVE=true`: always open game pages directly on `archive.org/details/...` instead of emulator modal
- `VITE_ALLOW_BUILD_TIME_GEMINI_KEY=true` + `VITE_API_KEY`: **dev-only** fallback for local demos — not used in production builds

### 7) Build and Deploy (GitHub Pages + Vercel)

**Primary (GitHub Pages):** Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which builds with `VITE_BASE_PATH=/<repo>/` and publishes the **`dist/`** artifact to GitHub Pages.

**Optional (Vercel):** Root-path mirror / PR previews via `vercel.json` and `.github/workflows/vercel-deploy.yml` (requires Vercel secrets). Set `VITE_BASE_PATH=/` on Vercel. Full guide: **`docs/DEPLOYMENT.md`**.

**Repository setting (required once for Pages):** In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch” / `/(root)`). If the source is a branch, the live site can incorrectly serve the raw `index.html` with `./index.tsx` (no bundled JS), and **Pages Smoke Checks** will fail.

Local production build:

```bash
pnpm run build
```

Optional legacy deploy to `gh-pages` branch (manual):

```bash
pnpm run deploy
```

Deployment notes:

- Vite base path is `/Internet-Archive-Explorer/`
- `.nojekyll` is delivered from `public/.nojekyll`
- Locales are synced during build via `pnpm run sync:locales`

### 8) CI and Smoke Checks

**Cloud-first policy:** Full unit test coverage, complete E2E suite, Lighthouse audits, and bundle analysis with reports run in **GitHub Actions** (`ubuntu-latest`). This keeps local VS Code / low-end dev machines fast.

**Recommended local workflow:**

- Daily: `pnpm run check` (lint + types + unit tests) + `pnpm run dev`
- Before PR: `pnpm run lint:ci && pnpm exec tsc --noEmit && pnpm run test:unit`
- Full heavy validation: push to a branch and let CI run (or use `act` on capable hardware)

Configured workflows:

- `.github/workflows/ci.yml`
  - Biome, TypeScript, **Vitest with coverage** (thresholds in `vitest.config.ts`), production build with bundle analysis
  - bundle size budgets (`pnpm run check:bundle-size`)
  - Playwright E2E tests (incl. axe on multiple hubs when `CI=true`); HTML report uploaded as artifact
  - **`dist/manifest.json`** presence check; **Lighthouse CI** (`lighthouserc.json`, accessibility threshold)
- **Dependabot:** `.github/dependabot.yml` (not under `workflows/`)
- `.github/workflows/deploy-pages.yml`
  - deploys GitHub Pages (on `main` and manual dispatch)
- `.github/workflows/vercel-deploy.yml`
  - optional Vercel deploy when `VERCEL_*` secrets are configured (skipped otherwise)
- `.github/workflows/pages-smoke.yml`
  - validates deployed Pages endpoint behavior (manifest, icons, SW, locales)

Run checks locally (closest to CI):

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm run lint:ci && pnpm run check:i18n && pnpm exec tsc --noEmit && pnpm run test:unit
ANALYZE=true VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build && pnpm run check:bundle-size
CI=true PLAYWRIGHT_BASE_PATH=/Internet-Archive-Explorer/ pnpm run test:e2e
```

Use your repo name in `VITE_BASE_PATH` / `PLAYWRIGHT_BASE_PATH` if it differs. **`CI=true` E2E serves `dist/`** — the build step above is required.

### 9) PWA and Service Worker Behavior

- Service worker is registered for production/static hosting.
- On development-like hosts (`localhost`, `127.0.0.1`, `0.0.0.0`, `*.app.github.dev`), service worker registration is disabled and stale registrations are cleaned up to avoid dynamic import issues.
- Preview-host debug hint appears in UI if an older app service worker registration is detected.

### 10) Accessibility

Target and status:

- Target: WCAG 2.2 AA
- Current status: major core flows are continuously improved toward AA

Implemented fundamentals include visible focus, keyboard operability, semantic labels, and reduced-motion support.

### 11) Troubleshooting

#### Dynamic import fails (e.g. `Failed to fetch dynamically imported module`)

1. Open browser devtools
2. Remove site data/cache for the app origin
3. Unregister service workers for that origin
4. Reload with hard refresh

This is especially relevant on preview hosts after branch/app updates.

#### Missing translations

If you see i18n keys instead of text:

- verify locales are present in `dist/locales/...`
- verify `/Internet-Archive-Explorer/locales/...` endpoints respond with `200`

#### Slow or failed Internet Archive loads (live site)

- The **service worker** may still be on an old cache line: hard-refresh, or **clear site data** and reload so `sw.js` updates (current API timeout for `archive.org` JSON is **30s**; older builds used **15s** and could surface false “offline” / failed fetches when Archive.org is slow).
- **Rate limits** (429): the app retries with optional **`Retry-After`**; if errors persist, wait and retry or reduce parallel scrolling.

#### CI failures

Reproduce locally (light checks):

```bash
pnpm install --frozen-lockfile
pnpm run check          # lint + types + unit tests
pnpm run build
```

Full E2E + Lighthouse: push to CI or run `CI=true PLAYWRIGHT_BASE_PATH=/Internet-Archive-Explorer/ pnpm run test:e2e` after build (resource-heavy).

### 12) Security Notes

- No OAuth client secret in frontend
- OAuth uses Authorization Code + PKCE (tokens in `sessionStorage`; suitable for a public SPA only if you accept browser-exposed tokens — use restricted OAuth scopes and separate API projects where possible)
- **Gemini BYOK:** API keys are entered in Settings and stored only in the browser (`sessionStorage`). They are **not** embedded in the shipped bundle. Treat keys as revocable and quota-limited; use Google AI Studio project restrictions.
- Optional verbose client logging in prod: set `VITE_DEBUG_LOGS=true` (see `.env.example`); default logs only `logger.error` noise-free output for end users.
- CSP is configured in `index.html` for static deployment constraints

### 13) Roadmap / limits (honest scope)

- **AI:** BYOK via `services/geminiApiKeyStorage.ts` + `geminiService.ts`; browser-only keys remain a trade-off vs. a backend proxy.
- **Offline:** PWA + caches cover shell and configured assets; deep offline for every Archive route is not guaranteed.
- **Sharing / community:** No dedicated social layer; sharing uses normal Web Share / URLs where implemented.
- **Low-end devices:** Prefer reduced motion (already supported); Vitest runs serially by default to stay gentle on weak dev machines.

### 14) License

MIT

---

## Deutsch

### 1) Überblick

Internet Archive Explorer ist eine React+TypeScript-Single-Page-App mit Vite und Jotai. Die Anwendung läuft als Progressive Web App (PWA), unterstützt Deutsch und Englisch und wird auf GitHub Pages unter dem Base-Pfad `/Internet-Archive-Explorer/` bereitgestellt.

### 2) Hauptfunktionen

- Globale Suche mit Filtern und Detail-Modals
- Content-Hubs: Videothek, Audiothek, Images Hub, Rec Room, Web Archive, Storyteller
- Persönliche Bibliothek: Favoriten, Tags, Sammlungen, Notizen, Bulk-Aktionen
- Scriptorium-Workspace mit Dokument-Workflows und AI-Hilfen
- AI-Archive-Verlauf für erzeugte Inhalte
- Optionale Gemini-Integration (**Bring Your Own Key** unter Einstellungen → KI-Funktionen; optional Google OAuth)
- Installierbare PWA mit Update-Hinweis

### 3) Technologie-Stack

- React 19
- TypeScript 6
- Vite 8
- Jotai (State Management)
- Tailwind CSS
- Biome — Lint und Format (CLI + [biomejs.biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) in Cursor/VS Code; ein Tool statt ESLint + Prettier)
- Vitest + Testing Library (Unit-Tests unter `tests/unit/`)
- Playwright (E2E: Smoke + Barrierefreiheit; CI mit `vite preview` und `ANALYZE`-Build)
- Tooling: **pnpm**; **Cursor Pro+** / VS Code mit `.vscode/settings.json` (siehe `CONTRIBUTING.md`)

### 4) Projektstruktur

```text
/
├── App.tsx
├── index.tsx
├── index.html
├── package.json
├── vite.config.js
├── components/
├── hooks/
├── pages/
├── services/
├── store/
├── locales/
├── public/
│   ├── locales/
│   ├── sw-register.js
│   └── .nojekyll
├── tests/
│   ├── unit/
│   └── e2e/
└── scripts/
    └── sync-locales.mjs
```

### 5) Lokale Entwicklung

Voraussetzungen:

- Node.js 20+ mit Corepack (pnpm aktiviert) (empfohlen)

Installation und Start:

```bash
pnpm install
pnpm run dev
```

Standard-URL lokal:

- http://localhost:5173

**Editor:** Für Format beim Speichern und ohne Konflikte mit einer globalen ESLint-Konfiguration: Repo in **Cursor Pro+** oder VS Code öffnen, **Biome**-Extension installieren, die committeten `.vscode`-Einstellungen nutzen (ESLint ist im Workspace deaktiviert). Siehe `CONTRIBUTING.md` → *Cursor Pro+ Setup*.

### 6) Umgebungsvariablen

Datei `.env.local` nur bei optionalem OAuth oder Dev-Flags anlegen (nicht committen):

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_RECROOM_OPEN_ON_ARCHIVE=false
```

Vorlage: `.env.example`

**Gemini-KI (empfohlen):** Persönlichen API-Schlüssel in der App unter **Einstellungen → KI-Funktionen → Gemini-API-Schlüssel** hinterlegen. Der Schlüssel wird nur im Browser (`sessionStorage`) gespeichert und nicht in den Build eingebettet.

Bedeutung:

- `VITE_GOOGLE_CLIENT_ID`: optionale OAuth-Client-ID (Google-Anmeldung für Gemini)
- `VITE_RECROOM_OPEN_ON_ARCHIVE=true`: öffnet Spiele immer direkt via `archive.org/details/...` statt Emulator-Modal
- `VITE_ALLOW_BUILD_TIME_GEMINI_KEY=true` + `VITE_API_KEY`: **nur Dev** — Fallback für lokale Demos, nicht in Produktions-Builds

### 7) Build und Deploy (GitHub Pages + Vercel)

**Standard (GitHub Pages):** Push auf `main` startet `.github/workflows/deploy-pages.yml`; das Artefakt aus **`dist/`** wird auf GitHub Pages veröffentlicht.

**Optional (Vercel):** Root-Pfad-Spiegel / PR-Previews über `vercel.json` und `.github/workflows/vercel-deploy.yml` (Vercel-Secrets nötig). `VITE_BASE_PATH=/` auf Vercel. Ausführlich: **`docs/DEPLOYMENT.md`**.

**Repo-Einstellung (einmal nötig für Pages):** Unter **Settings → Pages → Build and deployment** die **Quelle** auf **GitHub Actions** stellen (nicht „Deploy from a branch“ / Stammverzeichnis). Sonst kann die Live-Seite fälschlich die unbearbeitete `index.html` mit `./index.tsx` ausliefern (ohne gebündeltes JS), und **Pages Smoke Checks** schlagen fehl.

Lokaler Produktions-Build:

```bash
pnpm run build
```

Optional manuell auf Branch `gh-pages` (Legacy):

```bash
pnpm run deploy
```

Hinweise:

- Vite-Base-Path ist `/Internet-Archive-Explorer/`
- `.nojekyll` wird aus `public/.nojekyll` ausgeliefert
- Locale-Dateien werden im Build via `pnpm run sync:locales` synchronisiert

### 8) CI und Smoke-Checks

Konfigurierte Workflows:

- `.github/workflows/ci.yml`
  - Biome, TypeScript, Vitest-Unit-Tests, Produktionsbuild inkl. Bundle-Analyse
  - Bundle-Größen-Budgets (`pnpm run check:bundle-size`)
  - Playwright-E2E-Smoke-Tests (inkl. axe auf mehreren Hubs bei `CI=true`)
  - Prüfung **`dist/manifest.json`**; **Lighthouse CI** (`lighthouserc.json`, Accessibility-Schwelle)
- **Dependabot:** `.github/dependabot.yml` (nicht unter `workflows/`)
- `.github/workflows/deploy-pages.yml`
  - GitHub-Pages-Deploy (bei `main` und manuell)
- `.github/workflows/pages-smoke.yml`
  - Prüfungen gegen die live deployte Seite

Lokal CI-nah:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm run lint:ci && pnpm run check:i18n && pnpm exec tsc --noEmit && pnpm run test:unit
ANALYZE=true VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build && pnpm run check:bundle-size
CI=true PLAYWRIGHT_BASE_PATH=/Internet-Archive-Explorer/ pnpm run test:e2e
```

Repo-Namen in den Pfaden anpassen falls abweichend. **`CI=true`-E2E nutzt `dist/`** — ohne vorherigen Build sind die Tests nicht aussagekräftig.

### 9) PWA- und Service-Worker-Verhalten

- **Web-App-Manifest:** Quelle `public/manifest.json` (landet in `dist/`); enthält **Screenshots** (wide) für unterstützte Install-Oberflächen.
- In Produktion/statischem Hosting wird der Service Worker registriert.
- Auf Entwicklungs-ähnlichen Hosts (`localhost`, `127.0.0.1`, `0.0.0.0`, `*.app.github.dev`) wird die Registrierung deaktiviert; veraltete Registrierungen werden bereinigt, um Dynamic-Import-Probleme zu vermeiden.
- In Preview-Hosts wird im UI ein Debug-Hinweis angezeigt, falls eine ältere App-SW-Registrierung erkannt wird.

### 10) Accessibility

Ziel und Stand:

- Ziel: WCAG 2.2 AA
- Stand: zentrale Kern-Flows werden fortlaufend in Richtung AA optimiert

Umgesetzte Grundlagen: sichtbarer Fokus, Tastaturbedienbarkeit, semantische Labels, Reduced-Motion-Unterstützung.

### 11) Troubleshooting

#### Dynamic Import Fehler (z. B. `Failed to fetch dynamically imported module`)

1. Browser-DevTools öffnen
2. Site-Daten/Cache für die Origin löschen
3. Service Worker für die Origin deregistrieren
4. Hard Reload durchführen

Besonders relevant auf Preview-Hosts nach Updates.

#### Fehlende Übersetzungen

Wenn i18n-Keys statt Texte erscheinen:

- prüfen, ob `dist/locales/...` vorhanden ist
- prüfen, ob `/Internet-Archive-Explorer/locales/...` mit `200` antwortet

#### Langsame oder fehlschlagende Internet-Archive-Ladevorgänge (Live)

- Ggf. **veralteter Service Worker**: Hard-Reload oder **Seitendaten löschen** und neu laden, damit `sw.js` aktuell ist (API-Timeout für `archive.org`-JSON **30s**; ältere Builds mit **15s** konnten bei langsamer API vorzeitig abbrechen).
- **Rate Limits** (429): die App wertet optional **`Retry-After`** aus; bei anhaltenden Fehlern kurz warten und erneut versuchen bzw. weniger parallel scrollen.

#### CI-Fehler

Lokal (leichte Checks):

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run build
```

Volles E2E + Lighthouse: Push in CI oder nach Build `CI=true PLAYWRIGHT_BASE_PATH=/Internet-Archive-Explorer/ pnpm run test:e2e` (ressourcenintensiv).

### 12) Sicherheits-Hinweise

- Kein OAuth-Client-Secret im Frontend
- OAuth mit Authorization Code + PKCE (Tokens in `sessionStorage`; für öffentliche SPAs nur mit bewusster Risikoakzeptanz — eingeschränkte Scopes, separates OAuth-Projekt)
- **Gemini BYOK:** API-Schlüssel werden in den Einstellungen eingegeben und nur im Browser (`sessionStorage`) gespeichert. Sie werden **nicht** ins ausgelieferte Bundle eingebettet. Keys als widerrufbar und quota-begrenzt behandeln; AI-Studio-Projektrestriktionen nutzen.
- Optionale ausführliche Client-Logs in Produktion: `VITE_DEBUG_LOGS=true` (siehe `.env.example`); Standard bleibt nur `logger.error` für Endnutzer:innen.
- CSP ist in `index.html` auf statisches Hosting abgestimmt

### 13) Roadmap / Grenzen

- **KI:** BYOK über `services/geminiApiKeyStorage.ts` + `geminiService.ts`; Browser-Keys vs. Backend-Proxy bleiben ein Trade-off.
- **Offline:** PWA + Caches für Shell und konfigurierte Assets; kein Voll-Offline für alle Archive-Routen garantiert.
- **Community/Sharing:** Kein eigenes Social-Layer; Teilen über Web Share / URLs wo vorhanden.
- **Schwache Geräte:** Reduced Motion unterstützt; Vitest läuft standardmäßig seriell (schonende Dev-Hardware).

### 14) Lizenz

MIT
