/**
 * Script to capture/update preview images saved in public/.
 * Run via: npm run update-screenshots
 *
 * This is NOT a visual regression test — it overwrites public/*.png in place.
 */

import { Locator, Page, test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

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

/** Wait for the data page to finish loading. */
async function waitForDataPage(page: Page) {
  await page.waitForSelector('text=Loading...', { state: 'hidden', timeout: 30000 });
}

/**
 * Screenshot a locator clipped to the viewport height — captures only the
 * visible portion of the element, not its full scrollable content.
 */
async function screenshotVisible(page: Page, locator: Locator, filePath: string) {
  await locator.waitFor({ state: 'visible' });
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Element has no bounding box`);
  const viewport = page.viewportSize()!;
  const height = Math.min(box.height, viewport.height - box.y);
  await page.screenshot({ path: filePath, clip: { x: box.x, y: box.y, width: box.width, height } });
}

test('capture preview.png — full data page with navbar (cards view)', async ({ page }) => {
  await disableAnimations(page);
  await page.goto('./data?view=Cards');
  await waitForDataPage(page);
  await page.screenshot({
    path: path.join(PUBLIC_DIR, 'preview.png'),
    fullPage: false,
  });
});

test('capture cardlist.png — card grid without navbar', async ({ page }) => {
  await disableAnimations(page);
  await page.goto('./data?view=Cards');
  await waitForDataPage(page);
  const firstCard = page.locator('.CardInCardList').first();
  await firstCard.waitFor({ state: 'visible' });
  const grid = firstCard.locator('xpath=..');
  await screenshotVisible(page, grid, path.join(PUBLIC_DIR, 'cardlist.png'));
});

test('capture table.png — data page in table view', async ({ page }) => {
  await disableAnimations(page);
  await page.goto('./data?view=Table');
  await waitForDataPage(page);
  const table = page.locator('main table').first();
  await screenshotVisible(page, table, path.join(PUBLIC_DIR, 'table.png'));
});

test('capture hierarchy.png — hierarchy/tree view', async ({ page }) => {
  await disableAnimations(page);
  await page.goto('./data?view=Hierarchy');
  await waitForDataPage(page);
  const tree = page.locator('.TreeListRoot').first();
  await screenshotVisible(page, tree, path.join(PUBLIC_DIR, 'hierarchy.png'));
});

test('capture map.png — map view', async ({ page }) => {
  await disableAnimations(page);
  await page.goto('./data?view=Map');
  await waitForDataPage(page);
  const mapImg = page.locator('img[alt="World map"]');
  await mapImg.waitFor({ state: 'visible' });
  // grandparent = the bordered map container div
  const mapContainer = mapImg.locator('xpath=../..');
  await screenshotVisible(page, mapContainer, path.join(PUBLIC_DIR, 'map.png'));
});

test('capture reports.png — reports page', async ({ page }) => {
  await disableAnimations(page);
  await page.goto('./data?view=Reports');
  await waitForDataPage(page);
  // Report content is lazy-loaded — wait for all suspense boundaries to resolve
  await page.waitForLoadState('networkidle');
  const table = page.locator('main table').first();
  await screenshotVisible(page, table, path.join(PUBLIC_DIR, 'reports.png'));
});
