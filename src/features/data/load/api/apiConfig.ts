/**
 * Configuration for the read-only API, which serves the same data the TSV files
 * in `public/data` do.
 *
 * The API is OPTIONAL and off by default. With `VITE_API_URL` unset the app
 * loads everything from files exactly as it always has, so a contributor who
 * has never run the backend sees no difference and needs no database.
 *
 * This is deliberate rather than transitional. The migration converts one
 * entity at a time (territories first, in Phase 1), and until every entity has
 * moved, the file path has to keep working. Deleting it early would make
 * `npm run dev` depend on a local PostgreSQL and PostgREST.
 */

/** Trailing slashes are stripped so callers can always write `${base}/path`. */
export function getApiBaseUrl(): string | undefined {
  const url = import.meta.env.VITE_API_URL?.trim();
  return url ? url.replace(/\/+$/, '') : undefined;
}

export function isApiEnabled(): boolean {
  return getApiBaseUrl() != null;
}

/**
 * Headers every API request carries.
 *
 * Empty against a bare PostgREST, which is what runs locally. Supabase puts a
 * gateway in front of the same PostgREST and requires its anonymous key on
 * every request, sent BOTH as `apikey` and as a bearer token - the gateway
 * reads the first, PostgREST itself reads the second to decide which database
 * role the request runs as.
 *
 * The key is not a secret. It is compiled into the published JavaScript and is
 * meant to be public; what actually constrains a caller is the anonymous role's
 * grants and the row level security policies in `backend/schema/006_rls.sql`.
 * Never put a service-role key here - that one bypasses RLS entirely.
 */
function apiHeaders(): HeadersInit {
  const key = import.meta.env.VITE_API_KEY?.trim();
  if (!key) return {};
  return { apikey: key, Authorization: `Bearer ${key}` };
}

/**
 * Fetch and parse JSON from the API.
 *
 * THROWS on a bad status or an unreachable host, so callers can attach context
 * before deciding what to do. **Every entity loader must catch it and resolve
 * to undefined**, which is the contract `loadEntitiesFromFile` already has and
 * the one `CoreData.tsx` is built around: it awaits all the loaders in a single
 * `Promise.all`, then checks the results for null and alerts.
 *
 * Letting a rejection escape skips that check completely. The `Promise.all`
 * rejects, the alert never runs, and the app sits on "Loading stage: 1 of 4"
 * indefinitely with the cause visible only in the console. That was measured
 * with PostgREST stopped, not imagined.
 */
export async function fetchFromApi<T>(path: string, schema?: string): Promise<T> {
  const base = getApiBaseUrl();
  if (base == null) {
    throw new Error('fetchFromApi called with no VITE_API_URL configured');
  }

  // `Accept-Profile` selects a non-default schema. postgrest.conf exposes
  // "public,api" and resolves an unqualified name against public first, so the
  // base tables keep working unchanged and a view in `api` is reached only by
  // asking for it. Reversing that order would shadow every base table at once.
  //
  // `Prefer: count=exact` is what makes truncation detectable at all - see
  // assertNotTruncated, including why it is `exact` and not `planned`.
  const url = `${base}${path}`;
  const headers = {
    ...apiHeaders(),
    ...(schema ? { 'Accept-Profile': schema } : {}),
    Prefer: 'count=exact',
  };
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText} for ${url}`);
  }
  assertNotTruncated(response, url);
  return (await response.json()) as T;
}

/**
 * Throw if PostgREST sent only part of what was asked for.
 *
 * WHY THIS IS NOT OPTIONAL. `db-max-rows` is 100,000, and a capped response is
 * otherwise **indistinguishable from a complete one**: the rows parse, the
 * loader maps them, the page renders, and the only symptom is numbers that are
 * quietly too small. Nothing throws and no test can see it - a parity diff
 * compares two paths that are both missing the same rows. This project has
 * already been bitten by that shape once, when the census table sat at 602 rows
 * against 607 in the files and every check still passed.
 *
 * `locale` is the one to watch: 59,549 rows against a 100,000 cap.
 *
 * THE SIGNAL IS THE STATUS. With a count requested the response carries
 * `Content-Range: <first>-<last>/<total>` and PostgREST answers **200 when the
 * response is whole and 206 when it is partial** - including 200 when a limit
 * happens to equal the total exactly. Measured against the live API on
 * 2026-09-12:
 *
 *   no limit           -> 200, `0-288/289`
 *   limit=100          -> 206, `0-99/289`
 *   limit=289 (=total) -> 200, `0-288/289`
 *
 * `count=exact` AND NOT `count=planned`, WHICH IS A CORRECTNESS BUG HERE.
 * `planned` returns the PLANNER'S ESTIMATE, and on a FILTERED query that
 * estimate is a selectivity guess rather than a count. The real locale query
 * filters `locale_source=eq.StableDatabase`, and measured on the live API:
 *
 *   count=planned -> `0-11015/19850`, status 206   <- WRONG, nothing truncated
 *   count=exact   -> `0-11015/11016`, status 200   <- correct
 *
 * PostgREST derives the status by comparing what it sent against the total it
 * was given, so a wrong total produces a wrong status. With `planned` this
 * function threw on a healthy full response, the locale loader fell back to
 * TSV, and `loadLocalesParity` failed on `eng_GT`. That is how it was found.
 *
 * The usual argument for `planned` is cost, and at this data size it does not
 * hold. Median of 5 requests each, same machine, same database:
 *
 *   locale (filtered)   planned 497 ms   exact 480 ms   no header 461 ms
 *   language (27k)      planned 213 ms   exact 213 ms   no header 216 ms
 *   census (13.7k embed) planned 283 ms  exact 263 ms   no header 259 ms
 *
 * `exact` is inside the noise, and beat `planned` on two of the three, because
 * Postgres counts the rows during the scan it is already doing. Revisit only
 * if a table grows enough for the count to become a second pass.
 *
 * DO NOT COMPARE `received` TO `total` INSTEAD of reading the status. That
 * duplicates what PostgREST already did, and gains nothing once the total is
 * exact. The numbers are parsed only to make the error message readable.
 *
 * AN EMPTY RESULT REPORTS A BARE ASTERISK IN THE RANGE HALF, and is never
 * truncation. Under `count=exact` PostgREST pairs that with 200 - measured as
 * asterisk-over-zero for the empty `cldr_language_match`, and for a filter
 * matching nothing - so it does not reach the throw. The guard is kept because
 * under `count=planned` the same empty table answered asterisk-over-one with
 * **206**, the planner guessing a row for a table it had never analyzed, and a
 * check keyed on the status alone threw on a healthy empty response. Cheap
 * insurance against a count mode or a version that pairs them that way again.
 *
 * COUNTS PARENT ROWS ONLY. An embedded resource is not counted: `census` with
 * its 13,718 estimates embedded still reports `0-606/607`. So this guards the
 * parent row count, which is what `db-max-rows` caps.
 */
function assertNotTruncated(response: Response, url: string): void {
  if (response.status !== 206) return;

  const range = response.headers.get('Content-Range');

  // `*` in the range position is an empty result, not a truncated one.
  if (range == null || range.startsWith('*')) return;

  const [received, total] = range.split('/');
  throw new Error(
    `API response was TRUNCATED: received rows ${received} of ${total} for ${url}. ` +
      `This is silent data loss - the rows that arrived are valid, but rows are missing. ` +
      `Raise db-max-rows in postgrest.conf, or page through the result.`,
  );
}

/** JSON `null` means absent; every optional field these API loaders map onto
 *  is `?:`, not nullable. */
export function orUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined;
}
