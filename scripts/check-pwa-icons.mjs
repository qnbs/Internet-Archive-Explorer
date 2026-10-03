/**
 * Ensures committed PWA icons are branded captures, not flat gradient placeholders.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const iconsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public/icons');

/** Placeholder PNGs from generate-pwa-assets are ~2.4 KiB / ~7.5 KiB. */
const MIN_BYTES = {
  'icon-192.png': 8_000,
  'icon-512.png': 25_000,
};

let failed = false;

for (const [file, minBytes] of Object.entries(MIN_BYTES)) {
  const path = join(iconsDir, file);
  if (!existsSync(path)) {
    console.error(`[check-pwa-icons] Missing ${file}`);
    failed = true;
    continue;
  }
  const size = readFileSync(path).length;
  if (size < minBytes) {
    console.error(
      `[check-pwa-icons] ${file} is ${size} bytes (min ${minBytes}). Run pnpm run capture:pwa-screenshots.`,
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('[check-pwa-icons] PWA icons meet size thresholds.');
