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
  },
});
