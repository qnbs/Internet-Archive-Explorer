# Contributing to Internet Archive Explorer

## Setup

**Requirements:** Node 22+, npm 10+

```bash
git clone https://github.com/qnbs/Internet-Archive-Explorer.git
cd Internet-Archive-Explorer
npm ci
cp .env.example .env.local   # add your Gemini API key
npm run dev
```

## Development Workflow

```bash
npm run dev          # start dev server with HMR at localhost:5173
npm run build        # production build → dist/
npm run preview      # serve dist/ locally
```

## Before Every Commit

Run this full pre-commit check locally:

```bash
npx tsc --noEmit          # type check
npm run lint              # ESLint
npm run format:check      # Prettier
npm run check:i18n        # verify all DE translation keys are present
```

## Commit Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`, `revert`

**Examples:**
```
feat(search): add fuzzy filtering to item grid
fix(sw): bump cache name after removing stale CDN URLs
chore(deps): update vite to 8.1.0
```

### Optional: Install commit-msg git hook

```bash
cp scripts/check-commit-msg.mjs .git/hooks/commit-msg
chmod +x .git/hooks/commit-msg
```

This validates commit message format before every commit.

## Testing

```bash
npm run test:e2e     # runs Playwright E2E (auto-starts dev server)
```

Tests live in `tests/e2e/`. The suite covers smoke tests and WCAG 2.2 AA accessibility audits.

## Bundle Size

```bash
npm run build:analyze       # build with bundle report → dist/bundle-report.json
npm run check:bundle-size   # verify chunks against budgets in .github/bundle-budgets.json
```

If a budget is exceeded, update `.github/bundle-budgets.json` only after intentional additions (not regressions).

## Pull Requests

1. Branch off `main` (`git checkout -b feat/my-feature`)
2. Make your changes, following the pre-commit checklist above
3. Open a PR against `main` — the CI must be green before merging
4. The PR template will prompt you for the key checklist items

## Security Issues

See [SECURITY.md](.github/SECURITY.md) — please use GitHub's private advisory system, not public issues.

## Branch Protection

See [docs/branch-protection.md](docs/branch-protection.md) for recommended GitHub settings.
