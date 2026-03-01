# Internet Archive Explorer

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Vite](https://img.shields.io/badge/Vite-7.x-blue?logo=vite)](https://vitejs.dev/) [![PWA](https://img.shields.io/badge/PWA-Ready-blue?logo=pwa)](https://web.dev/progressive-web-apps/)

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
- Optional Gemini integration (API key and optional Google OAuth)
- Installable PWA with update notification flow

### 3) Tech Stack

- React 19
- TypeScript 5
- Vite 7
- Jotai (state management)
- Tailwind CSS
- Playwright (E2E smoke tests)

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
│   └── e2e/
└── scripts/
    └── sync-locales.mjs
```

### 5) Local Development

Requirements:

- Node.js 20+ (recommended)
- npm 10+ (recommended)

Install and run:

```bash
npm install
npm run dev
```

Default local URL:

- http://localhost:5173

### 6) Environment Variables

Create `.env.local` (do not commit):

```env
VITE_API_KEY=your-gemini-api-key
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_RECROOM_OPEN_ON_ARCHIVE=false
```

Template is available in `.env.example`.

Variable notes:

- `VITE_API_KEY`: Gemini key for AI features
- `VITE_GOOGLE_CLIENT_ID`: optional OAuth client id
- `VITE_RECROOM_OPEN_ON_ARCHIVE=true`: always open game pages directly on `archive.org/details/...` instead of emulator modal

### 7) Build and Deploy (GitHub Pages)

Build production:

```bash
npm run build
```

Deploy to `gh-pages` branch:

```bash
npm run deploy
```

Deployment notes:

- Vite base path is `/Internet-Archive-Explorer/`
- `.nojekyll` is delivered from `public/.nojekyll`
- Locales are synced during build via `npm run sync:locales`

### 8) CI and Smoke Checks

Configured workflows:

- `.github/workflows/ci.yml`
  - runs build + checks expected output artifacts
  - runs Playwright E2E smoke tests
- `.github/workflows/deploy-pages.yml`
  - deploys GitHub Pages (on `main` and manual dispatch)
- `.github/workflows/pages-smoke.yml`
  - validates deployed Pages endpoint behavior

Run smoke tests locally:

```bash
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
```

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

#### CI failures

Reproduce locally:

```bash
npm ci
npm run build
npm run test:e2e
```

### 12) Security Notes

- No OAuth client secret in frontend
- OAuth uses Authorization Code + PKCE
- API keys are browser-side; handle with care
- CSP is configured in `index.html` for static deployment constraints

### 13) License

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
- Optionale Gemini-Integration (API-Key und optional Google OAuth)
- Installierbare PWA mit Update-Hinweis

### 3) Technologie-Stack

- React 19
- TypeScript 5
- Vite 7
- Jotai (State Management)
- Tailwind CSS
- Playwright (E2E-Smoke-Tests)

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
│   └── e2e/
└── scripts/
    └── sync-locales.mjs
```

### 5) Lokale Entwicklung

Voraussetzungen:

- Node.js 20+ (empfohlen)
- npm 10+ (empfohlen)

Installation und Start:

```bash
npm install
npm run dev
```

Standard-URL lokal:

- http://localhost:5173

### 6) Umgebungsvariablen

Datei `.env.local` anlegen (nicht committen):

```env
VITE_API_KEY=your-gemini-api-key
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_RECROOM_OPEN_ON_ARCHIVE=false
```

Vorlage: `.env.example`

Bedeutung:

- `VITE_API_KEY`: Gemini-Key für AI-Funktionen
- `VITE_GOOGLE_CLIENT_ID`: optionale OAuth-Client-ID
- `VITE_RECROOM_OPEN_ON_ARCHIVE=true`: öffnet Spiele immer direkt via `archive.org/details/...` statt Emulator-Modal

### 7) Build und Deploy (GitHub Pages)

Produktions-Build:

```bash
npm run build
```

Deploy auf `gh-pages`:

```bash
npm run deploy
```

Hinweise:

- Vite-Base-Path ist `/Internet-Archive-Explorer/`
- `.nojekyll` wird aus `public/.nojekyll` ausgeliefert
- Locale-Dateien werden im Build via `npm run sync:locales` synchronisiert

### 8) CI und Smoke-Checks

Konfigurierte Workflows:

- `.github/workflows/ci.yml`
  - Build + Artefakt-Prüfungen
  - Playwright-E2E-Smoke-Tests
- `.github/workflows/deploy-pages.yml`
  - GitHub-Pages-Deploy (bei `main` und manuell)
- `.github/workflows/pages-smoke.yml`
  - Prüfungen gegen die live deployte Seite

Smoke-Tests lokal ausführen:

```bash
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
```

### 9) PWA- und Service-Worker-Verhalten

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

#### CI-Fehler

Lokal reproduzieren mit:

```bash
npm ci
npm run build
npm run test:e2e
```

### 12) Sicherheits-Hinweise

- Kein OAuth Client-Secret im Frontend
- OAuth via Authorization Code + PKCE
- API-Keys sind browserseitig; entsprechend vorsichtig behandeln
- CSP ist in `index.html` auf statisches Hosting abgestimmt

### 13) Lizenz

MIT
