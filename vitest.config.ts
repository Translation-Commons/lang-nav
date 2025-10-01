import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: true,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', '**/*.d.ts', '**/types/**', '**/*.stories.*'],
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
});
