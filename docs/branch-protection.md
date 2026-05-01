# Recommended Branch Protection Rules for `main`

Apply these settings at **Settings → Branches → Add rule → `main`** on GitHub.

## Required Settings

| Setting | Value |
|---------|-------|
| Require a pull request before merging | ✅ |
| Require status checks to pass | ✅ |
| Required status check | `CI / Build and Artifact Checks` |
| Require branches to be up to date | ✅ |
| Require conversation resolution | ✅ |
| Allow force pushes | ❌ |
| Allow deletions | ❌ |

## Optional (for solo workflow)

If you are the sole maintainer and want to push directly to `main` for small fixes, you can skip the PR requirement — but keep status checks so CI still runs on push.

## Why These Rules

- **Status check on CI job**: catches TypeScript errors, lint failures, i18n drift, bundle budget violations, and E2E failures before they reach `main`
- **No force push**: preserves history; prevents accidental loss of commits
- **Conversation resolution**: ensures review comments aren't silently dismissed
