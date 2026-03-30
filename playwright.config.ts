import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'always', outputFolder: 'playwright-report' }],
    ['list'], // also prints results to the terminal while running
  ],
  use: {
    baseURL: 'https://translation-commons.github.io/lang-nav',
    trace: 'on',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: false, // opens a real browser window on your screen
        launchOptions: {
          slowMo: 800, // slows every action by 800ms so you can watch
        },
      },
    },
  ],
});
