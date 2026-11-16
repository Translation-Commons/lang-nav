import path from 'node:path';

import { defineConfig } from 'vitest/config';

// Runs only the slow data engine parity + benchmark comparison: npm run engine:compare
export default defineConfig({
  // The data loaders reach a few .tsx files that build JSX (eg. CLDR notes)
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    include: ['src/features/data/engine/__bench__/**/*.compare.ts'],
    globals: true,
    pool: 'forks',
    execArgv: ['--expose-gc', '--max-old-space-size=8192'],
    testTimeout: 60 * 60_000,
    hookTimeout: 60 * 60_000,
    coverage: { enabled: false },
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
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
