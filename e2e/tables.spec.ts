import { expect, Page, test } from '@playwright/test';

import { EntityType } from '../src/features/params/PageParamTypes';
import TableID from '../src/features/table/TableID';
import ReportID from '../src/widgets/reports/ReportID';

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
    await seedDeclinedConsent(page);
  });

  async function snapshotTable(page: Page, urlParams: string, tableID?: TableID) {
    await page.goto(`./data?${urlParams}&limit=10`);

    // First wait to finish loading
    await expect(page.locator('.LoadingStageDisplay')).toHaveText(
      'Loading stage: 4 of 4, algorithms finished',
    );
    await page.waitForTimeout(1000);

    // Then take a snapshot of the table
    const table = tableID
      ? page.locator(`.EntityTable.Table${tableID}`).first()
      : page.locator(`.EntityTable`).first();
    await expect(table).toHaveScreenshot();
  }

  // Regular Entity Tables
  Object.values(EntityType).forEach((entityType) => {
    test(`${entityType} Table`, async ({ page }) => {
      await snapshotTable(
        page,
        `view=Table&entityType=${entityType}`,
        // TableID[`${entityType}Table`],
      );
    });
  });

  // Specialized Tables
  test(`Language Descendants Table`, async ({ page }) => {
    await snapshotTable(page, `view=Reports&reportID=` + ReportID.LanguageDescendants);
  });

  test(`Language Scope Issues Table`, async ({ page }) => {
    await snapshotTable(page, `view=Reports&reportID=` + ReportID.LanguageScopeIssues);
  });

  test(`Language Plurals Table`, async ({ page }) => {
    await snapshotTable(page, `view=Reports&reportID=` + ReportID.LanguagePlurals);
  });

  test(`Census Countries Table`, async ({ page }) => {
    await snapshotTable(
      page,
      `view=Reports&entityType=Census&reportID=` + ReportID.CensusCountries,
    );
  });

  test(`Indigeneity Table`, async ({ page }) => {
    await snapshotTable(
      page,
      `view=Reports&entityType=Locale&reportID=` + ReportID.LocaleIndigeneity,
    );
  });

  test(`Potential Locales Table`, async ({ page }) => {
    await snapshotTable(
      page,
      `view=Reports&entityType=Locale&reportID=` + ReportID.LocalesPotential,
    );
  });

  test(`Variant Annotation Table`, async ({ page }) => {
    await snapshotTable(
      page,
      `view=Reports&entityType=Variant&reportID=` + ReportID.VariantsAnnotationTool,
    );
  });

  test('Languages in Territory Table', async ({ page }) => {
    await snapshotTable(page, `entID=IN`, TableID.LanguagesInTerritory);
  });

  test('Languages in Census Table', async ({ page }) => {
    await snapshotTable(page, `entID=cldr.IN`, TableID.LanguagesInCensus);
  });
});
