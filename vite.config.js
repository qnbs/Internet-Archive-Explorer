import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { analyzer } from 'vite-bundle-analyzer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const isAnalyzeMode = process.env.ANALYZE === 'true' || mode === 'analyze';

  return {
    base: '/Internet-Archive-Explorer/',
    plugins: [
      react(),
      analyzer({
        enabled: isAnalyzeMode,
        analyzerMode: 'json',
        fileName: 'bundle-report',
        reportTitle: 'Internet Archive Explorer Bundle Report',
        openAnalyzer: false,
        defaultSizes: 'brotli',
      }),
    ],
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/') ||
              id.includes('/react-router-dom/')
            ) {
              return 'react-core';
            }

            if (id.includes('/@tanstack/react-query/')) {
              return 'query-core';
            }

            if (id.includes('/@google/genai/')) {
              return 'ai-sdk';
            }

            if (
              id.includes('/framer-motion/') ||
              id.includes('/lucide-react/') ||
              id.includes('/cmdk/')
            ) {
              return 'ui-kit';
            }

            if (
              id.includes('/@dnd-kit/core/') ||
              id.includes('/@dnd-kit/sortable/') ||
              id.includes('/@dnd-kit/utilities/')
            ) {
              return 'dnd-kit';
            }

            if (id.includes('/jotai/')) {
              return 'state-core';
            }

            return 'vendor';
          },
        },
      },
      assetsDir: 'assets',
      sourcemap: false,
    },
  };
});
