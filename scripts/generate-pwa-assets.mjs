/**
 * Generates local PNG icons and placeholder screenshots for the PWA manifest.
 * Run: node scripts/generate-pwa-assets.mjs
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function crc32(buf) {
  let c = 0xffffffff;
  const table = [];
  for (let n = 0; n < 256; n++) {
    let cv = n;
    for (let k = 0; k < 8; k++) cv = cv & 1 ? 0xedb88320 ^ (cv >>> 1) : cv >>> 1;
    table[n] = cv;
  }
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(w, h) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const row = 1 + w * 4;
  const raw = Buffer.alloc(row * h);
  for (let y = 0; y < h; y++) {
    raw[y * row] = 0;
    for (let x = 0; x < w; x++) {
      const i = y * row + 1 + x * 4;
      raw[i] = 8;
      raw[i + 1] = 51 + Math.floor((x / w) * 34);
      raw[i + 2] = 68 + Math.floor((y / h) * 30);
      raw[i + 3] = 255;
    }
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const iconsDir = join(root, 'public/icons');
const shotsDir = join(root, 'public/screenshots');
mkdirSync(iconsDir, { recursive: true });
mkdirSync(shotsDir, { recursive: true });

writeFileSync(join(iconsDir, 'icon-192.png'), png(192, 192));
writeFileSync(join(iconsDir, 'icon-512.png'), png(512, 512));
writeFileSync(join(shotsDir, 'narrow-explore.png'), png(540, 960));
writeFileSync(join(shotsDir, 'narrow-detail.png'), png(540, 960));
writeFileSync(join(shotsDir, 'wide-library.png'), png(1280, 720));
writeFileSync(join(shotsDir, 'wide-videothek.png'), png(1280, 720));
writeFileSync(join(shotsDir, 'wide-scriptorium.png'), png(1280, 720));

// Generate manifest.json from template, substituting VITE_BASE_PATH so the
// PWA scope/start_url/shortcuts/share_target work on both GitHub Pages
// (/Internet-Archive-Explorer/) and Vercel (/).
const manifestTemplatePath = join(root, 'public/manifest.template.json');
const manifestOutputPath = join(root, 'public/manifest.json');

function normalizeBasePath(raw) {
  const value = (raw ?? '').trim();
  if (!value) return '/Internet-Archive-Explorer/';
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

const basePath = normalizeBasePath(process.env.VITE_BASE_PATH);
const template = readFileSync(manifestTemplatePath, 'utf-8');
const manifest = template.replaceAll('__BASE_PATH__', basePath);

writeFileSync(manifestOutputPath, manifest);

console.log('[generate-pwa-assets] Wrote icons and screenshots under public/');
console.log(`[generate-pwa-assets] Wrote manifest.json with base path "${basePath}"`);
