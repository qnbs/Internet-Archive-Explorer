import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const sourceLocalesDir = path.join(projectRoot, 'locales');
const targetLocalesDir = path.join(projectRoot, 'public', 'locales');

const IS_CHECK_MODE = process.argv.includes('--check');
const SOURCE_LANG = 'en';
const MISSING_PLACEHOLDER = '[DE] Missing translation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively collect all dot-separated leaf keys from a nested object. */
function collectKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

/** Set a deeply nested key on obj using dot notation. */
function setDeep(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

// ---------------------------------------------------------------------------
// Step 1: Copy source locales -> public/locales
// ---------------------------------------------------------------------------

if (!fs.existsSync(sourceLocalesDir)) {
  console.error(`[sync-locales] Source directory not found: ${sourceLocalesDir}`);
  process.exit(1);
}

fs.rmSync(targetLocalesDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(targetLocalesDir), { recursive: true });
fs.cpSync(sourceLocalesDir, targetLocalesDir, { recursive: true });

console.log('[sync-locales] Synced locales -> public/locales');

// ---------------------------------------------------------------------------
// Step 2: Validate key completeness across all non-source languages
// ---------------------------------------------------------------------------

const sourceLangDir = path.join(sourceLocalesDir, SOURCE_LANG);
if (!fs.existsSync(sourceLangDir)) {
  console.warn(`[sync-locales] Source language directory not found: ${sourceLangDir}`);
  process.exit(0);
}

const nsFiles = fs.readdirSync(sourceLangDir).filter((f) => f.endsWith('.json'));
const targetLangs = fs
  .readdirSync(sourceLocalesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== SOURCE_LANG)
  .map((d) => d.name);

let totalMissing = 0;

for (const lang of targetLangs) {
  const langMissing = [];

  for (const nsFile of nsFiles) {
    const sourcePath = path.join(sourceLangDir, nsFile);
    const targetPath = path.join(sourceLocalesDir, lang, nsFile);

    const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    const sourceKeys = collectKeys(sourceData);

    let targetData = {};
    if (fs.existsSync(targetPath)) {
      try {
        targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      } catch {
        console.warn(`[sync-locales] Could not parse ${lang}/${nsFile}, treating as empty.`);
      }
    }

    const targetKeys = new Set(collectKeys(targetData));
    const missing = sourceKeys.filter((k) => !targetKeys.has(k));

    if (missing.length > 0) {
      langMissing.push(...missing.map((k) => `  ${nsFile.replace('.json', '')}:${k}`));

      if (!IS_CHECK_MODE) {
        // Auto-fill missing keys in the target file with placeholder
        for (const k of missing) {
          setDeep(targetData, k, MISSING_PLACEHOLDER);
        }
        fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2) + '\n', 'utf8');

        // Also update the already-copied public/locales file
        const pubPath = path.join(targetLocalesDir, lang, nsFile);
        if (fs.existsSync(pubPath)) {
          fs.writeFileSync(pubPath, JSON.stringify(targetData, null, 2) + '\n', 'utf8');
        }
      }
    }
  }

  if (langMissing.length > 0) {
    totalMissing += langMissing.length;
    const action = IS_CHECK_MODE ? '(not patched – check mode)' : '(patched with placeholder)';
    console.warn(`\n[sync-locales] ${lang}: ${langMissing.length} missing key(s) ${action}:`);
    langMissing.forEach((line) => console.warn(line));
  }
}

if (totalMissing === 0) {
  console.log('[sync-locales] All translation keys are present.');
} else if (IS_CHECK_MODE) {
  console.error(`\n[sync-locales] CI check failed: ${totalMissing} missing translation key(s).`);
  process.exit(1);
}
