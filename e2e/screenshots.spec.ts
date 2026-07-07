import { expect, Page, test } from '@playwright/test';

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

  async function waitToFinishLoadingData(page: Page) {
    await expect(page.locator('.LoadingStageDisplay')).toBeHidden();
  }

  test('intro page', async ({ page }) => {
    await page.goto('./intro');
    await page.getByText('Welcome to the').waitFor();
    await expect(page).toHaveScreenshot('intro-page.png');
  });

  test('data page: Card List', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?view=Cards');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page.png');
  });
  test('data page: Details', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?objectID=zho&searchString=Chinese');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-details.png');
  });

  test('data page: Table', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?view=Table');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-table.png');
  });

  test('data page: Tree List', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?view=Hierarchy');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-treelist.png');
  });

  test('data page: Map', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?view=Map');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-map.png');
  });

  test('data page: Reports', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?view=Reports');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-reports.png');
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
