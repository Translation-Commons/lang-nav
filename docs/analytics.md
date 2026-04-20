# Analytics

Lang Navigator uses [Amplitude](https://amplitude.com) for product analytics to understand how people use the app and inform development priorities.

## Setup

The Amplitude SDK (`@amplitude/unified`) is initialized in `src/shared/lib/amplitude.ts`. It requires a `VITE_AMPLITUDE_API_KEY` environment variable: see `.env.example`. When the key is absent, all tracking is silently skipped. Tracking is disabled in dev builds (`npm run dev`) by default; only production builds (`npm run build`, `npm run build:cf`) send events. To also send events from `npm run dev` (useful for local verification), set `VITE_AMPLITUDE_DEV_ENABLED=true` in your `.env`.

## What we track

### Page views (`page_viewed`)

Every route change fires a `page_viewed` event with:

- `page`: full path + query string
- `pathname`: the route path (e.g., `/data`, `/about`)
- `params`: a JSON object of all URL search params as key-value pairs

Since the app's UI state (filters, sort, view, object type, etc.) is driven by URL params, this single event captures the full context of what the user is looking at. Autocapture page views are disabled in favor of this manual approach so that params are sent as structured data rather than a raw URL string.

### Data exports (`data_exported`)

Fired when a user exports data from the table view. Properties:

- `export_type`: the format chosen (e.g., "Download CSV", "Copy TSV", "Download UNESCO TSV")
- `object_type`: what entity type is being exported (Language, Locale, Territory, etc.)
- `row_count`: number of rows exported
- `column_count`: number of visible columns (table exports)
- `territory_code`: territory ID (UNESCO territory exports)

### Autocapture

Amplitude's autocapture is enabled for element clicks and sessions. Page views are handled manually as described above.

## Why we track

- **Page views with params** tell us which views, object types, and filters are most used, helping prioritize features and identify unused functionality.
- **Export events** tell us how often people extract data, in what formats, and at what scale, which informs whether to invest in better export tooling.

## Adding new events

Use the `trackEvent` function exported from `src/shared/lib/amplitude.ts`:

```ts
import { trackEvent } from '@shared/lib/amplitude';

trackEvent('event_name', {
  property: 'value',
});
```

Only add tracking for interactions that are not already captured by URL param changes. If an interaction changes the URL, it is already tracked via `page_viewed`.
