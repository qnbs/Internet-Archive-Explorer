# AGENTS.md

Kurzreferenz für KI-Assistenten in diesem Repo. Ausführliche Tooling-Details: **`CLAUDE.md`**, Workflow: **`CONTRIBUTING.md`**.

## Cursor Cloud specific instructions

### Stack (kein Backend)

Client-only **Vite + React 19** PWA. Persistenz nur im Browser (`localStorage` / `sessionStorage`). Externe APIs: `archive.org`, optional Gemini/OAuth — **kein** Docker, keine lokale Datenbank.

### Nach `pnpm install` (pnpm 10)

Wenn `pnpm run build` oder `pnpm run dev` mit fehlendem **esbuild**-Binary scheitert (Hinweis „Ignored build scripts: esbuild“), einmal ausführen:

```bash
pnpm rebuild esbuild
```

Das ist bewusst **nicht** im VM-Update-Skript enthalten (nur bei Bedarf).

### Dev-Server

| Zweck | Befehl | URL |
| ----- | ------ | --- |
| Lokale Entwicklung (einfacher Pfad) | `VITE_BASE_PATH=/ pnpm run dev --host 127.0.0.1 --port 5173` | http://127.0.0.1:5173/ |
| Wie GitHub Pages / CI-Build | `VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run dev` | http://127.0.0.1:5173/Internet-Archive-Explorer/ |
| Production-Preview | Nach `pnpm run build`: `pnpm run preview --host 127.0.0.1 --port 4173` | Port **4173**, Base wie `VITE_BASE_PATH` beim Build |

Lang laufende Prozesse in **tmux** starten (Cloud-VM), z. B. Session `vite-dev-server`.

### Checks (Standardbefehle)

Siehe **`CLAUDE.md`** / **`CONTRIBUTING.md`**. Typisch vor Änderungen:

- `pnpm run lint:ci` — Biome (einziger Linter/Formatter)
- `pnpm run check:i18n`
- `pnpm exec tsc --noEmit`
- `pnpm run test:unit` (serial, `tests/unit/`)
- `ANALYZE=true VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build` + optional `pnpm run check:bundle-size`

E2E (Playwright): Browser einmalig `pnpm exec playwright install --with-deps chromium`. Mit `CI=true` zuerst Production-Build; Playwright startet intern **Vite auf Port 4173** (siehe `playwright.config.ts`). Lokal ohne CI kann ein laufender Server auf 4173 wiederverwendet werden (`PW_REUSE=0` erzwingt Neustart).

### Optionale Secrets

`.env.local` (Vorlage `.env.example`): `VITE_API_KEY`, `VITE_GOOGLE_CLIENT_ID` — nur für KI/OAuth, **nicht** für Smoke/E2E nötig.

### Hello-World / manueller Smoke

1. App öffnen (Dev-URL oben).
2. **Entdecken**-Hub: Karte aus „On This Day“ öffnen → Detail-Modal mit Metadaten.
3. Optional: globale Suche testen (benötigt erreichbares `archive.org`; API-Schema kann von Zod-Validierung abweichen).
