# Internet Archive Explorer — Notes for AI Assistants & Cursor

This file lives in the **repository root** (`CLAUDE.md`) and describes the expected tooling state. If there is ever a conflict between chat context and the checked-out filesystem, the **current checkout** is authoritative.

---

## Current Development State (July 2026)

| Topic | Status |
|-------|--------|
| **Package Manager** | **pnpm@10.6.1** (Corepack; `packageManager` field in `package.json`) |
| **Lockfile** | `pnpm-lock.yaml` — install with `pnpm install --frozen-lockfile` |
| **Linter / Formatter** | **Biome only** (`biome.json`) — no ESLint, no Prettier in this project |
| **Cursor Pro+ / VS Code** | Extension recommendations in `.vscode/extensions.json`: `biomejs.biome`; ESLint/Prettier listed as `unwantedRecommendations`. Workspace `.vscode/settings.json`: `eslint.enable: false`, `eslint.validate: []`, Biome as default formatter, format on save/paste/type |
| **Security** | `postinstall`: `pnpm audit --audit-level=moderate \|\| true` (warns locally); CI: `pnpm audit --audit-level=moderate` + dedicated pnpm store cache (`actions/cache`); moderate+ fails CI |
| **Runtime Validation** | `types/archiveSchemas.ts` — Zod for Internet Archive and Gemini JSON; services parse with `.safeParse()` / retry (Archive); error keys under `common:serviceErrors.*` |
| **Accessibility (WCAG 2.2 AA)** | `index.css` — `forced-colors`, `.touch-target-min`, `.ia-focus-visible-enhanced`; async regions with `aria-busy` / `aria-live`; E2E `tests/e2e/a11y.spec.ts` including `wcag22aa` across multiple hubs |
| **CI Extras** | **Lighthouse CI** (`lighthouserc.json`, `@lhci/cli` via `npx`) after E2E — Accessibility ≥ 0.95; **PWA manifest** `public/manifest.json` → `dist/manifest.json`; local icons/screenshots under `public/icons/`, `public/screenshots/` (`pnpm run generate:pwa-assets`) |
| **Cursor** | Project rules `.cursor/rules/internet-archive-explorer.mdc` (`alwaysApply`) complement **CLAUDE.md** / **CONTRIBUTING.md** |
| **Downloads** | Persistent queue with cap `DOWNLOAD_QUEUE_MAX_ITEMS` (`store/downloads.ts`); oldest `done`/`error`/`queued` entries are evicted |
| **Fetching Resilience** | `utils/fetchWithRetry.ts` with exponential backoff + jitter; `utils/requestQueue.ts` caps archive.org concurrency; IA TanStack Query defaults use `retry: 0` because the service layer already retries |

### Important Commands

```bash
pnpm install --frozen-lockfile   # reproducible
pnpm run dev                     # Vite dev server
pnpm run build                   # production build (sync:locales via prebuild)
pnpm run lint                    # biome check .
pnpm run lint:ci                 # biome ci (same as CI)
pnpm run check                   # biome ci + tsc + vitest run
pnpm run lint:fix                # biome check --write .
pnpm run format                  # biome format --write .
pnpm run format:check            # biome format .
pnpm run test:unit               # Vitest (serial / single worker)
pnpm run test:e2e                # Playwright — with CI=true: vite preview → run `pnpm run build` + matching VITE_BASE_PATH first
pnpm audit --audit-level=moderate
pnpm run audit        # same audit level as CI
pnpm run audit:fix    # pnpm audit fix --audit-level=moderate
```

Detailed editor guide (global ESLint config vs. workspace): **CONTRIBUTING.md** → *Cursor Pro+ Setup*. Cloud agent guide: **AGENTS.md**.

### Short Reference for Agents

1. **pnpm only** — no npm/yarn commands in scripts or docs.
2. **Biome only** — lint/format via Biome CLI; **`noExplicitAny`** and **`useExhaustiveDependencies`** are **errors**; `pnpm run lint:ci` must produce no warnings.
3. **PR bots** — address CodeAnt/Socket/review comments in the same PR.
4. **Workspace overrides global** — `.vscode/settings.json` intentionally silences ESLint for this repo.
5. **`graphify-out/`** is generated — excluded from lint in `biome.json`; do not manually maintain.
6. **Deployment** — GitHub Pages primary; Vercel optional — see **docs/DEPLOYMENT.md**.

### Parent / Host CLAUDE.md

If a **parent** `CLAUDE.md` exists elsewhere on the machine (for example `/home/pc/CLAUDE.md`), it may contain workspace-crossing rules (e.g. global graphify settings). This **repo-level `CLAUDE.md`** takes precedence for this project's version and tooling details.

---

## Architecture

### Routing and Views

**Single-page app with view-switching via Jotai atoms** — not file-based routing. `App.tsx` switches on `activeViewAtom` from `store/app.ts` to render one of 17 view components in `pages/`. React Router DOM is present but Jotai drives navigation; the `useNavigation` hook wraps view transitions.

### State Management

Four distinct layers — do not mix them:

| Layer | Tool | Use for |
|-------|------|---------|
| Server state | TanStack Query v5 `useQuery` / `useInfiniteQuery` | Archive API responses, infinite scroll |
| Global persistent state | Jotai + `safeAtomWithStorage` | Theme, language, library, settings |
| Feature state | Jotai atoms (not persisted) | Audio player, search, downloads, AI archive |
| Local UI state | `useState` | Modals, form inputs, hover |

Key rules:

- **Never cache API data in atoms** — that's TanStack Query's job. All list views use `useInfiniteQuery`.
- **`safeAtomWithStorage`** (in `store/safeStorage.ts`) for all persisted atoms — it degrades gracefully when localStorage is unavailable. Don't use raw `atomWithStorage`.
- **Derived state**: use `selectAtom` or read-only derived atoms (not effects) to avoid unnecessary re-renders.
- **Token storage**: OAuth tokens → `sessionStorage` (not persisted across tabs); user preferences → `localStorage` via `safeAtomWithStorage`.

### Data Fetching Resilience

- `services/archiveService.ts` is the single place for Internet Archive API calls.
- `utils/fetchWithRetry.ts` provides per-request retries with exponential backoff + jitter and `Retry-After` awareness for 429s.
- `utils/requestQueue.ts` caps concurrent archive.org requests to reduce rate-limit pressure.
- TanStack Query IA defaults set `retry: 0` so the service layer remains the source of retry truth and request multiplication is avoided.

### i18n System

Namespace-based runtime loading. Translations live in `locales/{en,de}/{namespace}.json`. The `prebuild` hook via `scripts/sync-locales.mjs` copies them to `public/locales/` and validates that DE has all keys from EN (fills missing keys with placeholders).

- Access via `useLanguage()` hook → `t('namespace:key.subkey')`
- Register new namespaces in the `NAMESPACES` array in `store/i18n.ts`
- `pnpm run check:i18n` exits non-zero if DE is missing keys (used in CI)

### Services

`services/archiveService.ts` — **all** Internet Archive API calls (retry, exponential backoff, concurrency cap, validation). Always consume via TanStack Query hooks in `hooks/`, never call directly from components.

`services/geminiService.ts` — Gemini AI with request throttling. OAuth is PKCE-based via `geminiAuthStorage.ts`; no client secret in frontend.

### PWA / Service Worker

`public/sw.js` multi-strategy caching (network-first navigation, SWR for API/static where configured). **IA JSON/API** uses a longer network timeout than images so slow `advancedsearch`/`metadata` responses are not cut off at 15s. Keep `archiveService` `REQUEST_TIMEOUT_MS` slightly above that value. Bump `CACHE_VERSION` when cache behavior changes. `public/sw-register.js` is loaded from `index.html` with the base path.

### Vite Config and Base Path

`vite.config.js` reads `VITE_BASE_PATH` (defaults to `/Internet-Archive-Explorer/`). `@/` alias resolves to project root. Manual chunks: `react-core`, `query-core`, `ui-kit`, `state-core`, `vendor`.

### Adding a New Feature

Every new feature requires all of:

1. `pages/NewFeatureView.tsx`
2. `components/newfeature/` for sub-components (see `components/ui/` for primitives)
3. `store/newfeature.ts` for Jotai atoms (export from `store/index.ts`)
4. `hooks/useNewFeature.ts`
5. `locales/en/newFeature.json` + `locales/de/newFeature.json` (both required)
6. Register namespace in `store/i18n.ts` → `NAMESPACES`
7. Navigation in `components/SideMenu.tsx` / `components/BottomNav.tsx`
8. View case in `App.tsx`
9. Test stub in `tests/e2e/`

Every view must have: proper loading skeletons, error states with user-facing toast feedback, and reduced-motion variants for animations.

**Never break existing hubs:** Videothek, Audiothek, Rec Room, Images Hub, Scriptorium, Library, Web Archive, AI Archive, Storyteller.

### TypeScript

Interfaces and types live in `types.ts`. **`noExplicitAny`** is enforced by Biome. Path aliases are resolved by Vite. If you add more than ~20 lines to `types.ts`, consider splitting by domain.

## Key Conventions

- **Icons**: `lucide-react` for all UI icons; custom SVGs only in `components/Icons.tsx`
- **XSS**: all HTML content → `DOMPurify` via `utils/sanitizer.ts`
- **Animations**: Framer Motion 12; always pair with `motion-reduce:` Tailwind variant
- **Tailwind**: use `ia-*` color tokens from `tailwind.config.js`, not raw hex/RGB values
- **Accessibility target**: **WCAG 2.2 AA** — semantic HTML, aria labels, focus management, `aria-busy` on loading regions, live regions for dynamic content. E2E a11y checks via `@axe-core/playwright`.
- **Security**: CSP is a `<meta http-equiv>` tag in `index.html` (not a server header) — changes there affect what the browser permits
- **Environment**: secrets in `.env.local` (git-ignored); see `.env.example` for key names

## Known Tech Debt (don't add more)

- **Dual toast system**: both `store/toast.ts` (Jotai atom) and `contexts/ToastContext.tsx` exist — don't add a third approach; use whichever is already used in the file you're editing
- **`types.ts` monolith**: ~400 lines; flag when adding more than ~20 new lines and consider splitting by domain
- **No API base client**: `archiveService.ts` constructs URLs directly — don't replicate this pattern; note it and propose an abstraction if touching that service

## Installed Packages — Do Not Re-Add

These are already in `package.json`. Don't suggest installing duplicates:

- **State**: `jotai`, `@tanstack/react-query`
- **UI/Animation**: `framer-motion`, `lucide-react`, `cmdk`, `@dnd-kit/*`
- **Routing**: `react-router-dom`
- **AI**: `@google/genai`
- **Security**: `dompurify`, `uuid`
- **Testing**: `@playwright/test`, `@axe-core/playwright`
- **Build / quality**: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `typescript`, **Biome** (`@biomejs/biome`)

## CI Workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | push/PR to main | security audit, Biome CI, typecheck, build, bundle budgets, Playwright E2E, Lighthouse CI |
| `deploy-pages.yml` | push to main | `pnpm run build` → `actions/deploy-pages@v4` |
| `pages-smoke.yml` | after deploy | live URL smoke check with CDN propagation guard |

## Working Style

### Clarify before implementing architectural decisions

Hard rules govern which layer owns what (see State Management above). When a task is ambiguous — Jotai atom vs TanStack Query? new atom vs derived atom? hook vs service call? — name the tradeoff explicitly before implementing.

### Match existing patterns exactly

Use `ia-*` Tailwind tokens (not raw hex), `safeAtomWithStorage` for persisted atoms (not raw `atomWithStorage`), the `services/ → hooks/ → components/` call chain, and `useLanguage()` for all user-facing strings.

### Verification-first for bugs

Before fixing, identify which command exposes the bug: `pnpm exec tsc --noEmit`, `pnpm run lint:ci`, `pnpm run test:e2e`, or a build check. Name the failure first, then fix.

---

*Last updated: July 2026 — always treat the current checkout of this file, `CONTRIBUTING.md`, and `docs/DEPLOYMENT.md` as authoritative.*
