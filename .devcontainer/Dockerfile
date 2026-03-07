# ─────────────────────────────────────────────────────────────────────────────
# Internet Archive Explorer — Dev Container Image
# Base: Node 22 LTS on Debian Bookworm Slim
# Includes: git, gh CLI, curl, Playwright system deps, corepack
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim

# ── Labels ────────────────────────────────────────────────────────────────────
LABEL org.opencontainers.image.title="Internet Archive Explorer Dev Container"
LABEL org.opencontainers.image.description="Node 22 + Playwright + GitHub CLI"

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
    # Playwright / browser runtime system deps (Chromium, Firefox, WebKit)
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
    # WebKit additional deps
    libwoff1 \
    libvpx7 \
    libharfbuzz-icu0 \
    libenchant-2-2 \
    libsecret-1-0 \
    libhyphen0 \
    libflite1 \
    libegl1 \
    libgles2 \
    libevdev2 \
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    libgstreamer-plugins-good1.0-0 \
    libgstreamer-gl1.0-0 \
    libgstreamer-plugins-bad1.0-0 \
  && rm -rf /var/lib/apt/lists/*

# ── GitHub CLI ────────────────────────────────────────────────────────────────
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] \
             https://cli.github.com/packages stable main" \
       | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

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
COPY --chown=node:node package*.json ./
RUN npm ci --ignore-scripts 2>/dev/null || true

EXPOSE 5173 4173

