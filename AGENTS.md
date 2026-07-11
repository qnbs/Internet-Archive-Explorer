# AGENTS.md — Internet Archive Explorer

Quick reference for AI coding agents working on this project. Expected tools: **pnpm**, **Biome**, **Vite**, **Vitest**, **Playwright**. Detailed rules and current development status are in **CLAUDE.md** and **CONTRIBUTING.md**; deployment details are in **docs/DEPLOYMENT.md**.

## 1. Project Overview

**Internet Archive Explorer** is a client-only **React 19 + TypeScript 6 + Vite 8** single-page application (SPA). It runs as an installable **Progressive Web App (PWA)** with English and German interfaces and is primarily delivered on **GitHub Pages** under the base path `/Internet-Archive-Explorer/`. An optional Vercel mirror uses root path (`/`).

### Core Features

- Global search with filters and detail modals against archive.org
- Content hubs: Videothek, Audiothek, Images Hub, Rec Room, Web Archive, Storyteller
- Personal library with favorites, tags, collections, notes, and bulk actions
- Scriptorium workspace with document workflows and optional AI helpers
- AI Archive for generated summaries / insights
- Optional Gemini integration as **Bring Your Own Key** (BYOK) in App Settings
- Uploader Hub with curated contributor profiles

### Architecture at a Glance

- **No backend.** All data comes directly from public APIs at `archive.org` and `web.archive.org`. Optional calls go to `generativelanguage.googleapis.com` / `oauth2.googleapis.com`.
- **Routing:** View switching via the Jotai atom `activeViewAtom` in `store/app.ts`, not file-based routing. React Router DOM is installed, but Jotai drives navigation.
- **State Layers:**
  - Server state: TanStack Query v5 (`useQuery` / `useInfiniteQuery`)
  - Global persistent state: Jotai + `safeAtomWithStorage` (`store/safeStorage.ts`)
  - Feature state: Jotai atoms (e.g. Audio Player, Downloads, Search, AI Archive)
  - Local UI state: `useState`

## 2. Technology Stack

| Area | Choice | Configuration |
|------|--------|---------------|
| Runtime | Node.js 22+ | recommended with Corepack |
| Package Manager | pnpm 10.6.1 | `packageManager` in `package.json`; lockfile `pnpm-lock.yaml` |
| Framework | React 19.1.1 | JSX transform `react-jsx` |
| Language | TypeScript 6.0.2 | `tsconfig.json`: `strict`, `noUnusedLocals`, `noUnusedParameters` |
| Build Tool | Vite 8.1.2 | `vite.config.js` |
| State | Jotai 2.14.0 | `store/` |
| Server State | TanStack Query 5.90.21 | `index.tsx`, `hooks/useInfiniteArchive.ts` |
| Styling | Tailwind CSS 3.4.19 | `tailwind.config.js`, `postcss.config.js` |
| Animation | Framer Motion 12.35.1 | |
| Icons | lucide-react 1.8.0 | Custom SVGs in `components/Icons.tsx` |
| Linter / Formatter | Biome 2.4.13 | `biome.json` — **only** Biome, no ESLint/Prettier |
| Unit Tests | Vitest 4.1.0 | `vitest.config.ts`, `@vitest/coverage-v8` |
| E2E Tests | Playwright 1.52.0 | `playwright.config.ts`, `@axe-core/playwright` |
| Runtime Validation | Zod 4.4.1 | `types/archiveSchemas.ts` |
| DnD | `@dnd-kit/*` | Library, collections |
| AI SDK | `@google/genai` 1.19.0 | `services/geminiService.ts` |
| XSS Protection | DOMPurify | `utils/sanitizer.ts` |

## 3. Project Structure

```text
/
├── App.tsx                 # Root component: view switch, layout, PWA logic
├── index.tsx               # React root, QueryClient setup
├── index.html              # HTML template, CSP, SEO, PWA links
├── types.ts                # Central TypeScript types (monolithic, ~400 lines)
├── types/archiveSchemas.ts # Zod schemas for Archive.org and Gemini JSON
├── package.json            # Scripts and dependencies
├── vite.config.js          # Vite + bundle analyzer, base path, manual chunks
├── vitest.config.ts        # Unit test config (jsdom, serial, coverage)
├── playwright.config.ts    # E2E config (Chromium, baseURL on port 4173)
├── biome.json              # Linter / formatter rules
├── tailwind.config.js      # Theme tokens (ia-*, accent-*, sepia-*)
├── postcss.config.js       # Tailwind + autoprefixer
├── lighthouserc.json       # Lighthouse CI (Accessibility ≥ 0.95)
├── vercel.json             # SPA rewrites, cache headers (optional)
│
├── components/             # React components, grouped by feature
│   ├── ui/                 # Primitives (Button, Card, Modal, ThemeToggle)
│   ├── ai-archive/         # AI-Archive components
│   ├── audiothek/          # Audio player, cards, hero
│   ├── favorites/          # Favorites widgets
│   ├── help/               # Help view
│   ├── library/            # Library (lists, cards, dashboard, modals)
│   ├── modals/             # Install modal
│   ├── pwa/                # Offline banner, worker bridge
│   ├── recroom/            # Games hub
│   ├── scriptorium/        # Document workspace
│   ├── settings/           # Settings components
│   ├── uploader/           # Uploader profile / tabs
│   └── videothek/          # Video hub
│
├── contexts/               # React Contexts (Toast, HelpView, ItemDetail)
├── hooks/                  # Reusable hooks (data fetching, UI, navigation)
├── pages/                  # 17 View components, lazy-loaded in App.tsx
├── services/               # API and storage services
├── store/                  # Jotai atoms (per feature), central exports in index.ts
├── utils/                  # Helpers (fetch, sanitizer, logger, formatter)
├── locales/                # i18n namespaces (en/, de/); synced to public/locales/
├── public/                 # Static assets (PWA manifest, service worker, icons)
├── scripts/                # Build / sync / check scripts
├── tests/                  # Unit tests and E2E tests
├── docs/                   # Deployment, branch protection, release process
└── .github/workflows/      # CI, Pages deploy, Pages smoke, Vercel deploy
```

## 4. Build, Dev, and Test Commands

### Installation

```bash
# Corepack enables the pinned pnpm version from package.json
pnpm install --frozen-lockfile
```

If Corepack cannot load pnpm (TLS / `ECONNRESET`):

```bash
mkdir -p ~/.local/bin
gh release download v10.6.1 -R pnpm/pnpm -p 'pnpm-linux-x64' -D ~/.local/bin --clobber
mv ~/.local/bin/pnpm-linux-x64 ~/.local/bin/pnpm && chmod +x ~/.local/bin/pnpm
export PATH="$HOME/.local/bin:$PATH"
export COREPACK_ENABLE_AUTO_PIN=0
```

pnpm 10 may block `esbuild` postinstall. If the binary is missing:

```bash
pnpm rebuild esbuild
```

### Development

```bash
pnpm run dev                         # http://localhost:5173
```

GitHub parity locally:

```bash
pnpm run dev --host 127.0.0.1 --port 5173   # http://127.0.0.1:5173/Internet-Archive-Explorer/
VITE_BASE_PATH=/ pnpm run dev --host 127.0.0.1 --port 5173   # root path (Vercel-like)
```

### Build

```bash
pnpm run build                       # production build; prebuild sync:locales
pnpm run build:analyze               # ANALYZE=true vite build
pnpm run preview                     # Vite preview (port 4173)
```

### Code Quality

```bash
pnpm run lint                        # biome check .
pnpm run lint:ci                     # biome ci (same as CI)
pnpm run lint:fix                    # biome check --write .
pnpm run format                      # biome format --write .
pnpm run format:check                # biome format .
pnpm run check                       # biome ci + tsc --noEmit + vitest run
```

### i18n

```bash
pnpm run sync:locales                # locales/ -> public/locales/ + fill DE gaps with placeholders
pnpm run check:i18n                  # CI mode: fail if DE is missing keys
```

### Tests

```bash
pnpm run test:unit                   # Vitest (serial, single worker)
pnpm run test:unit:coverage          # with coverage thresholds from vitest.config.ts
pnpm run test:unit:watch             # watch mode
pnpm run test:e2e                    # Playwright (local: Vite dev server; CI: vite preview)
```

Install Playwright browsers once:

```bash
pnpm exec playwright install --with-deps chromium
```

### Bundle Size

```bash
ANALYZE=true VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build
pnpm run check:bundle-size           # budgets from .github/bundle-budgets.json
```

### Security

```bash
pnpm audit --audit-level=moderate
pnpm run audit                       # same command
pnpm run audit:fix                   # pnpm audit fix --audit-level=moderate
```

### Full Local Gate (CI parity)

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm run lint:ci
pnpm run check:i18n
pnpm exec tsc --noEmit
pnpm run test:unit
ANALYZE=true VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build
pnpm run check:bundle-size
CI=true PLAYWRIGHT_BASE_PATH=/Internet-Archive-Explorer/ pnpm run test:e2e
```

## 5. Code Style and Conventions

### Linter / Formatter

- **Only Biome** (`biome.json`). No ESLint, no Prettier, no new ESLint rules or plugins.
- Formatter: 2 spaces, LF, max 100 chars, single quotes, trailing commas, semicolons.
- Strict linter rules (all `error`):
  - `suspicious.noExplicitAny`
  - `correctness.useExhaustiveDependencies`
  - `correctness.useHookAtTopLevel`
  - `correctness.noUnusedVariables`
- Exception: in `tests/**/*.ts` and `tests/**/*.tsx`, `useExhaustiveDependencies` is disabled.

### Imports

- Path alias `@/` resolves to project root (`vite.config.js` + `tsconfig.json`).
- `biome assist` organizes imports automatically on save (`source.organizeImports.biome`).

### State Management

- **Never cache API data in Jotai atoms** — that is TanStack Query's job.
- Persisted atoms only via `safeAtomWithStorage` (`store/safeStorage.ts`), not raw `atomWithStorage`.
- OAuth tokens only in `sessionStorage`; user settings via `safeAtomWithStorage` in `localStorage`.
- Derived state with `selectAtom` or pure read-only derived atoms, not with effects.

### Data Fetching

- `services/archiveService.ts` is the single place for Internet-Archive API calls (retry + exponential backoff + concurrency cap + Zod validation).
- Services are consumed only through TanStack Query hooks in `hooks/`, never directly from components.
- Standard timeouts: Service Worker `API_NETWORK_TIMEOUT_MS` > `archiveService` `REQUEST_TIMEOUT_MS` (32s).

### UI/UX

- User-facing strings always via `useLanguage()` with namespace keys (`t('namespace:key.subkey')`).
- Colors via Tailwind tokens `ia-*`, `accent-*`, or `sepia-*`; no raw hex values.
- All icons from `lucide-react`; custom SVGs only in `components/Icons.tsx`.
- Animations always with `motion-reduce:` variant or `@media (prefers-reduced-motion: reduce)`.
- Target size for controls: 24×24 px (E2E check).
- HTML content always passes through `utils/sanitizer.ts` (`DOMPurify`).

### i18n

- Every new namespace must be registered in `store/i18n.ts` (`NAMESPACES`).
- Both languages (`locales/en/*.json` and `locales/de/*.json`) must exist.
- Build synchronizes locales via `pnpm run sync:locales`.

### Feature Checklist

When adding a new feature, touch all of the following:

1. `pages/NewFeatureView.tsx`
2. `components/newfeature/` for subcomponents
3. `store/newfeature.ts` (and export in `store/index.ts`)
4. `hooks/useNewFeature.ts`
5. `locales/en/newFeature.json` + `locales/de/newFeature.json`
6. Register namespace in `store/i18n.ts`
7. Navigation in `components/SideMenu.tsx` and `components/BottomNav.tsx`
8. View case in `App.tsx`
9. E2E test stub in `tests/e2e/`

## 6. Testing Strategy

### Unit Tests

- Location: `tests/unit/**/*.test.{ts,tsx}`
- Framework: Vitest with `jsdom`, `@testing-library/react`
- Config: `pool: 'forks'`, `maxWorkers: 1`, `fileParallelism: false` (weak dev hardware / CI friendly)
- Coverage provider: v8
- Covered areas: `services/`, `utils/`, `store/`, `hooks/`
- Specific coverage thresholds for:
  - `services/archiveService.ts`
  - `utils/fetchWithRetry.ts`
  - `store/safeStorage.ts`
  - `store/downloads.ts`
  - `services/geminiApiKeyStorage.ts`

### E2E Tests

- Location: `tests/e2e/*.spec.ts`
- Framework: Playwright with Chromium
- `playwright.config.ts`:
  - `baseURL` on port 4173
  - `fullyParallel: false`, `workers: 1`, `retries: 1`
  - WebServer: with `CI=true` uses `vite preview` (build required first); locally reuses an existing dev server on :4173
- `smoke.spec.ts`: navigation, API-key storage, uploader hub
- `a11y.spec.ts`: axe scans on 15+ views including `wcag22aa`, skip link, focus trap, forced colors, minimum target size

### CI Gate

GitHub Actions `.github/workflows/ci.yml` runs:

1. `pnpm install --frozen-lockfile`
2. `pnpm audit --audit-level=moderate`
3. `pnpm run lint:ci`
4. `pnpm run check:i18n`
5. `pnpm exec tsc --noEmit`
6. `pnpm run test:unit:coverage`
7. `ANALYZE=true VITE_BASE_PATH=/<repo>/ pnpm run build`
8. Verify `dist/index.html`, `dist/sw.js`, `dist/.nojekyll`, `dist/locales/...`, `dist/manifest.json`, icons, screenshots
9. `pnpm run check:bundle-size`
10. Playwright E2E with `CI=true`
11. Lighthouse CI (Accessibility ≥ 0.95)

## 7. Security

- **No OAuth client secret in the frontend.** OAuth uses Authorization Code + PKCE.
- **Gemini BYOK:** API keys are entered in the app and held only in browser `sessionStorage`. They are **not** embedded in the shipped bundle.
- There is no `VITE_API_KEY` for production builds. Optional dev fallback only with `VITE_ALLOW_BUILD_TIME_GEMINI_KEY=true`.
- Secrets belong in `.env.local` (git-ignored); template: `.env.example`.
- CSP is set as a `<meta http-equiv="Content-Security-Policy">` tag in `index.html` (no server header possible with static hosting).
- HTML from external sources is sanitized with `DOMPurify` (`utils/sanitizer.ts`).
- `pnpm audit --audit-level=moderate` runs in `postinstall` and blocks CI on moderate+ vulnerabilities.

## 8. Deployment

### GitHub Pages (primary)

- Trigger: push to `main` or manual → `.github/workflows/deploy-pages.yml`
- Build with `VITE_BASE_PATH=/<repo-name>/`
- `dist/` is published via `actions/deploy-pages@v4`
- Repository setting: **Settings → Pages → Build and deployment → Source: GitHub Actions** (not "Deploy from a branch")

### Pages Smoke Checks

- `.github/workflows/pages-smoke.yml` runs after a successful deploy
- Checks live: HTML contains bundled JS, `sw.js`, `manifest.json`, icons, locales
- CDN propagation guard: 20 attempts × 15 seconds

### Vercel (optional)

- `vercel.json`: SPA rewrites, cache headers for `sw.js`/`manifest.json`/icons
- Optional GitHub Actions workflow `.github/workflows/vercel-deploy.yml` (skipped if `VERCEL_*` secrets are missing)
- On Vercel: `VITE_BASE_PATH=/`

### Legacy

```bash
pnpm run deploy   # gh-pages branch — prefer GitHub Actions
```

## 9. Important Files for Agents

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Detailed architecture, state layers, feature checklist, known tech debt |
| `CONTRIBUTING.md` | Local setup, editor config, commit format, PR workflow |
| `docs/DEPLOYMENT.md` | GitHub Pages + Vercel step-by-step |
| `docs/branch-protection.md` | Recommended GitHub branch protection |
| `docs/release-process.md` | Semantic-versioning release process |
| `.cursor/rules/internet-archive-explorer.mdc` | Cursor-specific project rules |
| `.vscode/settings.json` | ESLint disabled, Biome as default formatter |
| `.github/bundle-budgets.json` | Brotli size budgets per chunk |
| `.github/release.yml` | Categories for auto-release notes |

## 10. Known Tech Debt (do not enlarge)

- **Toast dual system:** Both `store/toast.ts` (Jotai) and `contexts/ToastContext.tsx` (React Context) exist. Do not add a third system; use whichever is already used in the file you are editing.
- **`types.ts` monolith:** ~400 lines. If you add more than ~20 new lines, consider a domain split.
- **No API base client:** `archiveService.ts` builds URLs directly. Do not replicate this pattern; when touching the service, propose an abstraction.

## 11. Hello-World Smoke

1. Start the dev server and load the app under `/Internet-Archive-Explorer/`.
2. **Explore:** open a card from "On This Day" → check the detail modal.
3. Global search: e.g. `library` → results from archive.org.
4. Optional: sidebar hub (e.g. **Videothek**) — Jotai navigation.

## 12. External APIs

- **Internet Archive** (`https://archive.org`, `https://web.archive.org`) — required for search / hubs
- **Gemini / Google OAuth** (`https://generativelanguage.googleapis.com`, `https://oauth2.googleapis.com`, `https://accounts.google.com`) — optional; E2E uses fake keys

---

*Last updated: July 2026 — always treat the current checkout of `CLAUDE.md`, `CONTRIBUTING.md`, and `docs/DEPLOYMENT.md` as authoritative.*
