/**
 * Capture real PWA manifest screenshots from a production preview build.
 * Requires: pnpm run build (with matching VITE_BASE_PATH), Playwright Chromium.
 *
 * Usage: VITE_BASE_PATH=/Internet-Archive-Explorer/ pnpm run capture:pwa-screenshots
 */

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function normalizeBasePath(raw) {
  const value = (raw ?? '').trim();
  if (!value) return '/Internet-Archive-Explorer/';
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

const basePath = normalizeBasePath(process.env.VITE_BASE_PATH);
const previewOrigin = 'http://127.0.0.1:4173';
const baseURL = `${previewOrigin}${basePath}`;

const shotsDir = join(root, 'public/screenshots');
const iconsDir = join(root, 'public/icons');
mkdirSync(shotsDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });

const ICON_CAPTURES = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
];

const CAPTURES = [
  {
    file: 'narrow-explore.png',
    width: 540,
    height: 960,
    path: '?view=explore',
    waitFor: '#main-content',
  },
  {
    file: 'narrow-detail.png',
    width: 540,
    height: 960,
    path: '?view=explore',
    waitFor: '#main-content',
    /** Opens item detail from carousel data (avoids ?modal= deep links that require metadata fetch). */
    beforeScreenshot: async (page) => {
      await page
        .waitForResponse((res) => res.url().includes('advancedsearch.php') && res.ok(), {
          timeout: 90_000,
        })
        .catch(() => undefined);
      const card = page
        .locator('#main-content [role="button"][aria-label^="View details for"]')
        .first();
      await card.waitFor({ state: 'visible', timeout: 90_000 });
      await card.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 90_000 });
    },
  },
  {
    file: 'wide-library.png',
    width: 1280,
    height: 720,
    path: '?view=library',
    waitFor: '#main-content',
  },
  {
    file: 'wide-videothek.png',
    width: 1280,
    height: 720,
    path: '?view=movies',
    waitFor: '#main-content',
  },
  {
    file: 'wide-scriptorium.png',
    width: 1280,
    height: 720,
    path: '?view=scriptorium',
    waitFor: '#main-content',
  },
];

async function waitForPreviewReady(url, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Preview not ready at ${url}`);
}

function startPreview() {
  return spawn('pnpm', ['run', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
    cwd: root,
    env: { ...process.env, VITE_BASE_PATH: basePath },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function main() {
  const distIndex = join(root, 'dist/index.html');
  try {
    await import('node:fs/promises').then((fs) => fs.access(distIndex));
  } catch {
    console.error(
      '[capture-pwa-screenshots] Run a production build first (dist/index.html missing).',
    );
    process.exit(1);
  }

  const preview = startPreview();
  let previewLog = '';
  preview.stdout?.on('data', (chunk) => {
    previewLog += chunk.toString();
  });
  preview.stderr?.on('data', (chunk) => {
    previewLog += chunk.toString();
  });

  try {
    await waitForPreviewReady(`${baseURL}`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      colorScheme: 'dark',
      locale: 'en-US',
    });

    await context.addInitScript(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register = () =>
          Promise.reject(new DOMException('SW disabled for screenshots', 'NotSupportedError'));
      }
    });

    const iconsOnly = process.env.CAPTURE_PWA_ICONS_ONLY === '1';

    if (!iconsOnly) {
      for (const shot of CAPTURES) {
        const page = await context.newPage();
        await page.setViewportSize({ width: shot.width, height: shot.height });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const target = `${baseURL}${shot.path.startsWith('?') ? shot.path : `?${shot.path}`}`;
        console.log(`[capture-pwa-screenshots] ${shot.file} ← ${target}`);
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 90_000 });
        await page.waitForSelector(shot.waitFor, { timeout: 90_000 });
        if (shot.beforeScreenshot) {
          await shot.beforeScreenshot(page);
        }
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: join(shotsDir, shot.file),
          type: 'png',
          fullPage: false,
        });
        await page.close();
      }
    }

    const iconSourceUrl = `${baseURL}pwa-icon-source.html`;
    for (const icon of ICON_CAPTURES) {
      const page = await context.newPage();
      await page.setViewportSize({ width: icon.size, height: icon.size });
      console.log(`[capture-pwa-screenshots] ${icon.file} ← ${iconSourceUrl}`);
      await page.goto(iconSourceUrl, { waitUntil: 'load', timeout: 60_000 });
      await page.waitForSelector('#pwa-icon-root', { timeout: 30_000 });
      await page.locator('#pwa-icon-root').screenshot({
        path: join(iconsDir, icon.file),
        type: 'png',
      });
      await page.close();
    }

    await browser.close();
    const shotCount = iconsOnly ? 0 : CAPTURES.length;
    console.log(
      `[capture-pwa-screenshots] Wrote ${shotCount} screenshots and ${ICON_CAPTURES.length} icons`,
    );
  } finally {
    preview.kill('SIGTERM');
    await new Promise((resolve) => {
      preview.on('exit', resolve);
      setTimeout(resolve, 3000);
    });
    if (preview.exitCode && preview.exitCode !== 0 && !previewLog.includes('4173')) {
      console.warn('[capture-pwa-screenshots] Preview process log:', previewLog.slice(-2000));
    }
  }
}

main().catch((err) => {
  console.error('[capture-pwa-screenshots]', err);
  process.exit(1);
});
