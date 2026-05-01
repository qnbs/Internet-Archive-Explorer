# ─────────────────────────────────────────────────────────────────────────────
# Internet Archive Explorer — Dev Container Image
# Base: Node 22 LTS on Debian Bookworm Slim
# Includes: git, curl, Playwright system deps, corepack
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim

# ── Labels ────────────────────────────────────────────────────────────────────
LABEL org.opencontainers.image.title="Internet Archive Explorer Dev Container"
LABEL org.opencontainers.image.description="Node 22 + Playwright Chromium system deps"

# ── System packages ───────────────────────────────────────────────────────────
# Single RUN layer to minimise image layers and cache invalidation
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core tools
    git \
    curl \
    wget \
    ca-certificates \
    gnupg \
    lsb-release \
    procps \
    unzip \
    jq \
    # Playwright Chromium runtime system deps
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    fonts-liberation \
    fonts-noto-color-emoji \
    libx11-xcb1 \
    libxext6 \
    libxrender1 \
    libxi6 \
    libxtst6 \
  && rm -rf /var/lib/apt/lists/*

# ── GitHub CLI is provided by the devcontainer feature github-cli:1 ──────────

# ── corepack (pnpm / yarn if ever needed) ─────────────────────────────────────
RUN corepack enable

# ── npm global prefix for unprivileged 'node' user ────────────────────────────
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# ── Playwright environment flags ──────────────────────────────────────────────
# Tell Playwright where to cache the browser binaries
ENV PLAYWRIGHT_BROWSERS_PATH=/home/node/.cache/ms-playwright
# Skip the automatic download during 'npm install'
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# ── Switch to unprivileged user ───────────────────────────────────────────────
USER node
WORKDIR /workspaces/Internet-Archive-Explorer

# ── Pre-warm npm cache by installing deps in a throw-away layer ───────────────
# This layer is invalidated only when package*.json changes, so subsequent
# rebuilds (e.g. after adding a package) skip this expensive step.
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN corepack prepare pnpm@10.6.1 --activate && pnpm install --frozen-lockfile --ignore-scripts 2>/dev/null || true

EXPOSE 5173 4173

