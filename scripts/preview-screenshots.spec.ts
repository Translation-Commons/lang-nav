/// <reference types="node" />

/**
 * Script to capture/update preview images saved in public/.
 * Run via: npm run update-screenshots
 *
 * This is NOT a visual regression test — it overwrites public/*.png in place.
 */

import path from 'path';
import { fileURLToPath } from 'url';

import { Locator, Page, test } from '@playwright/test';

type Clip = { x: number; y: number; width: number; height: number };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

/** Disable CSS animations/transitions for stable captures. */
async function disableAnimations(page: Page) {
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

/** Pre-seed denied analytics consent so the cookie banner doesn't overlay screenshots. */
async function dismissConsentBanner(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'langnav.consent',
      JSON.stringify({
        analytics: 'denied',
        version: 1,
        timestamp: new Date().toISOString(),
      }),
    );
  });
}

/** Wait for the data page to finish loading. */
async function waitForDataPage(page: Page) {
  await page.waitForSelector('text=Loading...', { state: 'hidden', timeout: 30000 });
}

/** Wait for the locator to be visible and return its bounding box. */
async function getBox(locator: Locator) {
  await locator.waitFor({ state: 'visible' });
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Element has no bounding box`);
  return box;
}

/** Screenshot the given clip rect after a short settle delay. */
async function screenshotClip(page: Page, filePath: string, clip: Clip) {
  await page.waitForTimeout(1000);
  await page.screenshot({ path: filePath, clip });
}

test('capture preview.png — full data page with navbar (cards view)', async ({ page }) => {
  await disableAnimations(page);
  await dismissConsentBanner(page);
  await page.goto('./data?view=Cards');
  await waitForDataPage(page);
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(PUBLIC_DIR, 'preview.png'),
    fullPage: false,
  });
});

test('capture cardlist.png — card grid without navbar', async ({ page }) => {
  await disableAnimations(page);
  await dismissConsentBanner(page);
  await page.goto('./data?view=Cards');
  await waitForDataPage(page);
  const firstCard = page.locator('.CardInCardList').first();
  await firstCard.waitFor({ state: 'visible' });
  const grid = firstCard.locator('xpath=..');
  const box = await getBox(grid);
  await screenshotClip(page, path.join(PUBLIC_DIR, 'cardlist.png'), {
    x: box.x - 5,
    y: box.y - 5,
    width: 600,
    height: 600,
  });
});

test('capture table.png — data page in table view', async ({ page }) => {
  await disableAnimations(page);
  await dismissConsentBanner(page);
  await page.goto('./data?view=Table');
  await waitForDataPage(page);
  const table = page.locator('main table').first();
  await table.locator('tbody tr').first().waitFor({ state: 'visible' });
  const box = await getBox(table);
  await screenshotClip(page, path.join(PUBLIC_DIR, 'table.png'), {
    x: box.x - 5,
    y: box.y - 5,
    width: 600,
    height: 600,
  });
});

test('capture hierarchy.png — hierarchy/tree view', async ({ page }) => {
  await disableAnimations(page);
  await dismissConsentBanner(page);
  await page.goto('./data?view=Hierarchy');
  await waitForDataPage(page);
  const tree = page.locator('.TreeListRoot').first();
  const box = await getBox(tree);
  await screenshotClip(page, path.join(PUBLIC_DIR, 'hierarchy.png'), {
    x: box.x - 5,
    y: box.y - 5,
    width: 600,
    height: 600,
  });
});

test('capture map.png — territory map colored by number of languages', async ({ page }) => {
  await disableAnimations(page);
  await dismissConsentBanner(page);
  await page.goto('./data?view=Map&objectType=Territory&colorBy=%23+of+Languages');
  await waitForDataPage(page);
  const mapImg = page.locator('img[alt="World map"]');
  await mapImg.waitFor({ state: 'visible' });
  // grandparent = the bordered map container div
  const mapContainer = mapImg.locator('xpath=../..');
  const box = await getBox(mapContainer);
  await screenshotClip(page, path.join(PUBLIC_DIR, 'map.png'), {
    x: box.x - 5 + 300,
    y: box.y - 5,
    width: 600,
    height: 600,
  });
});

test('capture reports.png — reports page', async ({ page }) => {
  await disableAnimations(page);
  await dismissConsentBanner(page);
  await page.goto('./data?view=Reports');
  await waitForDataPage(page);
  // Report content is lazy-loaded — wait for all suspense boundaries to resolve
  await page.waitForLoadState('networkidle');
  const reportSection = page.locator('[data-testid="reports-view"]');
  const box = await getBox(reportSection);
  await screenshotClip(page, path.join(PUBLIC_DIR, 'reports.png'), {
    x: box.x - 5,
    y: box.y - 5,
    width: 600,
    height: 600,
  });
});
