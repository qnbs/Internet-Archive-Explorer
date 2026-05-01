# Internet Archive Explorer — Hinweise für KI-Assistenten & Cursor

Diese Datei liegt **im Repository-Root** (`CLAUDE.md`) und beschreibt den erwarteten Tooling-Stand. Bei Diskrepanzen zwischen Chat-Kontext und Dateisystem gilt der **aktuelle Checkout** als maßgeblich.

---

## Aktueller Entwicklungszustand (Mai 2026)

| Thema | Stand |
| ----- | ----- |
| **Package Manager** | **pnpm@10.6.1** (Corepack; Feld `packageManager` in `package.json`) |
| **Lockfile** | `pnpm-lock.yaml` — Installation mit `pnpm install --frozen-lockfile` |
| **Linter / Formatter** | **ausschließlich Biome** (`biome.json`) — **kein** ESLint, **kein** Prettier im Projekt |
| **Cursor Pro+ / VS Code** | Extension-Empfehlungen in **`.vscode/extensions.json`**: `biomejs.biome`; ESLint/Prettier als `unwantedRecommendations`. Workspace-**`.vscode/settings.json`**: `eslint.enable: false`, `eslint.validate: []`, Biome als Default-Formatter, Format on Save/Paste/Type |
| **Security** | `postinstall`: `pnpm audit --audit-level=moderate \|\| true` (warnt lokal); CI: `pnpm audit --audit-level=moderate` + dedizierter **pnpm store**-Cache (`actions/cache`); moderate+ schlägt fehl — siehe CHANGELOG |
| **Graphify** | Wenn `graphify-out/` vorhanden: vor Architekturfragen `GRAPH_REPORT.md` / Wiki lesen; nach Codeänderungen **`graphify update .`** (AST, ohne API-Kosten), sofern das Projekt graphify nutzt |
| **Runtime-Validation** | **`types/archiveSchemas.ts`** — Zod für Internet-Archive- und Gemini-JSON; Services parsen mit `.safeParse()` / Retry (Archive); Fehler-Keys unter `common:serviceErrors.*` |
| **Accessibility (WCAG 2.2 AA)** | **`index.css`** — `forced-colors`, `.touch-target-min`, `.ia-focus-visible-enhanced`; async Bereiche mit `aria-busy` / `aria-live`; **E2E** `tests/e2e/a11y.spec.ts` inkl. `wcag22aa` |

### Wichtige Befehle

```bash
pnpm install --frozen-lockfile   # reproduzierbar
pnpm run dev                     # Vite Dev Server
pnpm run build                   # Produktionssbuild (sync:locales via prebuild)
pnpm run lint                    # biome check .
pnpm run lint:ci                 # biome ci (wie CI)
pnpm run check                   # biome ci + tsc
pnpm run lint:fix                # biome check --write .
pnpm run format                  # biome format --write .
pnpm run format:check            # biome format .
pnpm run test:e2e                # Playwright
pnpm audit --audit-level=moderate
pnpm run audit        # gleicher Audit-Level wie CI
pnpm run audit:fix    # pnpm audit fix --audit-level=moderate
```

Ausführliche Editor-Anleitung (globale ESLint-Konfig vs. Workspace): **`CONTRIBUTING.md`** → Abschnitt *Cursor Pro+ Setup*.

---

## Kurzfassung für Agents

1. **pnpm only** — keine npm-/yarn-Befehle in Skripten oder Doku.
2. **Biome only** — Lint/Format über Biome-CLI und die **biomejs.biome**-Extension; keine neuen ESLint-/Prettier-Regeln hinzufügen.
3. **Workspace überschreibt global** — `.vscode/settings.json` bewusst ESLint stumm für dieses Repo.
4. **`graphify-out/`** ist generiert — in `biome.json` vom Lint ausgeschlossen; nicht manuell „pflegen“.

---

## Parent / Host `CLAUDE.md`

Wenn auf der Maschine zusätzlich eine **übergeordnete** `CLAUDE.md` (z. B. unter `/home/pc/CLAUDE.md`) existiert, können dort **workspace-übergreifende** Regeln stehen (z. B. graphify global). Diese **Repo-`CLAUDE.md`** hat für **dieses Projekt** Vorrang bei Versions- und Tooling-Details.

---

## Architecture (English reference)

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

Namespace-based runtime loading. Translations live in `locales/{en,de}/{namespace}.json`. The `prebuild` hook via `scripts/sync-locales.mjs` copies them to `public/locales/` and validates that DE has all keys from EN (fills missing with placeholder).

- Access via `useLanguage()` hook → `t('namespace:key.subkey')`
- Register new namespaces in the `NAMESPACES` array in `store/i18n.ts`
- `pnpm run check:i18n` exits non-zero if DE is missing keys (used in CI)

### Services

`services/archiveService.ts` — **all** Internet Archive API calls (retry + exponential backoff). Always consume via TanStack Query hooks in `hooks/`, never call directly from components.

`services/geminiService.ts` — Gemini AI with request throttling. OAuth is PKCE-based via `geminiAuthStorage.ts`; no client secret in frontend.

### PWA / Service Worker

`public/sw.js` multi-strategy caching (network-first navigation, SWR for API/static where configured). Bump cache names when cached resources change significantly. `public/sw-register.js` is loaded from `index.html` with base path.

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
7. Nav entry in `components/SideMenu.tsx` / `components/BottomNav.tsx`
8. View case in `App.tsx`
9. Test stub in `tests/e2e/`

Every view must have: proper loading skeletons, error states with user-facing toast feedback, and reduced-motion variants for animations.

**Never break existing hubs**: Videothek, Audiothek, Rec Room, Images Hub, Scriptorium, Library, Web Archive, AI Archive, Storyteller.

### TypeScript

Interfaces and types live in `types.ts`. **`noExplicitAny`** is enforced by Biome. Path aliases are resolved by Vite.

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
| `ci.yml` | push/PR to main | security audit, Biome CI, typecheck, build, bundle budgets, Playwright E2E |
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

## Unreleased (highlights)

- 📱 PWA perfektioniert (Cache-Limits, Offline-First, verbesserter Update-Flow)
