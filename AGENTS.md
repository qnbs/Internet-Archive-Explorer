# AGENTS.md — Internet Archive Explorer

Kurzreferenz für Cloud Agents und KI-Assistenten. Ausführliche Regeln: **`CLAUDE.md`**, **`CONTRIBUTING.md`**, **`.cursor/rules/internet-archive-explorer.mdc`**.

## Produkt

Client-only **React 19 + Vite 8 SPA** (pnpm, Biome, Jotai, TanStack Query). Kein Backend, keine Docker-Compose-Stack. Deployment: GitHub Pages unter `/Internet-Archive-Explorer/`.

## Cursor Cloud specific instructions

### pnpm / Corepack

- Pin: **`pnpm@10.6.1`** (`packageManager` in `package.json`).
- **`corepack enable`** ist vorgesehen; falls Corepack pnpm von `registry.npmjs.org` nicht laden kann (TLS/`ECONNRESET`), pnpm einmalig über GitHub installieren und vor Corepack-Shims in den PATH legen:

```bash
mkdir -p ~/.local/bin
gh release download v10.6.1 -R pnpm/pnpm -p 'pnpm-linux-x64' -D ~/.local/bin --clobber
mv ~/.local/bin/pnpm-linux-x64 ~/.local/bin/pnpm && chmod +x ~/.local/bin/pnpm
export PATH="$HOME/.local/bin:$PATH"
export COREPACK_ENABLE_AUTO_PIN=0
```

Danach reicht für Dependency-Refresh: **`pnpm install --frozen-lockfile`**.

### Build-Skripte (esbuild)

pnpm 10 kann **`esbuild`**-Postinstall-Skripte blockieren. Nach der ersten Installation ggf. **`pnpm rebuild esbuild`** ausführen, wenn `vite build`/`vite dev` an fehlendem esbuild scheitert. **`pnpm approve-builds`** nicht interaktiv in Automatisierung verwenden.

### Dev-Server

| Befehl | URL |
|--------|-----|
| `pnpm run dev` | http://localhost:5173/Internet-Archive-Explorer/ |
| `pnpm run preview` (nach Build) | http://localhost:4173/Internet-Archive-Explorer/ |

**Base path:** Standard ist `/Internet-Archive-Explorer/` (`VITE_BASE_PATH`). Lokal ohne Anpassung immer mit diesem Pfad öffnen, nicht nur `/`.

Optional tmux für langlebige Prozesse: `tmux -f /exec-daemon/tmux.portal.conf`.

### E2E (Playwright)

- Browser: `pnpm exec playwright install --with-deps chromium` (einmalig, schwer).
- **CI-Parität:** zuerst `ANALYZE=true VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build`, dann  
  `CI=true PLAYWRIGHT_BASE_PATH=/Internet-Archive-Explorer/ pnpm run test:e2e`.
- Playwright startet intern Vite auf **4173** (`playwright.config.ts`).

### Externe APIs

- **Internet Archive** (`archive.org`, `web.archive.org`): für Suche/Hubs nötig; Node-`fetch` funktioniert in der Cloud-VM.
- **Gemini / Google OAuth**: optional (`VITE_API_KEY`, `VITE_GOOGLE_CLIENT_ID` in `.env.local`); E2E nutzt Fake-Keys.

### Standard-Checks (siehe `CONTRIBUTING.md`)

```bash
pnpm run lint:ci
pnpm exec tsc --noEmit
pnpm run check:i18n
pnpm run test:unit
ANALYZE=true VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build
pnpm run check:bundle-size   # nach ANALYZE-Build
```

### Hello-World-Smoke (Kernfunktion)

1. Dev-Server starten → App unter `/Internet-Archive-Explorer/` laden.
2. Globale Suche: z. B. **`library`** → Ergebnisliste mit Trefferzahl von archive.org.
3. Optional: Sidebar-Hub (z. B. **Videothek**) — View-Wechsel über Jotai-Navigation.

Keine `.env.local` für diesen Smoke nötig.
