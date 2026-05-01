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
  timeout: 90_000,
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
    // `vite` direkt: schneller und zuverlässiger als `pnpm run dev` im Playwright-Subprozess
    command: 'pnpm exec vite --host 127.0.0.1 --port 4173',
    url: baseURL,
    env: {
      ...process.env,
      VITE_BASE_PATH: normalizedBasePath,
    },
    /** Lokales Debugging: laufender Dev-Server → `PW_REUSE=1 pnpm run test:e2e` */
    reuseExistingServer: process.env.PW_REUSE === '1',
    timeout: 120_000,
  },
});
