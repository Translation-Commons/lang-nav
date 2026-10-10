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
      // Suppress: localStorage may not be available in all contexts
    }
  });
}

test.describe('screenshot tests', () => {
  test.beforeEach(async ({ page }) => {
    await disableAnimations(page);
  });

  async function waitToFinishLoadingData(page: Page) {
    await expect(page.locator('.LoadingStageDisplay')).toHaveText(
      'Loading stage: 5 of 5, algorithms finished',
      { timeout: 15_000 },
    );
  }

  test('intro page', async ({ page }) => {
    await page.goto('./intro');
    await page.getByText('Explore the world').waitFor();
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
    await page.goto('./data?view=Details');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-details.png');
  });

  test('data page: Details: Language', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?view=Details&cmpID=zho');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-details-language.png');
  });

  test('data page: Drawer: Language', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?entID=zho&searchString=Chinese');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-drawer-language.png');
  });

  test('data page: Drawer: Locale', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?entID=eng_IN&searchString=English&entType=Locale');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-drawer-locale.png');
  });

  test('data page: Drawer: Territory', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?entID=ID&searchString=Ind&entType=Territory');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-drawer-territory.png');
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

  test('data page: Map Selection', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto(
      './data?view=Map&entType=Territory&territoryFilter=Africa+%5B002%5D&colorBy=%23+of+Languages&pinned=NG%2CBJ%2CTG%2CGH%2CCI&colorGradient=33',
    );
    await waitToFinishLoadingData(page);
    const mapComponent = page.locator('.EntityMap');
    await mapComponent.waitFor({ state: 'visible' });
    await expect(mapComponent).toHaveScreenshot('data-page-map-selection.png');
  });

  test('data page: Reports', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./data?view=Reports');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-reports.png');
  });

  test('data page: Filters', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto(
      './data?view=Cards&searchBy=ISO+Code&modalityFilter=-2%2C-1%2C0%2C1%2C2%2C3&writingSystemFilter=Simplified+Han+%5BHans%5D&territoryFilter=China+%5BCN%5D&isoStatus=9%2C3%2C1%2C0&populationMin=1&populationMax=6300000000&languageSource=Glottolog&languageScopes=3%2C4%2C5%2C6%2C7%2C2&languageFilter=Mandarin+Chinese+%5Bcmn%5D&languageFamilyFilter=Sino-Tibetan+%5Bsit%5D&searchString=m',
    );
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('data-page-filters.png');
  });

  test('decoder page', async ({ page }) => {
    await seedDeclinedConsent(page);
    await page.goto('./decoder');
    await waitToFinishLoadingData(page);
    await expect(page).toHaveScreenshot('decoder-page.png');
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
    await page.getByText('Explore the world').waitFor();
    await page.getByRole('dialog', { name: 'Cookie consent' }).waitFor();
    await expect(page).toHaveScreenshot('consent-banner.png');
  });
});
