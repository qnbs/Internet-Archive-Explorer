# Release Process

Internet Archive Explorer is deployed automatically to GitHub Pages on every push to `main`. Releases are semantic version tags that trigger auto-generated release notes.

## Steps

1. **Ensure `main` is green** — all CI checks pass.

2. **Update CHANGELOG.md**
   ```bash
   # Add a new section at the top:
   ## [X.Y.Z] - YYYY-MM-DD
   ### Added / Fixed / Changed / Removed
   - ...
   ```

3. **Tag the release**
   ```bash
   git checkout main && git pull
   git tag vX.Y.Z
   git push --tags
   ```

4. **Create GitHub Release**
   - Go to [Releases](https://github.com/qnbs/Internet-Archive-Explorer/releases)
   - Click **"Draft a new release"**
   - Select the tag `vX.Y.Z`
   - Click **"Generate release notes"** — this uses `.github/release.yml` to group commits by label
   - Review and publish

5. **Deployment** — the `Deploy to GitHub Pages` workflow runs automatically on push to `main`. The live app updates within ~2 minutes. After deploy, old GitHub deployments are pruned to the last 3 automatically.

## Versioning

Follow [Semantic Versioning](https://semver.org/):

| Change | Version bump |
|--------|-------------|
| Breaking UI/API change | MAJOR (X.0.0) |
| New feature, backward-compatible | MINOR (0.X.0) |
| Bug fix, dependency update | PATCH (0.0.X) |

## Hotfixes

For critical bugs discovered after a release:

1. Branch off the affected tag: `git checkout -b hotfix/vX.Y.(Z+1) vX.Y.Z`
2. Apply a minimal fix, commit, and push the branch
3. Open a PR → merge to `main` after CI passes
4. Tag the new patch version from `main`

## Pre-release Checks

Before tagging, confirm locally or in CI:

```bash
pnpm audit --audit-level=moderate
pnpm run lint:ci
pnpm run check:i18n
pnpm exec tsc --noEmit
pnpm run test:unit:coverage
ANALYZE=true VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run build
pnpm run check:bundle-size
CI=true PLAYWRIGHT_BASE_PATH=/Internet-Archive-Explorer/ pnpm run test:e2e
npx --yes @lhci/cli@0.14.0 autorun --config=./lighthouserc.json
```

These gates mirror `.github/workflows/ci.yml`. If any step fails, do not tag the release.

## Related

- `CHANGELOG.md` — release notes source
- `.github/release.yml` — release note categories
- `docs/DEPLOYMENT.md` — GitHub Pages and Vercel deployment details
