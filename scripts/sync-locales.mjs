import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const sourceLocalesDir = path.join(projectRoot, 'locales');
const targetLocalesDir = path.join(projectRoot, 'public', 'locales');

if (!fs.existsSync(sourceLocalesDir)) {
  console.error(`[sync-locales] Source directory not found: ${sourceLocalesDir}`);
  process.exit(1);
}

fs.rmSync(targetLocalesDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(targetLocalesDir), { recursive: true });
fs.cpSync(sourceLocalesDir, targetLocalesDir, { recursive: true });

console.log('[sync-locales] Synced locales -> public/locales');
