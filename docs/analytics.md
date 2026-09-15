# Analytics

Lang Navigator uses [Amplitude](https://amplitude.com) for product analytics to understand how people use the app and inform development priorities.

## Setup

The Amplitude SDK (`@amplitude/unified`) is initialized in `src/shared/lib/amplitude.ts`. It requires a `VITE_AMPLITUDE_API_KEY` environment variable, resolved in `src/shared/lib/amplitudeConfig.ts` and shared by both clients: see `.env.example`. When the key is absent, all tracking is silently skipped. Tracking is disabled in dev builds (`npm run dev`) by default; only production builds (`npm run build`, `npm run build:cf`) send events. To also send events from `npm run dev` (useful for local verification), set `VITE_AMPLITUDE_DEV_ENABLED=true` in your `.env`.

There are two Amplitude clients in the app:

1. **The main instance** (`initAll`), which carries everything described under [What we track](#what-we-track) and is only initialized after the visitor clicks "Accept" in the consent banner.
2. **The essential instance** (`src/shared/lib/essentialTracking.ts`), a second client built with `createInstance()`, which sends exactly one event (`essential_visit`) and needs no consent to run. See [Essential visits](#essential-visits-essential_visit).

## What we track

Everything in this section except `essential_visit` is consent-gated: it rides on the main Amplitude instance, which is never initialized until the visitor accepts analytics. `essential_visit` is the single exception and is called out below.

### Essential visits (`essential_visit`)

Fired while the visitor has **not granted analytics consent**: before they decide, and also after they decline. Once they accept, this event stops and the full `page_viewed` event covers their visits instead, so every visitor's traffic is counted by one mechanism or the other, never by both at once.

It fires when the page path changes from the one most recently tracked, so navigating back and forth between two paths can re-fire the same path more than once in a visit. That mirrors how `page_viewed`'s dedup already works.

It exists to answer "how many visits did we get", not "who visited" or "what did they do". Properties:

- `pathname`: the route path (e.g., `/data`, `/about`)
- `referrer`: the origin of the referring site (e.g., `https://example.com`), if the browser reports one. Truncated to scheme and host inside `trackEssentialVisit`, so the referrer's path and query string are never sent

That is the whole payload. No search params, no filter/sort/view state, no entity IDs, no interaction data.

This event does not go through the main Amplitude instance. It is sent on a second, separate client created with `createInstance()` from `@amplitude/unified`, configured so that:

- **`identityStorage: 'none'`.** The device and session identity lives in memory for the current page load only. Nothing is written to a cookie or to `localStorage`. A refresh, or a new tab, produces a brand-new and disconnected identity. There is therefore no persistent identifier and no way to stitch one person's visits together over time, either within a day or across days.
- **`autocapture` fully disabled.** The instance emits only the one explicit `essential_visit` call: no automatic sessions, attribution, element clicks, form interactions, or file downloads.

Be accurate about what this does and does not claim. Amplitude's SDK still attaches request-level context on its side to every event it receives (coarse browser, OS, and device type, plus a timestamp), and this happens regardless of the `identityStorage` setting. The request is also a network call to a third-party vendor, so it carries the visitor's IP address at ingestion time along with the path and referrer. The defensible claims are: no cookie, no `localStorage`, no persistent cross-visit identifier, and a minimal, explicitly-scoped event. Not "no data leaves the browser", and not the same privacy posture as a self-hosted or IP-discarding tool.

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

Amplitude's autocapture is enabled for element clicks and sessions on the main (consented) instance. Page views are handled manually as described above. Autocapture is off entirely on the essential instance.

## Why we track

- **Essential visits** give us a basic traffic count (how many visits, to which pages, from where) that is not skewed by how many people accept the consent banner. It is deliberately the smallest event we could ship for that purpose.
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

`trackEvent` targets the main instance, so anything added this way is automatically consent-gated. Do not add events to the essential instance: it is scoped to the single `essential_visit` event on purpose, and widening it would break the claims made in the consent banner and the privacy policy.
