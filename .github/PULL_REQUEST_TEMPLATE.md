## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [ ] Documentation
- [ ] CI / tooling
- [ ] Dependency update
- [ ] Performance improvement

## Description

<!-- What does this PR do and why? -->

## How Has This Been Tested?

<!-- Describe the tests you ran and how to reproduce them -->

## Checklist

- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm run lint:ci` passes
- [ ] `pnpm run check:i18n` passes (no missing translation keys)
- [ ] Unit tests pass (`pnpm run test:unit`)
- [ ] E2E tests pass locally (`pnpm run test:e2e` after a production build when using `CI=true`)
- [ ] WCAG 2.2 AA not regressed (a11y E2E tests green)
- [ ] Bundle size budgets not exceeded (`pnpm run check:bundle-size` after `ANALYZE=true pnpm run build`)
- [ ] Docs updated if tooling, scripts, or architecture changed
