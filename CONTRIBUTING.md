# Contributing to Internet Archive Explorer

Thank you for helping improve this project. This document describes how we work day to day: **pnpm**, **Biome** (lint + format), **TypeScript**, **React 19**, and **Cursor Pro+** / VS Code.

## Prerequisites

- **Node.js 22+** with **Corepack** enabled (`corepack enable`) so the pinned **pnpm** version from `package.json` (`packageManager`) is used.
- Install dependencies:

```bash
pnpm install --frozen-lockfile
```

## Linting and formatting (Biome only)

This repository uses **[Biome](https://biomejs.dev/)** as the **only** linter and formatter. We do **not** use ESLint or Prettier in this codebase.

- Configuration: `biome.json`
- **Cursor / VS Code:** install the official extension **[Biome (biomejs.biome)](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)**. It talks to the same rules as the CLI.

### Commands

| Script              | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `pnpm run lint`     | Run Biome check (lint + format verification)      |
| `pnpm run lint:ci`  | **`biome ci`** — same gates as GitHub Actions      |
| `pnpm run check`    | `biome ci` + `tsc --noEmit` + unit tests (Vitest)   |
| `pnpm run test:unit`| Vitest (single worker / serial — weak hardware OK)|
| `pnpm run lint:fix` | Apply safe fixes + format (`biome check --write`) |
| `pnpm run format`   | Format with Biome (`biome format --write`)       |
| `pnpm run format:check` | Verify formatting only (`biome format .`)     |

Run these before opening a PR:

```bash
pnpm run lint:fix
pnpm run format
```

If CI fails on Biome, reproduce with `pnpm run lint:ci` (or `pnpm run check` for types too).

## Cursor Pro+ Setup

Many developers use a **global** ESLint setup in Cursor that works great on other projects. In **this** repo, global ESLint would **fight** Biome (duplicate fixes, noisy diagnostics, wrong formatter).

### What this repo does for you

- **`.vscode/settings.json`** sets `"eslint.enable": false` and `"eslint.validate": []` so the **workspace** explicitly turns ESLint off here only.
- **`eslint.validate`: `[]`** clears any language list so the ESLint extension does not attach to TS/JS/JSX files in this folder.
- **`.vscode/extensions.json`** recommends **Biome** and marks **ESLint** / **Prettier** extensions as **unwanted** for this workspace (soft nudge in VS Code / Cursor).

Your global User settings **do not** override these workspace keys for ESLint enable/validate when the workspace is trusted.

### If ESLint still appears noisy

1. Open the Command Palette → **Preferences: Open Workspace Settings (JSON)** and confirm you are editing **Workspace**, not User settings.
2. Reload the window after pulling: **Developer: Reload Window**.
3. Optionally disable the ESLint extension **only for this workspace**: Extensions → ESLint → **Disable (Workspace)**.

### Recommended flow

1. Install **Biome** (`biomejs.biome`).
2. Trust the workspace so `.vscode/settings.json` applies.
3. Save a `.tsx` file → **Format Document** / format-on-save should run **Biome** only (default formatter `biomejs.biome`).

## Tests and checks

```bash
pnpm run test:unit   # Vitest — nur tests/unit/ (siehe vitest.config.ts; serial / wenig RAM)
ANALYZE=true pnpm run build   # wie CI: Bundle-Report für Budget-Check
pnpm run test:e2e             # mit CI=true nutzt Playwright vite preview → frischer Build nötig
```

Zum **kompletten Gate wie GitHub Actions**: `pnpm install --frozen-lockfile`, dann `pnpm audit`, `pnpm run lint:ci`, `pnpm run check:i18n`, `pnpm exec tsc --noEmit`, `pnpm run test:unit`, `ANALYZE=true pnpm run build`, `pnpm run check:bundle-size`, `CI=true pnpm run test:e2e`.

Unit-Tests liegen ausschließlich unter **`tests/unit/**/*.test.{ts,tsx}`** (nicht mehr co-located neben Source).

E2E tests expect Playwright browsers; install with `pnpm exec playwright install --with-deps chromium` if needed.

### Before every commit (full gate)

```bash
pnpm run check
pnpm run check:i18n
```

## Security

```bash
pnpm audit --audit-level=moderate
```

CI runs the same audit level; moderate or higher issues fail the pipeline.

## Commit format

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`, `revert`

Optional: install the commit-msg hook:

```bash
cp scripts/check-commit-msg.mjs .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg
```

## Bundle size

CI runs **`ANALYZE=true pnpm run build`** before **`pnpm run check:bundle-size`** (writes `dist/bundle-report.json`). Locally:

```bash
ANALYZE=true pnpm run build
pnpm run check:bundle-size
```

Alternative analysis only:

```bash
pnpm run build:analyze
```

If a budget is exceeded, update `.github/bundle-budgets.json` only after intentional additions (not regressions).

## Pull requests

- Keep commits focused; match existing **Biome** formatting and **accessibility** patterns.
- Branch off `main`, open a PR — CI must be green before merging.
- Update docs if you change tooling or scripts.

## Security issues

See [SECURITY.md](.github/SECURITY.md) — please use GitHub's private advisory system, not public issues.

## Branch protection

See [docs/branch-protection.md](docs/branch-protection.md) for recommended GitHub settings.

Thank you.
