/**
 * Script to capture/update preview images saved in public/.
 * Run via: npm run update-screenshots
 *
 * This is NOT a visual regression test — it overwrites public/*.png in place.
 */

import { test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

/** Disable CSS animations/transitions for stable captures. */
async function disableAnimations(page: import('@playwright/test').Page) {
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
async function waitForDataPage(page: import('@playwright/test').Page) {
  await page.waitForSelector('text=Loading...', { state: 'hidden', timeout: 30000 });
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
  const main = page.locator('main').first();
  await main.screenshot({ path: path.join(PUBLIC_DIR, 'cardlist.png') });
});

test('capture table.png — data page in table view', async ({ page }) => {
  await disableAnimations(page);
  await page.goto('./data?view=Table');
  await waitForDataPage(page);
  const main = page.locator('main').first();
  await main.screenshot({ path: path.join(PUBLIC_DIR, 'table.png') });
});

test('capture hierarchy.png — hierarchy/tree view', async ({ page }) => {
  await disableAnimations(page);
  await page.goto('./data?view=Hierarchy');
  await waitForDataPage(page);
  const main = page.locator('main').first();
  await main.screenshot({ path: path.join(PUBLIC_DIR, 'hierarchy.png') });
});

test('capture map.png — map view', async ({ page }) => {
  await disableAnimations(page);
  await page.goto('./data?view=Map');
  await waitForDataPage(page);
  const main = page.locator('main').first();
  await main.screenshot({ path: path.join(PUBLIC_DIR, 'map.png') });
});

test('capture reports.png — reports page', async ({ page }) => {
  await disableAnimations(page);
  await page.goto('./data?view=Reports');
  await waitForDataPage(page);
  const main = page.locator('main').first();
  await main.screenshot({ path: path.join(PUBLIC_DIR, 'reports.png') });
});
