/**
 * Ensures committed PWA marketing screenshots are real captures, not gradient placeholders.
 * Placeholders from generate-pwa-assets are ~13–24 KiB; UI captures are typically much larger.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shotsDir = process.env.PWA_SCREENSHOTS_DIR
  ? join(root, process.env.PWA_SCREENSHOTS_DIR)
  : join(root, 'public/screenshots');

/** Minimum bytes per manifest screenshot (placeholders stay under ~25 KiB). */
const MIN_BYTES = {
  'narrow-explore.png': 35_000,
  'narrow-detail.png': 35_000,
  'wide-library.png': 45_000,
  'wide-videothek.png': 45_000,
  'wide-scriptorium.png': 45_000,
};

let failed = false;

for (const [file, minBytes] of Object.entries(MIN_BYTES)) {
  const path = join(shotsDir, file);
  if (!existsSync(path)) {
    console.error(`[check-pwa-screenshots] Missing ${file}`);
    failed = true;
    continue;
  }
  const size = readFileSync(path).length;
  if (size < minBytes) {
    console.error(
      `[check-pwa-screenshots] ${file} is ${size} bytes (min ${minBytes}). Run pnpm run capture:pwa-screenshots.`,
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('[check-pwa-screenshots] All marketing screenshots meet size thresholds.');
