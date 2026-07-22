import { defineConfig, devices } from '@playwright/test';

/**
 * Dedicated Playwright config for the preview-image capture script. Kept
 * separate from the e2e visual-regression config so that running
 * `npm run test:screenshots` does not accidentally overwrite `public/*.png`.
 */
export default defineConfig({
  testDir: '.',
  testMatch: ['preview-screenshots.spec.ts'],
  fullyParallel: true,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:4173/',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    },
  ],

  webServer: {
    command: 'VITE_BASE_PATH=/ npm run build && VITE_BASE_PATH=/ npm run preview',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
  },
});
