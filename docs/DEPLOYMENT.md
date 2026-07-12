# Deployment Guide — Internet Archive Explorer

This document covers **GitHub Pages** (primary) and **Vercel** (mirror / previews). Both deploy automatically on every push to `main`.

## Overview

| Target | Base path | Build trigger | URL pattern |
| ------ | --------- | ------------- | ----------- |
| **GitHub Pages** | `/<repo-name>/` | Push to `main` → `deploy-pages.yml` | `https://<user>.github.io/Internet-Archive-Explorer/` |
| **Vercel** | `/` (root) | Push to `main` / PR → `vercel-deploy.yml` | `https://<project>.vercel.app/` or custom domain |

Both targets use the same Vite build (`pnpm run build`) with different `VITE_BASE_PATH` values.

---

## GitHub Pages (primary)

### One-time repository setup

1. Go to **Settings → Pages → Build and deployment**.
2. Set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. If Source is a branch, the live site may serve raw `index.html` with `./index.tsx` (no bundle) — **Pages Smoke Checks** will fail with a diagnostic message.

### CI pipeline

| Workflow | Trigger | Purpose |
| -------- | ------- | ------- |
| `ci.yml` | Push/PR to `main` | Lint, types, unit tests, build, bundle budgets, E2E, Lighthouse |
| `deploy-pages.yml` | Push to `main` | Build + publish `dist/` to GitHub Pages; prunes old deployments to last 3 |
| `pages-smoke.yml` | After deploy succeeds | Live URL smoke (HTML bundle, SW, locales, PWA assets) |
| `prune-deployments.yml` | Manual (`workflow_dispatch`) | Prune GitHub deployments to a configurable number |

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

### Deployment pruning

GitHub Pages creates a deployment for every publish. Over time this can grow large (the project once had 132 deployments). Two mechanisms keep the count low:

1. **Automatic:** `.github/workflows/deploy-pages.yml` runs `.github/workflows/prune-deployments.yml`'s logic after every deploy, keeping the 3 most recent deployments.
2. **Manual:** Run `.github/workflows/prune-deployments.yml` from the Actions tab and set the `keep` input (default 3).

The pruning workflow deactivates deployments before deleting them and tolerates 404s from concurrent runs.

### Legacy manual deploy

```bash
pnpm run deploy   # gh-pages branch — prefer GitHub Actions
```

---

## Vercel

### Why Vercel?

- Root-path hosting (`/` instead of `/Internet-Archive-Explorer/`)
- PR preview URLs
- Edge headers for `sw.js` / `manifest.json` (see `vercel.json`)

### GitHub Actions (`vercel-deploy.yml`)

The `vercel-deploy.yml` workflow runs automatically on every push to `main` (production deploy) and on pull requests (preview deploy). Add these repository secrets:

| Secret | Description |
| ------ | ----------- |
| `VERCEL_TOKEN` | Vercel account token |
| `VERCEL_ORG_ID` | Team/user ID |
| `VERCEL_PROJECT_ID` | Project ID |

If any secret is missing, the workflow **fails** so the misconfiguration is noticed immediately.

`vercel.json` in the repo root configures rewrites (SPA fallback), cache headers, and frozen lockfile install.

### Alternative — Vercel Dashboard

If you prefer Vercel's native Git integration, disable `vercel-deploy.yml` (or remove the `push`/`pull_request` triggers) and import the GitHub repository in [Vercel](https://vercel.com/new) with framework preset **Vite**, output directory `dist`, and `VITE_BASE_PATH=/`.

### Service worker on Vercel

- **Production** custom domain: SW registers normally (scope derived from script path).
- **Preview** `*.vercel.app`: SW registration is disabled in `sw-register.js` to avoid stale preview caches (same pattern as Codespaces / localhost).

---

## PWA Assets Checklist

After any deploy, verify:

- [ ] `/manifest.json` returns 200
- [ ] `/icons/icon-192.png` and `/icons/icon-512.png` return 200
- [ ] `/sw.js` returns 200 with a short cache lifetime
- [ ] `/locales/en/common.json` and `/locales/de/common.json` return 200

CI checks these in `dist/` after build; **Pages Smoke** checks the live GitHub Pages URL.

Regenerate placeholder assets locally:

```bash
pnpm run generate:pwa-assets
```

---

## Environment Variables

See `.env.example`. `VITE_*` variables used at build time are embedded in the client bundle.

**Gemini AI:** Users add their API key in the app (Settings → AI Features). Do not set `VITE_API_KEY` on production deploys.

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `VITE_BASE_PATH` | Yes (CI) | Trailing slash required; defaults to `/Internet-Archive-Explorer/` in Vite config |
| `VITE_GOOGLE_CLIENT_ID` | No | OAuth PKCE |
| `VITE_DEBUG_LOGS` | No | Verbose client logging in production |
| `VITE_RECROOM_OPEN_ON_ARCHIVE` | No | Open games on archive.org directly |
| `VITE_ALLOW_BUILD_TIME_GEMINI_KEY` | No | Dev-only; with `VITE_API_KEY` for local demos |

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

## Related Docs

- `README.md` — quick start and local CI gate
- `CONTRIBUTING.md` — quality gates before PR
- `AUDIT.md` — architecture and completion status
- `CLAUDE.md` — agent / Cursor conventions
