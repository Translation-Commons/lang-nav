/**
 * Diff-only utility: compares baseline screenshots with newly captured ones
 * and writes pixel-level diff images.
 *
 * Inputs:
 *   public/<name>.png         — baseline (old UI)
 *   public/current/<name>.png — new UI screenshots
 *
 * Output:
 *   public/diff/<name>.png    — pixel-level diff image
 *
 * Run via: npm run generate-diff
 *
 * This script does NOT capture screenshots, overwrite baselines, or modify
 * current images. It is strictly for diff generation.
 */

import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const CURRENT_DIR = path.join(PUBLIC_DIR, 'current');
const DIFF_DIR = path.join(PUBLIC_DIR, 'diff');

const IMAGES = ['preview', 'cardlist', 'table', 'hierarchy', 'map', 'reports'];

test('generate diff images', async () => {
  fs.mkdirSync(DIFF_DIR, { recursive: true });

  for (const name of IMAGES) {
    const baselinePath = path.join(PUBLIC_DIR, `${name}.png`);
    const currentPath = path.join(CURRENT_DIR, `${name}.png`);
    const diffPath = path.join(DIFF_DIR, `${name}.png`);

    if (!fs.existsSync(baselinePath)) {
      console.warn(`[${name}] baseline not found: ${baselinePath} — skipped`);
      continue;
    }

    if (!fs.existsSync(currentPath)) {
      console.warn(`[${name}] current image not found: ${currentPath} — skipped`);
      continue;
    }

    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const current = PNG.sync.read(fs.readFileSync(currentPath));

    if (baseline.width !== current.width || baseline.height !== current.height) {
      console.warn(
        `[${name}] dimension mismatch: ` +
          `baseline ${baseline.width}×${baseline.height} vs ` +
          `current ${current.width}×${current.height} — skipped`,
      );
      continue;
    }

    const { width, height } = baseline;
    const diff = new PNG({ width, height });

    const changedPixels = pixelmatch(baseline.data, current.data, diff.data, width, height, {
      threshold: 0.1,
      includeAA: false,
      diffColor: [0, 100, 220],
    });

    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    console.log(`[${name}] ${changedPixels} pixels changed → ${diffPath}`);
  }
});
