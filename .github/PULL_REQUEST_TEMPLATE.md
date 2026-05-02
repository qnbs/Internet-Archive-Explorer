## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [ ] Documentation
- [ ] CI / tooling
- [ ] Dependency update

## Description

<!-- What does this PR do and why? -->

## Checklist

- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm run lint:ci` passes
- [ ] `pnpm run check:i18n` passes (no missing translation keys)
- [ ] Unit tests pass (`pnpm run test:unit`)
- [ ] E2E tests pass locally (`pnpm run test:e2e`)
- [ ] WCAG 2.2 AA not regressed (a11y E2E tests green)
- [ ] Bundle size budgets not exceeded (`pnpm run check:bundle-size` after `ANALYZE=true pnpm run build`)
