import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: true,
    reporters: ['default'],
    coverage: {
      reporter: ['text', 'json', 'json-summary'],
      provider: 'v8',
      enabled: true,
      exclude: [
        'src/app/main.tsx',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        '**/types/**',
        '**/*.stories.*',
        'dist/**',
        '*.config.*',
      ],
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
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
    },
  },
});
