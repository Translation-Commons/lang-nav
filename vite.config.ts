import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/lang-nav/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'react-dom-vendor';
            if (id.includes('lucide')) return 'lucide-vendor';
            if (id.includes('base-ui')) return 'base-ui-vendor';
            if (id.includes('react')) return 'react-vendor';
          }
        },
      },
    },
  },
  plugins: [react(), tailwindcss(), visualizer()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@widgets': path.resolve(__dirname, 'src/widgets'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@entities': path.resolve(__dirname, 'src/entities'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@strings': path.resolve(__dirname, 'src/strings'),
      '@tests': path.resolve(__dirname, 'src/tests'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
