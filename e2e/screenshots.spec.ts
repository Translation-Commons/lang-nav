import { Page, test, expect } from '@playwright/test';

async function disableAnimations(page: Page) {
  // Register an init script so animations/transitions are disabled on every
  // navigation, including the page.goto() call inside each test.
  // page.addStyleTag() would only apply to the current (blank) document and
  // would be lost when goto() loads a new page.
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    (document.head ?? document.documentElement).appendChild(style);
  });
}

async function seedDeclinedConsent(page: Page) {
  // Pre-decide consent so the banner does not overlay the screenshot and
  // Amplitude never initializes. Each test opts in explicitly, so the banner
  // test can omit this call and capture a banner-visible screenshot.
  await page.addInitScript(() => {
    try {
      localStorage.setItem(
        'langnav.consent',
        JSON.stringify({
          analytics: 'denied',
          version: 1,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch {
      // Supress: localStorage may not be available in all contexts
    }
  });
}

test.describe('screenshot tests', () => {
  test.beforeEach(async ({ page }) => {
    await disableAnimations(page);
  });

  test('intro page', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./intro');
    await page.getByText('Welcome to the').waitFor();
    await expect(page).toHaveScreenshot('intro-page.png');
  });

  test('data page', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data');
    // Wait for the loading spinner to disappear and real content to appear
    await expect(page.getByText('Loading...')).toBeHidden({ timeout: 30000 });
    await expect(page).toHaveScreenshot('data-page.png');
  });

  test('lucky search page', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./lucky');
    await page.getByText('Searching...').waitFor();
    await expect(page).toHaveScreenshot('lucky-search-page.png');
  });

  test('about page', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./about');
    await page.getByText('Core Pages').first().waitFor();
    await expect(page).toHaveScreenshot('about-page.png');
  });

  test('consent banner on intro page', async ({ page }) => {
    await page.goto('./intro');
    await page.getByText('Welcome to the').waitFor();
    await page.getByRole('dialog', { name: 'Cookie consent' }).waitFor();
    await expect(page).toHaveScreenshot('consent-banner.png');
  });
});
