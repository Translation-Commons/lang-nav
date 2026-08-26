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
export async function fetchFromApi<T>(path: string): Promise<T> {
  const base = getApiBaseUrl();
  if (base == null) {
    throw new Error('fetchFromApi called with no VITE_API_URL configured');
  }

  const url = `${base}${path}`;
  const response = await fetch(url, { headers: apiHeaders() });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText} for ${url}`);
  }
  return (await response.json()) as T;
}
