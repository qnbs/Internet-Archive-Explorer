import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    base: '/Internet-Archive-Explorer/',
    plugins: [react()],
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
            if (!id.includes('node_modules')) {
              return undefined;
            }
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('cmdk')) {
              return 'ui';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('jotai') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor';
            }
            return undefined;
          },
        },
      },
      assetsDir: 'assets',
      sourcemap: false,
    },
  };
});
