import fs from 'node:fs';

const TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'test',
  'chore',
  'ci',
  'perf',
  'build',
  'revert',
];
const PATTERN = new RegExp(`^(${TYPES.join('|')})(\\([^)]+\\))?: .{1,72}[^.]$`);

const msgFile = process.argv[2] ?? '.git/COMMIT_EDITMSG';

let msg;
try {
  msg = fs.readFileSync(msgFile, 'utf8').trim();
} catch {
  console.error(`[commit-msg] Cannot read commit message from: ${msgFile}`);
  process.exit(1);
}

// Strip comment lines (lines starting with #)
const subject = msg
  .split('\n')
  .find((line) => line.trim() && !line.startsWith('#'))
  ?.trim();

if (!subject) {
  console.error('[commit-msg] Empty commit message.');
  process.exit(1);
}

if (!PATTERN.test(subject)) {
  console.error(`[commit-msg] Invalid commit message: "${subject}"`);
  console.error(
    '[commit-msg] Expected format: type(scope): description  (max 72 chars, no trailing period)',
  );
  console.error(`[commit-msg] Valid types: ${TYPES.join(', ')}`);
  console.error('[commit-msg] Examples:');
  console.error('  feat(search): add fuzzy filtering');
  console.error('  fix(sw): bump cache name after removing stale URLs');
  console.error('  chore: update dependencies');
  process.exit(1);
}

console.log(`[commit-msg] ✓ "${subject}"`);
