# Testing

## Unit Tests

The project uses Vitest with React Testing Library for unit and component tests: run them with `npm run test:run`.

## Screenshot Tests

Screenshot (visual regression) tests use Playwright to capture full-page screenshots and compare them against committed baseline images. This catches unintended UI changes before they are merged.

### How it works

1. Playwright builds the app (`npm run build`), starts the Vite preview server, and launches a Chromium browser.
2. CSS animations and transitions are disabled for stable, deterministic screenshots.
3. Each test navigates to a page, waits for a specific element to confirm the page is ready, and takes a screenshot.
4. The screenshot is compared pixel-by-pixel against the baseline in `e2e/screenshots.spec.ts-snapshots/`.
5. If the diff exceeds the threshold (`maxDiffPixelRatio: 0.005`, with per-pixel color sensitivity `threshold: 0.1`), the test fails.

### Running locally

```bash
# Run screenshot tests against existing baselines
npm run test:screenshots

# Update baselines after intentional UI changes
npm run test:screenshots:update
```

### CI

Screenshot tests run automatically on pull requests via the `screenshot-tests.yml` GitHub Actions workflow. Playwright browser binaries are cached between runs. On failure, two artifacts are uploaded:

- **playwright-report** — an interactive HTML report with pass/fail details
- **screenshot-diffs** — the actual screenshots taken during the test run, plus diff images for any failed comparisons

Download the `screenshot-diffs` artifact to review the visual differences without needing to run the HTML report locally.

### Updating baselines

Baselines must be generated on the same environment as CI (Ubuntu) to avoid font rendering differences across OSes. The recommended way to update baselines is to add the `update-baselines` label to your PR:

1. Add the **`update-baselines`** label to your pull request.
2. The CI workflow will regenerate the baselines on Ubuntu, commit them to your branch, and remove the label automatically.
3. Pull the latest changes from your branch after the workflow completes.

You can also update locally with `npm run test:screenshots:update`, but local baselines may not match CI due to font rendering differences between Linux distros, macOS, and Windows.

### Screenshot resolution

Screenshots are captured at 1920x1080 with a `deviceScaleFactor` of 1, producing 1920x1080 images. These settings are configured in `playwright.config.ts` under the Chromium project. If you change the viewport or scale factor, regenerate all baselines with `npm run test:screenshots:update`.

### Adding a new screenshot test

Add a test to the `test.describe` block in `e2e/screenshots.spec.ts`:

```ts
test('my new page', async ({ page }) => {
  await page.goto('./my-route');
  // Wait for a specific element that confirms the page is ready
  await page.getByText('Page Title').waitFor();
  await expect(page).toHaveScreenshot('my-new-page.png');
});
```

Avoid using `waitForLoadState('networkidle')`: it is flaky. Instead, wait for a visible element that indicates the page has finished rendering.

Then run `npm run test:screenshots:update` to generate the initial baseline.
