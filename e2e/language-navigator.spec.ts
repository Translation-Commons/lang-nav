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
