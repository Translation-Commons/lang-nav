import { test, expect } from '@playwright/test';

test.describe('screenshot tests', () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test('intro page', async ({ page }) => {
    await page.goto('./intro');
    await page.getByText('Welcome to the').waitFor();
    await expect(page).toHaveScreenshot('intro-page.png');
  });

  test('data page', async ({ page }) => {
    await page.goto('./data');
    // Wait for the loading spinner to disappear and real content to appear
    await expect(page.getByText('Loading...')).toBeHidden({ timeout: 30000 });
    await expect(page).toHaveScreenshot('data-page.png');
  });

  test('lucky search page', async ({ page }) => {
    await page.goto('./lucky');
    await page.getByText('Searching...').waitFor();
    await expect(page).toHaveScreenshot('lucky-search-page.png');
  });

  test('about page', async ({ page }) => {
    await page.goto('./about');
    await page.getByText('Motivation').first().waitFor();
    await expect(page).toHaveScreenshot('about-page.png');
  });
});
