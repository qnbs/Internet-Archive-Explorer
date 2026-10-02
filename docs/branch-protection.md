# Recommended Branch Protection Rules for `main`

Apply these settings at **Settings → Branches → Add rule → `main`** on GitHub.

> **Repository state (2026-10-02):** Branch protection and rulesets are **not enforced** on `qnbs/Internet-Archive-Explorer` unless configured manually in GitHub Settings. This document describes the intended target state.

## Required Settings

| Setting | Value |
|---------|-------|
| Require a pull request before merging | ✅ (recommended for multi-contributor; solo maintainers may omit) |
| Require status checks to pass | ✅ |
| Required status check | **`CI Gate`** (final aggregator job in `.github/workflows/ci.yml`) |
| Require branches to be up to date | ✅ |
| Require conversation resolution | ✅ |
| Allow force pushes | ❌ |
| Allow deletions | ❌ |

## Deployment coupling

Production GitHub Pages deploy (`.github/workflows/deploy-pages.yml`) runs only after the **`CI`** workflow completes successfully on `main` (`workflow_run`), so a failing security/lint/unit/build/E2E gate must not publish via the normal path.

## Optional (for solo workflow)

If you are the sole maintainer and want to push directly to `main` for small fixes, you can skip the PR requirement — but keep status checks so CI still runs on push.

## Why These Rules

- **`CI Gate`**: aggregates independent jobs (security, static analysis, unit, build/bundle, E2E/a11y, cross-browser smoke, Lighthouse) so one early failure does not hide unrelated failures.
- **No force push**: preserves history and prevents accidental loss of commits.
- **Conversation resolution**: ensures review comments are not silently dismissed.

## Related

- `CONTRIBUTING.md` — local quality gates before opening a PR
- `docs/release-process.md` — versioning and release workflow
- `docs/DEPLOYMENT.md` — GitHub Pages and provenance notes
