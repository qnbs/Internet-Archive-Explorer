#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# postCreate.sh — Runs once after the dev container is created.
# Installs all project dependencies, Playwright browsers and syncs locales.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

echo "╔══════════════════════════════════════════════════════╗"
echo "║   Internet Archive Explorer — Dev Container Setup   ║"
echo "╚══════════════════════════════════════════════════════╝"

# ── 1. npm install ─────────────────────────────────────────
echo ""
echo "▶ [1/4] Installing npm dependencies…"
npm install

# ── 2. Playwright browsers ────────────────────────────────
echo ""
echo "▶ [2/4] Installing Playwright browsers (chromium + firefox + webkit)…"
npx playwright install --with-deps chromium firefox webkit

# ── 3. Sync locales ───────────────────────────────────────
echo ""
echo "▶ [3/4] Syncing locale files…"
npm run sync:locales

# ── 4. Verify build tooling ───────────────────────────────
echo ""
echo "▶ [4/4] Verifying build tooling (dry run)…"
npx tsc --noEmit --skipLibCheck 2>/dev/null && echo "  ✓ TypeScript OK" || echo "  ⚠ TypeScript reported issues (non-fatal)"

echo ""
echo "✅  Setup complete. Run 'npm run dev' to start the dev server on :5173."
