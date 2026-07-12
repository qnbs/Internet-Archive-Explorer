# Internet Archive Explorer

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue?logo=typescript)](https://www.typescript.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Vite](https://img.shields.io/badge/Vite-8.x-blue?logo=vite)](https://vitejs.dev/) [![PWA](https://img.shields.io/badge/PWA-Ready-blue?logo=pwa)](https://web.dev/progressive-web-apps/)

A modern, installable web app for discovering, exploring, and curating content from the [Internet Archive](https://archive.org). It combines global search, curated content hubs, a personal library, a research workspace, and optional AI-assisted discovery — all running as a client-side Progressive Web App (PWA) with English and German interfaces.

**Live app (GitHub Pages):** https://qnbs.github.io/Internet-Archive-Explorer/  
**Live app (Vercel):** https://internet-archive-explorer.vercel.app/

---

## Table of Contents

- [Overview](#overview)
- [Main Features](#main-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Build and Deploy](#build-and-deploy)
- [CI and Smoke Checks](#ci-and-smoke-checks)
- [PWA and Service Worker](#pwa-and-service-worker)
- [Accessibility](#accessibility)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Roadmap and Known Limits](#roadmap-and-known-limits)
- [License](#license)

---

## Overview

Internet Archive Explorer is a React + TypeScript single-page application built with Vite. State is managed with Jotai for client state and TanStack Query for server state. The app is deployed to both GitHub Pages under the base path `/Internet-Archive-Explorer/` and to Vercel served from root (`/`). Both deploys run automatically on every push to `main`.

It is intentionally **backend-free**: all content comes directly from public archive.org APIs. Optional Google Gemini features use a Bring Your Own Key (BYOK) model; keys are stored only in the browser and never embedded in the shipped bundle.

---

## Main Features

- **Global search** with filters, sorting, and detail modals against archive.org
- **Content hubs:** Videothek, Audiothek, Images Hub, Rec Room, Web Archive, Storyteller
- **Personal library:** favorites, tags, collections, notes, drag-to-reorder, and bulk actions
- **Scriptorium workspace:** document worksets with notes and optional AI helpers
- **AI Archive:** history of AI-generated summaries, insights, and stories
- **Optional Gemini integration:** BYOK in Settings → AI Features; optional Google OAuth
- **Installable PWA** with offline shell, multi-cache service worker, and update notifications
- **Bilingual UI:** English and German with namespace-based i18n

---

## Technology Stack

| Area | Choice | Configuration |
|------|--------|---------------|
| Runtime | Node.js 22+ | Recommended with Corepack |
| Package Manager | pnpm 10.6.1 | `packageManager` in `package.json` |
| Framework | React 19.1.1 | JSX transform `react-jsx` |
| Language | TypeScript 6.0.2 | `strict`, `noUnusedLocals`, `noUnusedParameters` |
| Build Tool | Vite 8.1.2 | Base path via `VITE_BASE_PATH` |
| State (client) | Jotai 2.14.0 | `store/` with `safeAtomWithStorage` |
| State (server) | TanStack Query 5.90.21 | `useQuery` / `useInfiniteQuery` |
| Styling | Tailwind CSS 3.4.19 | Custom `ia-*`, `accent-*`, `sepia-*` tokens |
| Animation | Framer Motion 12.35.1 | With `motion-reduce:` variants |
| Icons | lucide-react 1.8.0 | Custom SVGs in `components/Icons.tsx` |
| Lint / Format | Biome 2.4.13 | `biome.json`; no ESLint or Prettier |
| Unit Tests | Vitest 4.1.0 | `vitest.config.ts`, serial, coverage thresholds |
| E2E Tests | Playwright 1.52.0 | `playwright.config.ts`, axe-core accessibility |
| Validation | Zod 4.4.1 | `types/archiveSchemas.ts` |

---

## Project Structure

```text
/
├── App.tsx                 # Root: view switch, layout, PWA logic
├── index.tsx               # React root, QueryClient setup
├── index.html              # HTML template, CSP, SEO, PWA links
├── types.ts                # Central TypeScript types
├── types/archiveSchemas.ts # Zod schemas for Archive.org / Gemini JSON
├── package.json            # Scripts and dependencies
├── vite.config.js          # Vite, bundle analyzer, base path, manual chunks
├── vitest.config.ts        # Unit test config (jsdom, serial, coverage)
├── playwright.config.ts    # E2E config (Chromium, baseURL on port 4173)
├── biome.json              # Linter / formatter rules
├── tailwind.config.js      # Theme tokens
├── postcss.config.js       # Tailwind + autoprefixer
├── lighthouserc.json       # Lighthouse CI accessibility gate
├── vercel.json             # SPA rewrites, cache headers (optional)
│
├── components/             # React components grouped by feature
├── contexts/               # React contexts (Toast, HelpView, ItemDetail)
├── hooks/                  # Reusable hooks
├── pages/                  # 17 view components, lazy-loaded in App.tsx
├── services/               # API and storage services
├── store/                  # Jotai atoms (per feature)
├── utils/                  # Helpers (fetch, sanitizer, logger, formatter)
├── locales/                # i18n namespaces (en/, de/)
├── public/                 # Static assets, PWA manifest, service worker
├── scripts/                # Build / sync / check scripts
├── tests/                  # Unit and E2E tests
├── docs/                   # Deployment, branch protection, release process
└── .github/workflows/      # CI, Pages deploy, Pages smoke, Vercel deploy
```

---

## Local Development

### Requirements

- Node.js 22+ with Corepack enabled (`corepack enable`)
- pnpm 10.6.1 (Corepack will use the version pinned in `package.json`)

### Install and run

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

Default local URL: http://localhost:5173

For GitHub Pages parity locally:

```bash
pnpm run dev --host 127.0.0.1 --port 5173
# http://127.0.0.1:5173/Internet-Archive-Explorer/
```

For root-path hosting parity (Vercel-like):

```bash
VITE_BASE_PATH=/ pnpm run dev --host 127.0.0.1 --port 5173
```

### Editor setup

Open the repo in Cursor Pro+ or VS Code and install the **Biome** extension (`biomejs.biome`). The committed `.vscode/settings.json` disables ESLint for this workspace and sets Biome as the default formatter. See `CONTRIBUTING.md` for details.

---

## Environment Variables

Create `.env.local` only for optional OAuth or dev flags. Do not commit it.

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_RECROOM_OPEN_ON_ARCHIVE=false
```

Template: `.env.example`

**Gemini AI (recommended):** Add your personal API key inside the app under **Settings → AI Features → Gemini API Key**. The key is stored only in browser `sessionStorage` and is never bundled into the build.

| Variable | Purpose |
|----------|---------|
| `VITE_GOOGLE_CLIENT_ID` | Optional OAuth client id for Google sign-in |
| `VITE_RECROOM_OPEN_ON_ARCHIVE` | When set to `true`, always open game pages on `archive.org/details/...` instead of the emulator modal |
| `VITE_ALLOW_BUILD_TIME_GEMINI_KEY=true` + `VITE_API_KEY` | **Dev-only** fallback for local demos — never use in production builds |
| `VITE_DEBUG_LOGS=true` | Verbose client logging in production builds (default: off) |

---

## Build and Deploy

### GitHub Pages (primary)

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which builds with `VITE_BASE_PATH=/<repo>/` and publishes `dist/` to GitHub Pages.

**Required repository setting:** In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”). If Source is a branch, the live site may serve raw `index.html` with `./index.tsx` (no bundled JS), and Pages Smoke Checks will fail.

Local production build:

```bash
pnpm run build
```

Legacy manual deploy to `gh-pages` branch:

```bash
pnpm run deploy   # prefer GitHub Actions
```

### Vercel

A root-path mirror / PR previews are deployed via `vercel.json` and `.github/workflows/vercel-deploy.yml`. The workflow runs automatically on every push to `main` (production deploy) and on pull requests (preview deploy). Set `VITE_BASE_PATH=/` on Vercel.

The PWA manifest (`public/manifest.json`) is generated at build time from `public/manifest.template.json` using `VITE_BASE_PATH`, so `scope`, `start_url`, shortcuts, and `share_target` are correct for both GitHub Pages and Vercel.

Full guide: `docs/DEPLOYMENT.md`

---

## CI and Smoke Checks

**Cloud-first policy:** Full unit test coverage, the complete E2E suite, Lighthouse audits, and bundle analysis run in GitHub Actions (`ubuntu-latest`). This keeps local development fast on low-end machines.

**Recommended local workflow:**

- Daily: `pnpm run check` (lint + types + unit tests) and `pnpm run dev`
- Before PR: `pnpm run lint:ci && pnpm exec tsc --noEmit && pnpm run test:unit`
- Full heavy validation: push to a branch and let CI run

Configured workflows:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | push/PR to `main` | Biome, TypeScript, Vitest with coverage, production build with bundle analysis, Playwright E2E, Lighthouse CI |
| `deploy-pages.yml` | push to `main` | Build and publish to GitHub Pages; prunes old deployments to the last 3 |
| `pages-smoke.yml` | after deploy | Live URL smoke checks (manifest, icons, SW, locales) |
| `prune-deployments.yml` | manual | Prunes GitHub deployments to a configurable number (default 3) |
| `vercel-deploy.yml` | push to `main` / PR | Vercel production / preview deploy |

Run checks locally closest to CI:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm run lint:ci && pnpm run check:i18n && pnpm exec tsc --noEmit && pnpm run test:unit
ANALYZE=true VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build && pnpm run check:bundle-size
CI=true PLAYWRIGHT_BASE_PATH=/Internet-Archive-Explorer/ pnpm run test:e2e
```

`CI=true` E2E serves `dist/` — the build step above is required first.

---

## PWA and Service Worker

- The service worker is registered for production / static hosting.
- On development hosts (`localhost`, `127.0.0.1`, `*.app.github.dev`) registration is disabled and stale registrations are cleaned up to avoid dynamic-import issues.
- The SW uses multiple caches with LRU eviction (see `public/sw.js`).
- IA JSON/API requests use stale-while-revalidate with a 30-second network timeout.
- Images use cache-first plus background refresh.
- A preview-host debug hint appears in the UI if an older app service worker registration is detected.

---

## Accessibility

**Target:** WCAG 2.2 AA

Implemented fundamentals include visible focus indicators, keyboard operability, semantic labels, skip links, `aria-live` / `aria-busy` regions, reduced-motion support, and a minimum 24×24 px touch target size. E2E accessibility scans run with `@axe-core/playwright` across 15+ views.

---

## Troubleshooting

### Dynamic import fails (`Failed to fetch dynamically imported module`)

1. Open browser DevTools
2. Remove site data / cache for the app origin
3. Unregister service workers for that origin
4. Hard-reload the page

This is especially relevant on preview hosts after branch/app updates.

### Missing translations

If you see i18n keys instead of text:

- Verify locales are present in `dist/locales/...`
- Verify `/Internet-Archive-Explorer/locales/...` endpoints respond with `200`

### Slow or failed Internet Archive loads (live site)

- The service worker may still be on an old cache line: hard-refresh, or clear site data and reload so `sw.js` updates. The current API timeout for `archive.org` JSON is **30s**. After cache-behavior changes, `CACHE_VERSION` in `public/sw.js` is bumped so existing clients refresh the app shell.
- **Rate limits (429):** the app retries with optional `Retry-After`; if errors persist, wait and retry or reduce parallel scrolling.
- **ORB-blocked thumbnails:** some `archive.org/services/get-item-image.php` responses are blocked by the browser; the app falls back to `__ia_thumb.jpg`.

### CI failures

Reproduce locally (light checks):

```bash
pnpm install --frozen-lockfile
pnpm run check        # lint + types + unit tests
pnpm run build
```

Full E2E + Lighthouse: push to CI, or run `CI=true PLAYWRIGHT_BASE_PATH=/Internet-Archive-Explorer/ pnpm run test:e2e` after a build.

---

## Security

- No OAuth client secret in the frontend
- OAuth uses Authorization Code + PKCE; tokens live in `sessionStorage`
- **Gemini BYOK:** API keys are entered in Settings and stored only in browser `sessionStorage`. They are **not** embedded in the shipped bundle. Treat keys as revocable and quota-limited; use Google AI Studio project restrictions.
- Optional verbose client logging in production: set `VITE_DEBUG_LOGS=true` (see `.env.example`)
- CSP is configured as a `<meta http-equiv="Content-Security-Policy">` tag in `index.html` for static hosting constraints
- All HTML from external sources is sanitized with DOMPurify (`utils/sanitizer.ts`)

For security issues, see `.github/SECURITY.md`.

---

## Roadmap and Known Limits

- **AI:** BYOK via `services/geminiApiKeyStorage.ts` + `geminiService.ts`. Browser-only keys remain a trade-off vs. a backend proxy.
- **Offline:** PWA + caches cover the shell and configured assets; deep offline for every Archive route is not guaranteed.
- **Sharing / community:** No dedicated social layer; sharing uses Web Share / URLs where implemented.
- **Low-end devices:** Reduced motion is supported; Vitest runs serially by default to stay gentle on weak dev machines.

See `docs/release-process.md` for versioning and release notes.

---

## License

MIT
