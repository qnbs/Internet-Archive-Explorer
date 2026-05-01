# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- 🔒 Security-Hardening: pnpm audit fix + CI fails on moderate+ vulnerabilities + pnpm cache in GitHub Actions
- 🔄 Migriert von npm zu pnpm (schnellere Installs, bessere CI, weniger Disk Usage)
- Optimized Vite build with vendor/ui/query chunk splitting for better caching
- Removed unused `loadEnv` call in vite.config.js
- Fixed empty root locale files (`de.json`, `en.json`) to contain valid JSON
- DevContainer: reduced Docker image by ~200MB (removed WebKit/Firefox/GStreamer deps)
- DevContainer: `postCreate.sh` uses `pnpm install --frozen-lockfile` for reproducibility
- DevContainer: only installs Playwright Chromium (the only browser used in tests)
- Playwright config: added explicit `projects` block with chromium device

### Added

- Comprehensive project audit documentation (`AUDIT.md`)
- This changelog file
- Expanded Copilot instructions with architecture docs, patterns, and guidelines

## [1.0.0] - 2026-04-14

### Added

- React 19 + TypeScript 5 + Vite 7 foundation
- Progressive Web App (PWA) with service worker and offline support
- Bilingual interface (English / German) with 34 i18n namespace files per language
- **Explorer Hub** — global search with filters, trending items, and AI daily insights
- **Videothek** — curated film collections with hero section and carousels
- **Audiothek** — audio hub with player, playlists, and category grid
- **Images Hub** — curated image galleries with detail modal and zoom/rotate viewer
- **Rec Room** — retro game browser with emulator modal and game finder
- **Scriptorium** — document workspace with PDF/text viewer, AI analysis, and search/replace
- **Storyteller** — AI-powered story generation from archive items
- **Web Archive** — Wayback Machine URL lookup with snapshot history
- **My Archive** — personal profile connection with upload browsing
- **For You** — personalized recommendations based on library activity
- **AI Archive** — history of all AI-generated content with filtering and detail view
- **Uploader Hub** — browse and discover archive uploaders with profile pages
- **Library** — personal favorites, tags, collections, notes, drag-to-reorder, bulk actions
- **Help Center** — searchable documentation with category sidebar
- **Settings** — theme (light/dark/sepia/system), density, font size, accessibility, data export/import
- Command palette (Ctrl+K) with navigation, sharing, and AI commands
- Jotai-based state management with 14 atom stores and safe localStorage persistence
- TanStack Query v5 for all data fetching with infinite scroll support
- Framer Motion animations throughout the UI
- Tailwind CSS with Internet Archive color palette and glass morphism effects
- DOMPurify-based HTML sanitization for XSS protection
- Content Security Policy (CSP) in index.html
- OAuth 2.0 with PKCE for Google authentication
- Gemini AI integration (API key + OAuth) for insights, analysis, and content generation
- Playwright E2E tests with axe-core accessibility audits (WCAG 2.1 AA)
- CI/CD with GitHub Actions (build verification, E2E tests, GitHub Pages deployment)
- Responsive design with mobile bottom navigation and desktop sidebar

### Security

- Content Security Policy headers configured
- OAuth Authorization Code + PKCE flow (no client secret in frontend)
- DOMPurify sanitization for all user-generated HTML content
- Session-scoped token storage with expiration validation
- No hardcoded secrets in source code

[Unreleased]: https://github.com/qnbs/Internet-Archive-Explorer/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/qnbs/Internet-Archive-Explorer/releases/tag/v1.0.0
