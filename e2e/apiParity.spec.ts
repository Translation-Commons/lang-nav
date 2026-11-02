import { expect, Page, test } from '@playwright/test';

// Tables wired to the API, and page URLs that must render the same in Local and API mode.
const API_URL = process.env.LANGNAV_API_URL ?? 'http://127.0.0.1:8000/api/v1';
const SORTS = ['Population', 'Name', 'Code', 'Literacy', 'Area', 'Latitude'];
const VARIANTS = ['', '&page=3', '&sortBehavior=-1'];
const CASES: { table: string; params: string }[] = SORTS.flatMap((sortBy) =>
  VARIANTS.map((extra) => ({
    table: 'Territory',
    params: `entType=Territory&view=Table&limit=10&sortBy=${encodeURIComponent(sortBy)}${extra}`,
  })),
);

type Rendered = { rows: string[]; meter: string; errors: string[] };

async function render(page: Page, source: 'local' | 'api', params: string): Promise<Rendered> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript((value) => {
    localStorage.setItem('data-source', value);
    localStorage.setItem(
      'langnav.consent',
      JSON.stringify({ analytics: 'denied', version: 1, timestamp: new Date().toISOString() }),
    );
  }, source);

  const pageLoaded =
    source === 'api'
      ? page.waitForResponse((r) => r.url().startsWith(API_URL), { timeout: 60_000 })
      : Promise.resolve();
  await page.goto(`./data?${params}`);
  // Both modes load the full graph; hover cards and names depend on it.
  await expect(page.locator('.LoadingStageDisplay')).toHaveText(
    'Loading stage: 5 of 5, algorithms finished',
    { timeout: 60_000 },
  );
  await pageLoaded;
  const table = page.locator('.EntityTable').first();
  await expect(table.locator('td').first()).toBeAttached();
  const rows = await table.evaluate((el) =>
    Array.from(el.querySelectorAll('tr'))
      .filter((tr) => tr.querySelector('td'))
      .map((tr) => (tr as HTMLElement).innerText.replace(/\s+/g, ' ').trim()),
  );
  const meter = await page
    .getByText(/of [\d,]+ results/)
    .first()
    .innerText();
  return { rows, meter, errors };
}

test.describe('Local and API modes render the same table', () => {
  // Each case loads the full graph twice; in parallel the loads starve each other of CPU.
  test.describe.configure({ mode: 'default' });

  test.beforeAll(async ({ request }) => {
    const up = await request
      .get(`${API_URL}/meta/`, { timeout: 3_000 })
      .then((r) => r.ok())
      .catch(() => false);
    test.skip(!up, `LangNav API not reachable at ${API_URL}`);
  });

  for (const { table, params } of CASES) {
    test(`${table}: ${params}`, async ({ browser }) => {
      const [localPage, apiPage] = [await browser.newPage(), await browser.newPage()];
      const apiCalls: string[] = [];
      localPage.on('request', (r) => r.url().startsWith(API_URL) && apiCalls.push(r.url()));

      const local = await render(localPage, 'local', params);
      const api = await render(apiPage, 'api', params);

      expect(api.errors).toEqual([]);
      expect(local.errors).toEqual([]);
      expect(apiCalls, 'Local mode must not call the API').toEqual([]);
      expect(api.rows.length).toBeGreaterThan(0);
      expect(api.meter).toBe(local.meter);
      expect(api.rows).toEqual(local.rows);
    });
  }
});
