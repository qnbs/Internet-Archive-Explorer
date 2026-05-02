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
    /** CI uses production `dist/` from the workflow build step; run `pnpm run build` before `CI=true pnpm run test:e2e` locally. */
    command: process.env.CI
      ? 'pnpm exec vite preview --host 127.0.0.1 --port 4173'
      : 'pnpm exec vite --host 127.0.0.1 --port 4173',
    url: baseURL,
    env: {
      ...process.env,
      VITE_BASE_PATH: normalizedBasePath,
    },
    /** CI: neuer Server. Lokal: bestehenden Dev-Server auf :4173 wiederverwenden (`PW_REUSE=0` erzwingt Neustart). */
    reuseExistingServer: process.env.CI ? false : process.env.PW_REUSE !== '0',
    timeout: 120_000,
  },
});
