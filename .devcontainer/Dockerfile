FROM node:22-bookworm-slim

# Install system tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    wget \
    ca-certificates \
    gnupg \
    lsb-release \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright system deps (Chromium for e2e tests)
RUN npx --yes playwright install-deps chromium 2>/dev/null || true

# Set npm global prefix for node user
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# Enable corepack (for pnpm/yarn support if needed)
RUN corepack enable

USER node
WORKDIR /workspaces/Internet-Archive-Explorer

# Pre-cache npm packages (copy package.json first for layer caching)
COPY --chown=node:node package*.json ./
RUN npm ci --ignore-scripts 2>/dev/null || true

EXPOSE 5173 4173
