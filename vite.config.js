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
          manualChunks: {
            vendor: ['react', 'react-dom', 'jotai', 'react-router-dom'],
            ui: ['framer-motion', 'lucide-react', 'cmdk'],
            query: ['@tanstack/react-query'],
          },
        },
      },
      assetsDir: 'assets',
      sourcemap: false,
    },
  };
});
