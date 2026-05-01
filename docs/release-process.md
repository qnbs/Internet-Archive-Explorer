# Release Process

Internet Archive Explorer is deployed automatically to GitHub Pages on every push to `main`. Releases are semantic version tags that trigger auto-generated release notes.

## Steps

1. **Ensure `main` is green** — all CI checks pass

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

5. **Deployment** — the `Deploy to GitHub Pages` workflow runs automatically on push to `main`. The live app updates within ~2 minutes.

## Versioning

Follow [Semantic Versioning](https://semver.org/):

| Change | Version bump |
|--------|-------------|
| Breaking UI/API change | MAJOR (X.0.0) |
| New feature, backward-compatible | MINOR (0.X.0) |
| Bug fix, dependency update | PATCH (0.0.X) |

## Hotfixes

For critical bugs discovered after a release:
1. Branch off the affected tag: `git checkout -b hotfix/vX.Y.Z+1 vX.Y.Z`
2. Apply minimal fix, commit, push branch
3. Open PR → merge to `main` after CI passes
4. Tag the new patch version from `main`
