# Internet Archive Explorer

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Vite](https://img.shields.io/badge/Vite-7.x-blue?logo=vite)](https://vitejs.dev/) [![PWA](https://img.shields.io/badge/PWA-Ready-blue?logo=pwa)](https://web.dev/progressive-web-apps/)

Modernes Web-Portal zum Erkunden von Inhalten des Internet Archive – mit kuratierten Hubs, persönlicher Bibliothek, Forschungswerkzeugen und optionalen Gemini-AI-Funktionen.

## Live (GitHub Pages)

- App: **https://qnbs.github.io/Internet-Archive-Explorer/**
- Deploy-Target: `gh-pages` Branch (Root)
- Vite Base Path: `/Internet-Archive-Explorer/`

## Inhaltsverzeichnis

- [Features](#features)
- [Architektur](#architektur)
- [Schnellstart lokal](#schnellstart-lokal)
- [Umgebungsvariablen](#umgebungsvariablen)
- [OAuth + Gemini](#oauth--gemini)
- [Build & Deploy (GitHub Pages)](#build--deploy-github-pages)
- [CI / Smoke Checks](#ci--smoke-checks)
- [Accessibility](#accessibility)
- [Troubleshooting](#troubleshooting)
- [Projektstruktur](#projektstruktur)
- [Lizenz](#lizenz)

## Features

- **Explorer & Search**: Trend-Inhalte, Suchfunktionen, Filter und Detailansichten
- **Content-Hubs**: Videothek, Audiothek, Images Hub, Rec Room, Web Archive, Storyteller
- **My Library**: Speichern, Taggen, Sammlungen, Notizen, Bulk-Aktionen
- **Scriptorium**: Worksets, Reader, Notizen, AI-Hilfen
- **AI Archive**: Verlauf und Wiederverwendung von AI-Ergebnissen
- **PWA**: Installierbar, Update-Flow via Service Worker
- **i18n**: Deutsch/Englisch via Namespace-JSONs

## Accessibility

- Zielstandard: **WCAG 2.2 AA** (laufend geprüft und iterativ verbessert)
- Umgesetzte Kernpunkte: sichtbarer Fokus, semantische Labels, `aria-live`, reduzierte Bewegung, Skip-Link
- Kurzstatement: Die Anwendung wird nach bestem Wissen WCAG-konform betrieben; finale Abnahme umfasst weiterhin manuelle Screenreader-/Kontrast-Checks in produktiven Zielgeräten.
- Accessibility Statement (Referenz): https://www.w3.org/WAI/standards-guidelines/wcag/

### Accessibility Status

- Aktueller Stand: **größtenteils WCAG 2.2 AA-konform** für zentrale User-Flows (Navigation, Suche, Modals, Fokusführung)
- Technisch umgesetzt: semantische Landmarken, sichtbare Fokusindikatoren, Tastaturbedienbarkeit, ARIA-Statusmeldungen, Reduced-Motion-Unterstützung
- Verbleibende manuelle Endchecks: Screenreader-Regression (NVDA/VoiceOver), Kontrast-Stichproben in Dark-Theme-Varianten, reale Mobile-Geräte

## Architektur

- **Frontend**: React 19 + TypeScript
- **State**: Jotai
- **Bundler**: Vite
- **Styling**: Tailwind
- **Service Layer**: Kapselt Archive- und Gemini-Aufrufe
- **Lazy Loading**: Hauptseiten als dynamische Chunks

## Schnellstart lokal

```bash
npm install
npm run dev
```

Standardmäßig läuft Vite lokal unter `http://localhost:5173`.

## Umgebungsvariablen

Datei: `.env.local` (nicht committen)

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Vorlage: `.env.example`

## OAuth + Gemini

Die App unterstützt Google OAuth 2.0 (Authorization Code + PKCE) für Gemini-Nutzung im Browser.

### Sicherheitsprinzipien

- Kein Client-Secret im Frontend
- `VITE_GOOGLE_CLIENT_ID` nur via `import.meta.env`
- PKCE + `state`-Validierung
- OAuth-`code` wird nach Redirect aus URL entfernt
- Token wird mit TTL gehalten (in-memory + Storage), bei 401/403 invalidiert
- Logout räumt lokal auf und kann Revoke triggern

### Gemini-Aufrufe

- Primär via `Authorization: Bearer <token>`
- Fallback-Verhalten abhängig von aktueller App-Konfiguration

## Build & Deploy (GitHub Pages)

### Lokal bauen

```bash
npm run build
```

### Deploy nach `gh-pages`

```bash
npm run deploy
```

Deploy-Pipeline:
- `predeploy` → `npm run build`
- Upload von `dist/` via `gh-pages -d dist`

### Wichtige Deploy-Details

- `.nojekyll` wird ausgeliefert (`public/.nojekyll`)
- Locale-Dateien werden vor jedem Build synchronisiert (`sync:locales`)
- `dist/locales/...` muss vorhanden sein

## CI / Smoke Checks

GitHub Workflows:

- `.github/workflows/ci.yml`
  - Trigger: Push/PR auf `main`
  - Prüft Build und kritische Artefakte (`dist/index.html`, `dist/sw.js`, `dist/.nojekyll`, `dist/locales/...`)

- `.github/workflows/pages-smoke.yml`
  - Trigger: Push auf `gh-pages`
  - Prüft Live-URL, Service Worker, Main-Bundle, Manifest und Locale-Endpunkte
  - Führt zusätzlich Basis-A11y-Heuristiken auf Live-HTML aus (ohne neue Abhängigkeiten)

### Finaler Live-Test (manuell)

```bash
# Hard Refresh im Browser (Linux/Windows): Ctrl+Shift+R

# Optional: Site Data / Cache löschen in DevTools

# Endpoint-Smokechecks
curl -I https://qnbs.github.io/Internet-Archive-Explorer/
curl -I https://qnbs.github.io/Internet-Archive-Explorer/sw.js
curl -I https://qnbs.github.io/Internet-Archive-Explorer/locales/de/common.json
curl -I https://qnbs.github.io/Internet-Archive-Explorer/locales/en/common.json
```

## Troubleshooting

### Weißer Screen / Endlosladen

1. DevTools öffnen → **Console** + **Network**
2. Auf 404 oder `Unexpected token '<'` bei JS prüfen
3. Service Worker unregister + Site Data löschen
4. Hard Refresh (`Ctrl+Shift+R`)

### Missing Translation Keys

Symptom: UI zeigt Keys wie `explorer:searchPlaceholder`

Checks:
- `https://qnbs.github.io/Internet-Archive-Explorer/locales/de/common.json` muss `200` liefern
- Build enthält `dist/locales/de` und `dist/locales/en`

### CI schlägt fehl

- Log in Actions öffnen
- Lokal reproduzieren mit:

```bash
npm install
npm run build
```

## Projektstruktur

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
│   ├── sw.js
│   └── .nojekyll
├── .github/workflows/
│   ├── ci.yml
│   └── pages-smoke.yml
└── scripts/
    └── sync-locales.mjs
```

## Lizenz

MIT

---

## English summary

Internet Archive Explorer is a React + TypeScript + Vite application deployed to GitHub Pages under `/Internet-Archive-Explorer/`.
It includes CI build checks and live Pages smoke tests, with i18n locale sync and `.nojekyll` hardening for stable static deployments.
