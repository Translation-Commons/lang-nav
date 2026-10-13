import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type Plugin } from 'vite';

// `npm run dev:scan` highlights component re-renders. It loads before React and never ships.
const reactScan = (): Plugin => ({
  name: 'react-scan',
  apply: 'serve',
  transformIndexHtml: {
    order: 'pre',
    handler: () =>
      process.env.REACT_SCAN === 'true'
        ? [
            {
              tag: 'script',
              attrs: { type: 'module' },
              children: "import { scan } from 'react-scan'; scan({ enabled: true });",
              injectTo: 'head-prepend',
            },
          ]
        : [],
  },
});

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
  },
  plugins: [reactScan(), react(), tailwindcss(), visualizer()],
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
