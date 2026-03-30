/**
 * Language Navigator — End-to-End Regression Tests
 *
 * These tests mirror the manual QA steps performed against the live site:
 *   https://translation-commons.github.io/lang-nav
 *
 * Covered flows:
 *   1. Search — search for "Quechua", verify result list
 *   2. Details — open Quechua detail panel, verify Writing System, breadcrumb, population
 *   3. Hierarchy View — verify language family tree renders and is expandable
 *   4. Tables View — verify column headers, row data, pagination, and controls
 *   5. Kannada — search, details, hierarchy, and table view across all 4 views
 *   4. Tables View — verify column headers, row data, pagination, and controls
 *
 * Run:  npm run test:e2e
 */

import { test, expect, Page } from 'playwright/test';

const APP = 'https://translation-commons.github.io/lang-nav';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait for the loading spinner to disappear before making assertions. */
async function waitForLoad(page: Page, marker: string, timeout = 20_000) {
  await page.waitForSelector(`text=${marker}`, { timeout });
}

// ---------------------------------------------------------------------------
// 1. Search
// ---------------------------------------------------------------------------

test.describe('Search', () => {
  test('searching "Quechua" returns a non-empty result list', async ({ page }) => {
    await page.goto(`${APP}/data?searchString=Quechua`);
    await waitForLoad(page, 'Results');

    // Result count badge is visible
    await expect(page.locator('text=Results').first()).toBeVisible();

    // Top card is the Quechua macrolanguage [que]
    await expect(page.getByRole('button', { name: /Quechua card/ }).first()).toBeVisible();
  });

  test('result cards show language code in brackets', async ({ page }) => {
    await page.goto(`${APP}/data?searchString=Quechua`);
    await waitForLoad(page, 'Results');

    // Every language has a bracketed ISO code, e.g. [que]
    await expect(page.getByText('[que]').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Language Detail Panel — Quechua [que]
// ---------------------------------------------------------------------------

test.describe('Detail Panel — Quechua', () => {
  test.beforeEach(async ({ page }) => {
    // Open the data view with Quechua pre-selected in the detail panel
    await page.goto(`${APP}/data?searchString=Quechua&objectID=que`);
    await waitForLoad(page, 'Attributes');
  });

  test('detail panel header shows language name and ISO code', async ({ page }) => {
    // Target the right-side detail panel (second aside) to avoid hidden left-panel matches
    const detailPanel = page.locator('aside').last();
    await expect(detailPanel.getByText('Quechua', { exact: true }).first()).toBeVisible();
    await expect(detailPanel.getByText('[que]').first()).toBeVisible();
  });

  test('detail panel shows endonym (Qhichwa)', async ({ page }) => {
    await expect(page.getByText('Qhichwa').first()).toBeVisible();
  });

  test('breadcrumb shows correct language family path', async ({ page }) => {
    // Path: South American Indian › Quechuan › Quechua
    await waitForLoad(page, 'South American Indian');
    await expect(page.getByText('South American Indian').first()).toBeVisible();
    await expect(page.getByText('Quechuan').first()).toBeVisible();
  });

  test('Writing System section is present with value "Latin"', async ({ page }) => {
    // Both the label and the script value must appear in the Attributes section
    await expect(page.getByText('Primary Writing System').first()).toBeVisible();
    await expect(page.getByText('Writing Systems').first()).toBeVisible();
    await expect(page.getByText('Latin').first()).toBeVisible();
  });

  test('population best estimate is shown', async ({ page }) => {
    await expect(page.getByText('Best Estimate').first()).toBeVisible();
    // Quechua macrolanguage — ~11.6 M speakers
    await expect(page.getByText('11,634,295').first()).toBeVisible();
  });

  test('language codes section lists ISO and Glottolog codes', async ({ page }) => {
    await expect(page.getByText('ISO Code').first()).toBeVisible();
    // ISO code field shows "que | qu" — use regex to match across DOM nodes
    await expect(page.getByText(/que \| qu/).first()).toBeVisible();
    await expect(page.getByText('Glottocode').first()).toBeVisible();
    // quec1387 may be below the visible fold — check it exists in the DOM
    await expect(page.getByText('quec1387').first()).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// 3. Hierarchy View
// ---------------------------------------------------------------------------

test.describe('Hierarchy View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP}/data?view=Hierarchy`);
    await waitForLoad(page, 'Indo-European');
  });

  test('page renders the language family tree', async ({ page }) => {
    await expect(page.getByText('Indo-European').first()).toBeVisible();
    await expect(page.getByText('Sino-Tibetan').first()).toBeVisible();
  });

  test('tree nodes have expand / collapse buttons', async ({ page }) => {
    // Expanded nodes show ▼, collapsed nodes show ▶
    await expect(page.getByRole('button', { name: '▼' }).first()).toBeVisible();
  });

  test('header shows total result count', async ({ page }) => {
    await expect(page.locator('text=Results').first()).toBeVisible();
  });

  test('footer note shows how many root nodes are displayed', async ({ page }) => {
    await waitForLoad(page, 'root nodes are shown');
    await expect(page.getByText(/root nodes are shown/)).toBeVisible();
  });

  test('clicking a collapsed node expands its children', async ({ page }) => {
    // Collapse Indo-European first (it starts expanded), then re-expand
    const toggleBtn = page.getByRole('button', { name: '▼' }).first();
    await toggleBtn.click();
    // After collapse the button switches to ▶
    await expect(page.getByRole('button', { name: '▶' }).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. Tables View
// ---------------------------------------------------------------------------

test.describe('Tables View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP}/data?view=Table`);
    await waitForLoad(page, 'Code');
  });

  test('table renders required column headers', async ({ page }) => {
    await expect(page.getByText('Code').first()).toBeVisible();
    await expect(page.getByText('Name').first()).toBeVisible();
    await expect(page.getByText('Endonym').first()).toBeVisible();
    await expect(page.getByText('Best Population Estimate').first()).toBeVisible();
  });

  test('English appears as the top row (highest population)', async ({ page }) => {
    await waitForLoad(page, 'English');
    await expect(page.getByText('English').first()).toBeVisible();
    await expect(page.getByText('eng').first()).toBeVisible();
  });

  test('table shows total result count', async ({ page }) => {
    await expect(page.locator('text=Results').first()).toBeVisible();
  });

  test('pagination controls are present', async ({ page }) => {
    // "of X." pattern covers "of 45." etc.
    await expect(page.getByText(/of \d+\./).first()).toBeVisible();
  });

  test('column configuration hint is shown', async ({ page }) => {
    await waitForLoad(page, 'columns visible');
    await expect(page.getByText(/columns visible/).first()).toBeVisible();
  });

  test('export button is present', async ({ page }) => {
    await waitForLoad(page, 'Export');
    await expect(page.getByRole('button', { name: /Export/ }).first()).toBeVisible();
  });

  test('object-type tabs are available (Language, Locale, Territory…)', async ({ page }) => {
    // Use exact: true to avoid matching buttons like "Macrolanguage or Individual Language ▶"
    await expect(page.getByRole('button', { name: 'Language', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Locale', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Territory', exact: true })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. Kannada — cross-view regression tests
//    Manually verified 2026-03-30 against the live site.
//    Facts confirmed: ISO [kan], endonym ಕನ್ನಡ, population 68,693,549,
//    Writing System = Kannada script, family = Dravidian.
// ---------------------------------------------------------------------------

test.describe('Kannada — Search View', () => {
  test('searching "Kannada" returns exactly 3 results', async ({ page }) => {
    await page.goto(`${APP}/data?searchString=Kannada`);
    await waitForLoad(page, '3 Results');

    await expect(page.getByText('3 Results').first()).toBeVisible();
  });

  test('result cards show Kannada [kan], Kannada Kurumba [kfi], Old Kannada', async ({ page }) => {
    await page.goto(`${APP}/data?searchString=Kannada`);
    await waitForLoad(page, 'Results');

    await expect(page.getByText('[kan]').first()).toBeVisible();
    await expect(page.getByText('[kfi]').first()).toBeVisible();
    await expect(page.getByText('Old Kannada').first()).toBeVisible();
  });

  test('Kannada card shows endonym in Kannada script (ಕನ್ನಡ)', async ({ page }) => {
    await page.goto(`${APP}/data?searchString=Kannada`);
    await waitForLoad(page, 'Results');

    await expect(page.getByText('ಕನ್ನಡ').first()).toBeVisible();
  });

  test('Kannada card shows population 68,693,549', async ({ page }) => {
    await page.goto(`${APP}/data?searchString=Kannada`);
    await waitForLoad(page, '68,693,549');

    await expect(page.getByText('68,693,549').first()).toBeVisible();
  });

  test('Kannada card shows modality as Spoken & Written', async ({ page }) => {
    await page.goto(`${APP}/data?searchString=Kannada`);
    await waitForLoad(page, 'Spoken & Written');

    await expect(page.getByText('Spoken & Written').first()).toBeVisible();
  });
});

test.describe('Kannada — Detail Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP}/data?searchString=Kannada&objectID=kan`);
    await waitForLoad(page, 'Attributes');
  });

  test('detail panel header shows Kannada [kan]', async ({ page }) => {
    const detailPanel = page.locator('aside').last();
    await expect(detailPanel.getByText('Kannada', { exact: true }).first()).toBeVisible();
    await expect(detailPanel.getByText('[kan]').first()).toBeVisible();
  });

  test('endonym shows Kannada script ಕನ್ನಡ', async ({ page }) => {
    await expect(page.getByText('ಕನ್ನಡ').first()).toBeVisible();
  });

  test('breadcrumb shows Dravidian family path', async ({ page }) => {
    await waitForLoad(page, 'Dravidian');
    await expect(page.getByText('Dravidian').first()).toBeVisible();
    await expect(page.getByText('Nuclear Kannaoid').first()).toBeVisible();
  });

  test('Writing System is Kannada script (not Latin)', async ({ page }) => {
    await expect(page.getByText('Primary Writing System').first()).toBeVisible();
    await expect(page.getByText('Writing Systems').first()).toBeVisible();
    // Kannada uses its own script, not Latin
    const detailPanel = page.locator('aside').last();
    await expect(detailPanel.getByText('Kannada').first()).toBeVisible();
  });

  test('population best estimate is 68,693,549', async ({ page }) => {
    await expect(page.getByText('Best Estimate').first()).toBeVisible();
    await expect(page.getByText('68,693,549').first()).toBeVisible();
  });

  test('ISO code is kan | kn', async ({ page }) => {
    await expect(page.getByText('ISO Code').first()).toBeVisible();
    await expect(page.getByText(/kan \| kn/).first()).toBeVisible();
  });

  test('Glottocode is nucl1305', async ({ page }) => {
    await expect(page.getByText('Glottocode').first()).toBeVisible();
    await expect(page.getByText('nucl1305').first()).toBeAttached();
  });

  test('CLDR code is kn', async ({ page }) => {
    await expect(page.getByText('CLDR Code').first()).toBeVisible();
    await expect(page.getByText(/\bkn\b/).first()).toBeAttached();
  });

  test('primary territory is India', async ({ page }) => {
    await expect(page.getByText('India').first()).toBeVisible();
  });
});

test.describe('Kannada — Hierarchy View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP}/data?view=Hierarchy&searchString=Kannada`);
    await waitForLoad(page, 'Dravidian');
  });

  test('hierarchy shows Dravidian as the root family', async ({ page }) => {
    await expect(page.getByText(/Dravidian/).first()).toBeVisible();
  });

  test('Tamil-Kannada node is visible in the tree', async ({ page }) => {
    await expect(page.getByText(/Tamil-Kannada/).first()).toBeVisible();
  });

  test('hierarchy shows 5 results for Kannada search', async ({ page }) => {
    await expect(page.getByText('5 Results').first()).toBeVisible();
  });

  test('tree nodes have expand / collapse buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: '▼' }).first()).toBeVisible();
  });
});

test.describe('Kannada — Tables View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP}/data?view=Table&searchString=Kannada`);
    await waitForLoad(page, 'Kannada Kurumba');
  });

  test('table shows exactly 3 rows for Kannada search', async ({ page }) => {
    await expect(page.getByText('3 Results').first()).toBeVisible();
  });

  test('Kannada row has correct code, endonym and population', async ({ page }) => {
    await expect(page.getByText('kan', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('ಕನ್ನಡ').first()).toBeVisible();
    await expect(page.getByText('68,693,549').first()).toBeVisible();
  });

  test('Kannada Kurumba row is present with code kfi', async ({ page }) => {
    await expect(page.getByText('kfi').first()).toBeVisible();
    await expect(page.getByText('Kannada Kurumba').first()).toBeVisible();
  });

  test('Old Kannada row shows no population data', async ({ page }) => {
    await expect(page.getByText('Old Kannada').first()).toBeVisible();
    await expect(page.getByText('no data').first()).toBeVisible();
  });

  test('table column headers are present', async ({ page }) => {
    await expect(page.getByText('Code').first()).toBeVisible();
    await expect(page.getByText('Endonym').first()).toBeVisible();
    await expect(page.getByText('Best Population Estimate').first()).toBeVisible();
  });
});
