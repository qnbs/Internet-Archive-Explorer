# AGENTS.md — Internet Archive Explorer

Kurzreferenz für **Cursor Cloud Agents** und KI-Assistenten. Ausführliche Regeln: **`CLAUDE.md`**, **`CONTRIBUTING.md`**, **`.cursor/rules/internet-archive-explorer.mdc`**, Deployment: **`docs/DEPLOYMENT.md`**.

## Produkt

Client-only **React 19 + Vite 8 SPA** (pnpm, Biome, Jotai, TanStack Query). Kein Backend. Deployment: **GitHub Pages** unter `/Internet-Archive-Explorer/`; optional **Vercel** mit `VITE_BASE_PATH=/`.

## Cursor Cloud specific instructions

### pnpm / Corepack

- Pin: **`pnpm@10.6.1`** (`packageManager` in `package.json`).
- Standard: `corepack enable` → `pnpm install --frozen-lockfile`.
- Falls Corepack pnpm nicht laden kann (TLS/`ECONNRESET`), pnpm einmalig von GitHub:

```bash
mkdir -p ~/.local/bin
gh release download v10.6.1 -R pnpm/pnpm -p 'pnpm-linux-x64' -D ~/.local/bin --clobber
mv ~/.local/bin/pnpm-linux-x64 ~/.local/bin/pnpm && chmod +x ~/.local/bin/pnpm
export PATH="$HOME/.local/bin:$PATH"
export COREPACK_ENABLE_AUTO_PIN=0
```

### Build-Skripte (esbuild)

pnpm 10 kann **`esbuild`**-Postinstall blockieren. Bei fehlendem Binary:

```bash
pnpm rebuild esbuild
```

`pnpm approve-builds` nicht in Automatisierung verwenden.

### Dev-Server

| Zweck | Befehl | URL |
| ----- | ------ | --- |
| Wie GitHub Pages / CI | `pnpm run dev --host 127.0.0.1 --port 5173` | http://127.0.0.1:5173/Internet-Archive-Explorer/ |
| Root-Pfad (Vercel-lokal) | `VITE_BASE_PATH=/ pnpm run dev --host 127.0.0.1 --port 5173` | http://127.0.0.1:5173/ |
| Production-Preview | Nach Build: `pnpm run preview --host 127.0.0.1 --port 4173` | Port **4173**, Base wie beim Build |

Lang laufende Prozesse in **tmux** (Cloud-VM), z. B. Session `vite-dev-server`.

### Standard-Checks (CI-Parität)

**Cloud-first:** Volle Coverage, E2E, Lighthouse und Bundle-Reports primär in GitHub Actions. Lokal: leichte Checks.

```bash
pnpm run lint:ci
pnpm run check:i18n
pnpm exec tsc --noEmit
pnpm run test:unit              # täglich / vor PR
pnpm run test:unit:coverage     # wie CI (Schwellen in vitest.config.ts)
ANALYZE=true VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build
pnpm run check:bundle-size
CI=true PLAYWRIGHT_BASE_PATH=/Internet-Archive-Explorer/ pnpm run test:e2e   # nach Build; ressourcenintensiv
pnpm audit --audit-level=moderate
```

E2E: einmalig `pnpm exec playwright install --with-deps chromium`. Mit **`CI=true`** zuerst Production-Build — Playwright nutzt **Vite preview auf 4173**.

### Qualitäts-Gates (strikt)

- Biome: **`noExplicitAny`**, **`useExhaustiveDependencies`** = error — `lint:ci` ohne Warnungen.
- PR-Bot-Kommentare (**CodeAnt**, **Socket**, Reviews) in derselben PR abarbeiten.
- Keine API-Daten in Jotai-Atoms cachen (TanStack Query).

### Gemini BYOK

- API-Schlüssel: **Einstellungen → KI-Funktionen** (`services/geminiApiKeyStorage.ts`, `store/geminiApiKey.ts`).
- Kein `VITE_API_KEY` in Produktions-Builds für AI-Aufrufe. Optionaler Dev-Fallback nur mit `VITE_ALLOW_BUILD_TIME_GEMINI_KEY=true`.

### Optionale Secrets

`.env.local` (Vorlage `.env.example`): `VITE_GOOGLE_CLIENT_ID` für OAuth — nicht für Smoke/E2E nötig. Gemini-Key über UI, nicht `.env`.

### Hello-World-Smoke

1. Dev-Server → App unter `/Internet-Archive-Explorer/` laden.
2. **Entdecken**: Karte aus „On This Day“ → Detail-Modal.
3. Globale Suche: z. B. **`library`** → Treffer von archive.org.
4. Optional: Sidebar-Hub (z. B. **Videothek**) — Jotai-Navigation.

### Externe APIs

- **Internet Archive** — für Suche/Hubs erforderlich.
- **Gemini / OAuth** — optional; E2E nutzt Fake-Keys.
