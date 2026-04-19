import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const reportPath = path.join(root, 'dist', 'bundle-report.json');
const budgetsPath = path.join(root, '.github', 'bundle-budgets.json');

if (!fs.existsSync(reportPath)) {
  console.error('[bundle-size] dist/bundle-report.json not found.');
  console.error('[bundle-size] Run: ANALYZE=true npm run build');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const { chunks: budgets, totalKB: totalBudget } = JSON.parse(fs.readFileSync(budgetsPath, 'utf8'));

let failed = false;
let totalBrotli = 0;

const COL = { name: 18, actual: 12, budget: 12, status: 8 };
const pad = (s, n) => String(s).padEnd(n);

console.log('\n' + pad('Chunk', COL.name) + pad('Actual (KB)', COL.actual) + pad('Budget (KB)', COL.budget) + 'Status');
console.log('-'.repeat(COL.name + COL.actual + COL.budget + COL.status));

for (const [chunkName, budgetKB] of Object.entries(budgets)) {
  const entry = report.find((x) => x.label.includes(`/${chunkName}-`));

  if (!entry) {
    console.log(pad(chunkName, COL.name) + pad('(absent)', COL.actual) + pad(budgetKB, COL.budget) + '—');
    continue;
  }

  const actualKB = entry.brotliSize / 1024;
  totalBrotli += entry.brotliSize;
  const ok = actualKB <= budgetKB;
  const status = ok ? '✓' : '✗ OVER';
  if (!ok) failed = true;

  console.log(pad(chunkName, COL.name) + pad(actualKB.toFixed(1), COL.actual) + pad(budgetKB, COL.budget) + status);
}

// Total across all chunks (not just named ones)
const reportTotal = report.reduce((s, x) => s + (x.brotliSize || 0), 0);
const totalKB = reportTotal / 1024;
const totalOk = totalKB <= totalBudget;
if (!totalOk) failed = true;

console.log('-'.repeat(COL.name + COL.actual + COL.budget + COL.status));
console.log(pad('TOTAL', COL.name) + pad(totalKB.toFixed(1), COL.actual) + pad(totalBudget, COL.budget) + (totalOk ? '✓' : '✗ OVER'));
console.log();

if (failed) {
  console.error('[bundle-size] Budget exceeded. Update .github/bundle-budgets.json only for intentional growth.');
  process.exit(1);
} else {
  console.log('[bundle-size] All chunks within budget.');
}
