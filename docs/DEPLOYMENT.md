# Deployment Guide — Internet Archive Explorer

This document covers **GitHub Pages** (primary) and **Vercel** (optional mirror / previews).

## Overview

| Target | Base path | Build trigger | URL pattern |
| ------ | --------- | ------------- | ----------- |
| **GitHub Pages** | `/<repo-name>/` | Push to `main` → `deploy-pages.yml` | `https://<user>.github.io/Internet-Archive-Explorer/` |
| **Vercel** | `/` (root) | Optional `vercel-deploy.yml` or Vercel Git integration | `https://<project>.vercel.app/` or custom domain |

Both targets use the same Vite build (`pnpm run build`) with different `VITE_BASE_PATH` values.

---

## GitHub Pages (primary)

### One-time repository setup

1. **Settings → Pages → Build and deployment**
2. Set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. If Source is a branch, the live site may serve raw `index.html` with `./index.tsx` (no bundle) — **Pages Smoke Checks** will fail with a diagnostic message.

### CI pipeline

| Workflow | Trigger | Purpose |
| -------- | ------- | ------- |
| `ci.yml` | Push/PR to `main` | Lint, types, unit tests, build, bundle budgets, E2E, Lighthouse |
| `deploy-pages.yml` | Push to `main` | Build + publish `dist/` to GitHub Pages |
| `pages-smoke.yml` | After deploy succeeds | Live URL smoke (HTML bundle, SW, locales, PWA assets) |

### Build environment (Actions)

```yaml
VITE_BASE_PATH: /${{ github.event.repository.name }}/
VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}  # optional
```

### Local parity

```bash
pnpm install --frozen-lockfile
VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build
pnpm exec vite preview --host 127.0.0.1 --port 4173
# Open http://127.0.0.1:4173/Internet-Archive-Explorer/
```

### Legacy manual deploy

```bash
pnpm run deploy   # gh-pages branch — prefer GitHub Actions
```

---

## Vercel (optional)

### Why Vercel?

- Root-path hosting (`/` instead of `/Internet-Archive-Explorer/`)
- PR preview URLs
- Edge headers for `sw.js` / `manifest.json` (see `vercel.json`)

### Option A — Vercel Dashboard (recommended)

1. Import the GitHub repository in [Vercel](https://vercel.com/new).
2. Framework preset: **Vite**
3. Environment variables:

| Variable | Production | Preview |
| -------- | ---------- | ------- |
| `VITE_BASE_PATH` | `/` | `/` |
| `VITE_API_KEY` | (optional) Gemini key | same or empty |
| `VITE_GOOGLE_CLIENT_ID` | (optional) OAuth | same |

4. Build command: `pnpm run build` (from `vercel.json`)
5. Output directory: `dist`

`vercel.json` in the repo root configures rewrites (SPA fallback), cache headers, and frozen lockfile install.

### Option B — GitHub Actions (`vercel-deploy.yml`)

Add repository secrets:

| Secret | Description |
| ------ | ----------- |
| `VERCEL_TOKEN` | Vercel account token |
| `VERCEL_ORG_ID` | Team/user ID |
| `VERCEL_PROJECT_ID` | Project ID |

If secrets are **missing**, the workflow is skipped (no failure).

### Service worker on Vercel

- **Production** custom domain: SW registers normally (scope derived from script path).
- **Preview** `*.vercel.app`: SW registration is disabled in `sw-register.js` to avoid stale preview caches (same pattern as Codespaces / localhost).

---

## PWA assets checklist

After any deploy, verify:

- [ ] `/manifest.json` returns 200
- [ ] `/icons/icon-192.png` and `/icons/icon-512.png` return 200
- [ ] `/sw.js` returns 200 with short cache lifetime
- [ ] `/locales/en/common.json` and `/locales/de/common.json` return 200

CI checks these in `dist/` after build; **Pages Smoke** checks the live GitHub Pages URL.

Regenerate placeholder assets locally:

```bash
pnpm run generate:pwa-assets
```

---

## Environment variables

See `.env.example`. All `VITE_*` variables are embedded in the client bundle.

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `VITE_BASE_PATH` | Yes (CI) | Trailing slash required; defaults to `/Internet-Archive-Explorer/` in Vite config |
| `VITE_API_KEY` | No | Gemini; browser-exposed |
| `VITE_GOOGLE_CLIENT_ID` | No | OAuth PKCE |
| `VITE_DEBUG_LOGS` | No | Verbose client logging in production |
| `VITE_RECROOM_OPEN_ON_ARCHIVE` | No | Open games on archive.org directly |

---

## Troubleshooting

### Live site shows blank page / `index.tsx` in HTML

→ GitHub Pages Source is not **GitHub Actions**. Fix in Settings → Pages.

### SW serves stale bundles after deploy

→ Hard refresh; clear site data; confirm `sw.js` cache version bumped (`CACHE_VERSION` in `public/sw.js`).

### Vercel 404 on deep links

→ Confirm `vercel.json` rewrites are deployed; `VITE_BASE_PATH` must match hosting root (`/` on Vercel).

### CI green but Pages smoke fails

→ CDN propagation delay (workflow retries 20×15s). Re-run **Pages Smoke Checks** manually.

---

## Related docs

- `README.md` — quick start and local CI gate
- `CONTRIBUTING.md` — quality gates before PR
- `AUDIT.md` — architecture and completion status
- `CLAUDE.md` — agent / Cursor conventions
