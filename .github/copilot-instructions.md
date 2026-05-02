You are an expert full-stack React 19 + TypeScript architect specialized in modern Vite + Jotai + Tailwind + PWA apps for the Internet Archive.

---

## Project Rules (ALWAYS follow)

### Core Stack

- **React 19** with functional components only (no class components)
- **TypeScript strict** mode — all types in `types.ts`, no `any` (Biome / TS strict)
- **Jotai 2** atoms only for state management (no Redux/Zustand/Context for state)
- **Tailwind CSS 3** with custom IA color palette (`ia-*` tokens in `tailwind.config.js`)
- **Framer Motion 12** for all animations and transitions
- **TanStack Query v5** for all server data fetching (infinite scroll, caching, refetch)
- **React Router DOM 7** — currently single-page with Jotai view atoms, not file-based routing
- **Vite 8** with chunk splitting (vendor/ui/query/react-core/ai-sdk) and `@/` path alias

### Quality Standards

- **WCAG 2.2 AA** accessibility — semantic HTML, aria labels, focus management, reduced-motion
- **PWA** with service worker (`sw.js`) — multi-strategy caching (network-first nav, cache-first API/images, SWR static assets)
- **i18n** — 34 namespace files per language in `locales/{en,de}/{namespace}.json`
- Never break existing hubs (Videothek, Audiothek, Rec Room, Images, Scriptorium, etc.)
- Always add proper error handling, loading skeletons, and user-facing error feedback (toast)
- Use shadcn/ui style components where possible (see `components/ui/`)
- Every new feature needs: component, hook, jotai atom, test stub, i18n keys (both en + de)

---

## Architecture Overview

### Directory Structure

```
/
├── App.tsx                 # Root: view router, providers, QueryClient, modal manager
├── index.tsx               # Entry point: React root + StrictMode
├── types.ts                # All TypeScript interfaces and types
├── store/                  # 14 Jotai atom files (single-responsibility)
│   ├── app.ts              # Active view, modal state, navigation
│   ├── settings.ts         # Theme, density, font size, AI, accessibility (14 settings)
│   ├── favorites.ts        # Library items, collections, tags, uploaderFavorites
│   ├── search.ts           # Query, facets, history, filters
│   ├── audiothek.ts        # Playlist state
│   ├── audioPlayer.ts      # Audio playback state (current track, playing, volume)
│   ├── aiArchive.ts        # AI generation history with derived counts
│   ├── archive.ts          # Archive API cache atoms
│   ├── downloads.ts        # Download queue state
│   ├── scriptorium.ts      # Document workspace state, worksets
│   ├── i18n.ts             # Language atom, namespace-based translation loader
│   ├── pwa.ts              # Install prompt, SW update waiting
│   ├── toast.ts            # Toast notification atoms
│   ├── safeStorage.ts      # Safe localStorage wrapper (graceful degradation)
│   └── index.ts            # Barrel export
├── services/               # 6 service modules
│   ├── archiveService.ts   # Internet Archive API with retry + exponential backoff
│   ├── geminiService.ts    # Google Gemini AI with request throttling
│   ├── geminiAuthStorage.ts# OAuth token management (sessionStorage, PKCE)
│   ├── aiPersistenceService.ts # AI archive localStorage persistence
│   ├── cacheService.ts     # IndexedDB wrapper for response caching
│   └── dataService.ts      # Settings/library export/import (JSON backup)
├── hooks/                  # Custom React hooks
├── pages/                  # 17 view components (one per hub/feature)
├── components/             # UI components + hub sub-directories
│   ├── ui/                 # Base primitives: Button, Card, Modal, ThemeToggle
│   ├── videothek/          # HeroSection, CollectionCarousel
│   ├── audiothek/          # AudioPlayer, PlaylistPanel, AudioCard, AudioCarousel, etc.
│   ├── recroom/            # RecRoomHero, RecRoomCarousel, GameFinder
│   ├── scriptorium/        # 11 components: workspace, document reader, analysis, etc.
│   ├── library/            # 15 components: dashboard, drag-to-reorder, AI recommendations
│   ├── ai-archive/         # Detail modal, list, sidebar, cards
│   ├── uploader/           # Profile header, tabs, collections, reviews
│   ├── favorites/          # FavoriteItemCard, UploaderFavoritesTab
│   ├── settings/           # ThemeSelector, PWAInstallManager
│   ├── help/               # Header, content, search, sidebar
│   └── modals/             # InstallModal
├── contexts/               # React contexts (Toast, ItemDetail, HelpView)
├── locales/                # i18n source files
│   ├── en/                 # 34 English namespace JSON files
│   └── de/                 # 34 German namespace JSON files
├── scripts/
│   └── sync-locales.mjs    # Copies locales → public/locales, validates key completeness
├── tests/
│   ├── unit/               # Vitest (utilities, hooks, services, downloads trim)
│   └── e2e/                # Playwright: smoke.spec.ts, a11y.spec.ts
├── public/                 # Static assets, manifest.json, sw-register.js
├── lighthouserc.json       # Lighthouse CI assertions (GitHub Actions)
└── .cursor/rules/          # Cursor Agent rules (*.mdc)
```

### State Management Patterns

- **Global persistent state** (theme, language, library): `safeAtomWithStorage` in store files
- **Feature state** (search, audio player, AI archive): dedicated Jotai atoms
- **Derived state**: use `selectAtom` or read-only derived atoms to prevent re-renders
- **Server state**: TanStack Query `useInfiniteQuery` / `useQuery` — never cache API data in atoms
- **Temporary UI state** (modal open, form input): local `useState` in components
- **Token storage**: `sessionStorage` for OAuth tokens (not persisted), `localStorage` for preferences

### i18n System

- Namespace-based: each feature has its own JSON file (e.g., `locales/en/explorer.json`)
- Loaded at runtime via `fetch()` in `store/i18n.ts` with English fallback
- Access via `useLanguage()` hook → `t('namespace:key.subkey')`
- Sync script validates DE has all keys from EN; auto-fills missing with placeholder
- Root `de.json` / `en.json` are unused legacy files (i18n loads from `locales/` only)

### Service Worker Strategy (`sw.js`)

- **Navigation**: Network-First with 15s timeout, offline fallback HTML
- **Archive API** (`archive.org` / `web.archive.org` non-image): Stale-while-revalidate with **~30s** network timeout for JSON (not 15s — slow `advancedsearch`/`metadata` must not be aborted early)
- **Images** (`archive.org` thumbnails): Cache-First with background refresh
- **Static assets**: Stale-While-Revalidate
- Cache versioning via `CACHE_VERSION` / per-cache names; old caches cleaned on activate

---

## Development Guidelines

### Adding a New Feature

1. Create page in `pages/NewFeatureView.tsx`
2. Create components in `components/newfeature/`
3. Add Jotai atoms in `store/newfeature.ts` (export from `store/index.ts`)
4. Add hook in `hooks/useNewFeature.ts`
5. Add i18n keys to `locales/en/newFeature.json` and `locales/de/newFeature.json`
6. Register namespace in `store/i18n.ts` → `NAMESPACES` array
7. Add navigation entry in `components/SideMenu.tsx` and/or `components/BottomNav.tsx`
8. Add view case in `App.tsx` view router
9. Add test stub in `tests/e2e/`

### Icons

- Use **lucide-react** for all UI icons
- Custom SVG icons: wrap in `components/Icons.tsx` as React components
- Size with Tailwind classes: `w-4 h-4`, `w-5 h-5`, `w-6 h-6`

### Testing

- **E2E**: Playwright with chromium — `tests/e2e/smoke.spec.ts`, `a11y.spec.ts`
- **Accessibility**: `@axe-core/playwright` for WCAG 2.2 AA–tagged axe checks (`tests/e2e/a11y.spec.ts`)
- **CI**: GitHub Actions — audit, Biome, i18n, tsc, Vitest, `ANALYZE` build, bundle budgets, Playwright E2E ( **`CI=true` = `vite preview` → frisches `dist/` nötig** ), Lighthouse CI
- **Unit**: Vitest under `tests/unit/` (serial / low-RAM friendly `vitest.config.ts`)

### Performance Targets

- Bundle: vendor/ui/query chunk splitting via Vite `manualChunks`
- Images: lazy-loaded with placeholder/skeleton states
- Lists: infinite scroll via TanStack Query `useInfiniteQuery`
- Animations: respect `prefers-reduced-motion` via Tailwind `motion-reduce:`

### Security Practices

- XSS prevention: `DOMPurify` via `utils/sanitizer.ts` for all HTML content
- CSP configured in `index.html` `<meta>` tag
- OAuth: Authorization Code + PKCE (no client secret in frontend)
- Tokens: sessionStorage with expiration validation
- No secrets in source code; use `.env.local` for API keys

---

## Current Tech Stack (installed — do NOT re-add)

- React 19, React DOM 19, React Router DOM 7
- Vite 8, @vitejs/plugin-react
- Jotai 2 (state), @tanstack/react-query 5 (server state)
- Tailwind CSS 3, PostCSS, Autoprefixer, @tailwindcss/typography
- Framer Motion 12 (animations)
- lucide-react (icons), cmdk (command palette)
- DOMPurify (XSS), @dnd-kit/\* (drag-and-drop)
- @google/genai (Gemini AI)
- Playwright, @axe-core/playwright, Vitest, Testing Library
- **Biome 2.4** — sole linter/formatter (no ESLint/Prettier in this repo)
- TypeScript 6, Zod 4

## Goal

Make this the most beautiful, fastest and most feature-rich Internet Archive frontend in 2026.
