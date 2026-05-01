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
