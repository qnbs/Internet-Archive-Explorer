import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Low-RAM / CI-friendly: single worker, serial files, fork pool (stable vs worker threads). */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
    testTimeout: 15_000,
    hookTimeout: 10_000,
    teardownTimeout: 5000,
    isolate: true,
    coverage: {
      provider: 'v8',
      include: ['services/**/*.ts', 'utils/**/*.ts', 'store/**/*.ts', 'hooks/**/*.ts'],
      exclude: ['**/*.test.{ts,tsx}', '**/types/**'],
      reporter: ['text', 'json-summary'],
      thresholds: {
        lines: 0,
        functions: 0,
        statements: 0,
        branches: 0,
        'services/archiveService.ts': {
          lines: 60,
          functions: 45,
          branches: 35,
          statements: 60,
        },
        'utils/fetchWithRetry.ts': {
          lines: 85,
          functions: 85,
          branches: 80,
          statements: 85,
        },
        'store/safeStorage.ts': {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
        'store/downloads.ts': {
          lines: 50,
          functions: 25,
          branches: 25,
          statements: 50,
        },
      },
    },
  },
});
