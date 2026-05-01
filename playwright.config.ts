import { defineConfig, devices } from '@playwright/test';

const normalizedBasePath = (() => {
  const raw =
    process.env.PLAYWRIGHT_BASE_PATH ?? process.env.VITE_BASE_PATH ?? '/Internet-Archive-Explorer/';
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
})();

const baseURL = `http://127.0.0.1:4173${normalizedBasePath}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev -- --host 127.0.0.1 --port 4173',
    url: baseURL,
    env: {
      ...process.env,
      VITE_BASE_PATH: normalizedBasePath,
    },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
