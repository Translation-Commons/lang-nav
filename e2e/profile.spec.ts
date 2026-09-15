import { expect, Page, test } from '@playwright/test';

/**
 * Measures what a user interaction actually costs in the running app.
 *
 * WHY THIS EXISTS. The Phase 3 plan proposes moving filtering and sorting into
 * the database, on the grounds that switching classification source re-runs
 * five recursive passes over ~38,000 objects. That describes the code
 * correctly, but nobody had timed it, and the alternative is a PostgREST round
 * trip measured at ~270 ms for a single 50-row page. Numbers from the running
 * app are the only way to tell which is actually cheaper.
 *
 * DRIVEN THROUGH URL PARAMS, NOT WIDGETS. `languageSource`, `sortBy` and
 * `searchString` are all page params, so navigating is exactly what the
 * controls do and it measures the recompute rather than a dropdown animation.
 * It is also stable: the controls are custom components, not `<select>`s, and
 * an earlier version of this file silently skipped two of the three
 * measurements because it went looking for elements that do not exist.
 *
 * The app is served from a production build, so these are realistic timings
 * rather than dev-server ones.
 *
 * It asserts only a generous ceiling, so it is a regression guard rather than
 * a benchmark that goes red on a busy machine. **The printed numbers are the
 * deliverable** - read them in the test output.
 */

/** Far above anything measured. A breach means something regressed badly. */
const CEILING_MS = 10_000;

const LOADED = 'Loading stage: 4 of 4, algorithms finished';

async function seedDeclinedConsent(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem(
        'langnav.consent',
        JSON.stringify({ analytics: 'denied', version: 1, timestamp: new Date().toISOString() }),
      );
    } catch {
      // Suppress: localStorage may not be available in all contexts
    }
  });
}

/** Waits for the table to be present and fully painted. */
async function settled(page: Page): Promise<void> {
  await expect(page.locator('.LoadingStageDisplay')).toHaveText(LOADED, { timeout: 180_000 });
  await expect(page.locator('.EntityTable').first()).toBeVisible();
  // Two frames: the first fires before the frame React's re-render paints in,
  // the second after it, so this covers the paint and not just the state
  // update.
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
}

/**
 * Times a batch of param changes INSIDE the page, and returns the median.
 *
 * Two things this avoids, both learned by getting them wrong first:
 *
 * `page.goto()` remeasures the whole cold start - fresh document, bundle
 * re-parsed, every loader re-run - which came out at ~13 s and says nothing
 * about the recompute. The app routes client-side, so pushing the query string
 * through History and letting the router react is what a control actually does.
 *
 * Timing from the TEST side adds a Playwright round trip per measurement, and
 * that noise is larger than the thing being measured: the same interaction
 * came out at 47 ms on one run and 950 ms on the next. Timing inside
 * `page.evaluate` keeps the clock next to the work. The median of several runs
 * then drops the first-call JIT warm-up, which is consistently ~2 s and is not
 * what a user meets after the first interaction.
 */
async function medianParamChange(page: Page, queries: string[]): Promise<number[]> {
  return page.evaluate(async (qs: string[]) => {
    const frame = () =>
      new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const times: number[] = [];
    for (const q of qs) {
      const started = performance.now();
      window.history.pushState({}, '', q);
      window.dispatchEvent(new PopStateEvent('popstate'));
      await frame();
      times.push(performance.now() - started);
    }
    return times;
  }, queries);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** Reports one interaction's median and its raw samples. */
async function report(page: Page, label: string, queries: string[]): Promise<number> {
  const times = await medianParamChange(page, queries);
  const m = median(times);
  console.log(
    `[profile] ${label.padEnd(22)} median ${m.toFixed(0).padStart(4)} ms  ` +
      `samples=[${times.map((t) => t.toFixed(0)).join(', ')}]`,
  );
  return m;
}

test.describe('interaction cost', () => {
  // The full dataset loads well past Playwright's 30 s default.
  test.setTimeout(300_000);

  test.beforeEach(async ({ page }) => {
    await seedDeclinedConsent(page);
  });

  test('source switch, search and sort each stay responsive', async ({ page }) => {
    const base = './data?view=Table&entType=Language';

    const started = Date.now();
    await page.goto(base);
    await settled(page);
    console.log(`[profile] initial load, empty cache: ${Date.now() - started} ms`);

    // 1. CLASSIFICATION SOURCE - the interaction Phase 3 names as its reason.
    // This re-runs updateEntitiesBasedOnDataParams over every languoid:
    // parents/descendants, populations, names and codes, the recursive
    // vitality and digital-support passes, and largest-descendant.
    const sourceMs = await report(
      page,
      'classification source',
      ['ISO', 'Glottolog', 'CLDR', 'ISO', 'Glottolog', 'CLDR'].map(
        (s) => `${base}&languageSource=${s}`,
      ),
    );
    expect(sourceMs).toBeLessThan(CEILING_MS);

    // 2. SORT - half of what Phase 3 proposes to move server-side.
    const sortMs = await report(
      page,
      'sort',
      ['Name', 'Population', 'Code', 'Name', 'Population', 'Code'].map(
        (f) => `${base}&sortBy=${f}`,
      ),
    );
    expect(sortMs).toBeLessThan(CEILING_MS);

    // 3. SEARCH - what Phase 4 proposes to move onto the trigram/FTS indexes.
    const searchMs = await report(
      page,
      'search',
      ['span', 'a', 'zzz', 'ng', 'span', 'xy'].map((t) => `${base}&searchString=${t}`),
    );
    expect(searchMs).toBeLessThan(CEILING_MS);
  });
});
