# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # dev server at http://localhost:5173
npm run build            # production build (runs sync:locales first via prebuild)
npm run preview          # preview production build at :4173
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier
npm run format:check     # Prettier check (CI)
npm run test:e2e         # Playwright E2E (auto-starts dev server on port 4173)
npm run build:analyze    # Vite bundle analyzer (outputs bundle-report.json)
npm run sync:locales     # Copy locales/ → public/locales/, validate DE completeness
npx tsc --noEmit         # TypeScript type check
```

Build for CI/Pages (sets the base path):
```bash
VITE_BASE_PATH=/Internet-Archive-Explorer/ npm run build
```

## Architecture

### Routing and Views

**Single-page app with view-switching via Jotai atoms** — not file-based routing. `App.tsx` switches on `activeViewAtom` from `store/app.ts` to render one of 17 view components in `pages/`. React Router DOM is present but Jotai drives navigation; the `useNavigation` hook wraps view transitions.

### State Management

Four distinct layers — don't mix them:

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

### i18n System

Namespace-based runtime loading. Translations live in `locales/{en,de}/{namespace}.json`. The `prebuild` hook via `scripts/sync-locales.mjs` copies them to `public/locales/` and validates that DE has all keys from EN (fills missing with placeholder). Root `de.json`/`en.json` at project root are unused legacy files.

- Access via `useLanguage()` hook → `t('namespace:key.subkey')`
- Register new namespaces in the `NAMESPACES` array in `store/i18n.ts`
- `npm run sync:locales --check` exits non-zero if DE is missing keys (used in CI)

### Services

`services/archiveService.ts` — **all** Internet Archive API calls (retry + exponential backoff). Always consume via TanStack Query hooks in `hooks/`, never call directly from components.

`services/geminiService.ts` — Gemini AI with request throttling. OAuth is PKCE-based via `geminiAuthStorage.ts`; no client secret in frontend.

### PWA / Service Worker

`public/sw.js` multi-strategy caching:
- Navigation: Network-First, 15s timeout, offline fallback HTML
- `archive.org` API + images: Cache-First
- Static assets: Stale-While-Revalidate

`CACHE_NAME` in `sw.js` must be bumped whenever cached resources change significantly. `sw-register.js` in `index.html` is rewritten by Vite to include the base path during build.

### Vite Config and Base Path

`vite.config.js` reads `VITE_BASE_PATH` (defaults to `/Internet-Archive-Explorer/`). `@/` alias resolves to project root. Manual chunks: `react-core`, `query-core`, `ui-kit`, `state-core`, `vendor`.

### Adding a New Feature

Every new feature requires all of:

1. `pages/NewFeatureView.tsx`
2. `components/newfeature/` for sub-components (shadcn/ui style — see `components/ui/` for primitives)
3. `store/newfeature.ts` for Jotai atoms (export from `store/index.ts`)
4. `hooks/useNewFeature.ts`
5. `locales/en/newFeature.json` + `locales/de/newFeature.json` (both required)
6. Register namespace in `store/i18n.ts` → `NAMESPACES`
7. Nav entry in `components/SideMenu.tsx` / `components/BottomNav.tsx`
8. View case in `App.tsx`
9. Test stub in `tests/e2e/`

Every view must have: proper loading skeletons, error states with user-facing toast feedback, and reduced-motion variants for animations.

**Never break existing hubs**: Videothek, Audiothek, Rec Room, Images Hub, Scriptorium, Library, Web Archive, AI Archive, Storyteller.

### TypeScript

All interfaces and types live in `types.ts` (currently ~400 lines — split by domain if it grows further, don't keep adding there indefinitely). `noAny` enforced by ESLint. `tsconfig.json` uses `"ignoreDeprecations": "6.0"` to silence the TS6 `baseUrl` deprecation (path aliases handled by Vite's resolver).

## Key Conventions

- **Icons**: `lucide-react` for all UI icons; custom SVGs in `components/Icons.tsx`
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

These are already in `package.json`. Don't suggest installing them:

- **State**: `jotai`, `@tanstack/react-query`
- **UI/Animation**: `framer-motion`, `lucide-react`, `cmdk`, `@dnd-kit/*`
- **Routing**: `react-router-dom`
- **AI**: `@google/genai`
- **Security**: `dompurify`, `uuid`
- **Testing**: `@playwright/test`, `@axe-core/playwright`
- **Build**: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `typescript`, `eslint`, `prettier`

## CI Workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | push/PR to main | security audit, typecheck, build, artifact checks, Playwright E2E |
| `deploy-pages.yml` | push to main | `npm run build` → `actions/deploy-pages@v4` |
| `pages-smoke.yml` | after deploy | live URL smoke check with CDN propagation guard |

## Working Style

### Clarify before implementing architectural decisions

Hard rules govern which layer owns what (see State Management above). When a task is ambiguous — Jotai atom vs TanStack Query? new atom vs derived atom? hook vs service call? — name the tradeoff explicitly before implementing. Don't silently resolve architectural ambiguity.

### Match existing patterns exactly

Use `ia-*` Tailwind tokens (not raw hex), `safeAtomWithStorage` for persisted atoms (not raw `atomWithStorage`), the `services/ → hooks/ → components/` call chain, and `useLanguage()` for all user-facing strings. If you'd do it differently, say so — don't deviate silently.

### Surgical orphan cleanup

When your changes orphan imports, atoms, or functions: remove **only those your changes caused**. If you spot pre-existing dead code, flag it — don't delete it unless asked.

### Verification-first for bugs

Before fixing, identify which command exposes the bug: `npx tsc --noEmit`, `npm run lint`, `npm run test:e2e`, or a build check. Name the failure first, then fix. A fix with no verifiable before/after is a guess.
