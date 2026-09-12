import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchFromApi } from '../apiConfig';

/**
 * Truncation detection, tested against the exact responses the live API was
 * measured to produce on 2026-09-12 - not against invented ones.
 *
 * The behaviour under test is the reason Phase 3 can start: `db-max-rows` is
 * 100,000 and a capped response is otherwise indistinguishable from a complete
 * one, so the failure is silent data loss rather than an error.
 */

const API_URL = 'http://localhost:3000';

/** A response shaped like PostgREST's, with the status and Content-Range that
 *  matter and a body that parses. */
function postgrestResponse(status: number, contentRange: string | null, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: contentRange == null ? {} : { 'Content-Range': contentRange },
  });
}

describe('fetchFromApi truncation detection', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', API_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('asks for an EXACT count, so that Content-Range carries a usable total', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(postgrestResponse(200, '0-288/289', [{ id: 'US' }]));

    await fetchFromApi('/territory?select=id');

    // Without a count header PostgREST reports `0-288/*` and truncation cannot
    // be detected at all. It must be `exact`: see the filtered-query test
    // below for what `planned` does to a healthy response.
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers.Prefer).toBe('count=exact');
  });

  it('does not report truncation for a filtered query that returned everything', async () => {
    // REGRESSION, and the reason the header is `exact`. The real locale query
    // filters `locale_source=eq.StableDatabase`. With `count=planned` the live
    // API answered `0-11015/19850` with status 206 - a selectivity GUESS, not
    // a count - so this function threw on a complete response, the locale
    // loader fell back to TSV, and loadLocalesParity failed on `eng_GT`.
    // With `count=exact` the same request answers `0-11015/11016` and 200.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      postgrestResponse(200, '0-11015/11016', [{ id: 'eng_GT' }]),
    );

    await expect(
      fetchFromApi('/locale?select=id&locale_source=eq.StableDatabase'),
    ).resolves.toEqual([{ id: 'eng_GT' }]);
  });

  it('accepts a complete response (200, full range)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      postgrestResponse(200, '0-288/289', [{ id: 'US' }]),
    );

    await expect(fetchFromApi('/territory?select=id')).resolves.toEqual([{ id: 'US' }]);
  });

  it('accepts a response whose limit happens to equal the total exactly', async () => {
    // Measured: limit=289 against 289 rows returns 200, not 206. A check keyed
    // on "was a limit applied" rather than on the status would fail here.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      postgrestResponse(200, '0-288/289', [{ id: 'US' }]),
    );

    await expect(fetchFromApi('/territory?select=id&limit=289')).resolves.toEqual([{ id: 'US' }]);
  });

  it('THROWS on a truncated response (206, short range)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      postgrestResponse(206, '0-99/289', [{ id: 'US' }]),
    );

    await expect(fetchFromApi('/territory?select=id&limit=100')).rejects.toThrow(/TRUNCATED/);
  });

  it('names both numbers in the error, so the cause is readable without a debugger', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      postgrestResponse(206, '0-99999/250000', [{ id: 'US' }]),
    );

    await expect(fetchFromApi('/locale?select=id')).rejects.toThrow(/0-99999 of 250000/);
  });

  it('accepts an empty result whose range half is a bare asterisk', async () => {
    // An empty result has no range to report, so PostgREST sends `*` in the
    // range half. Under `count=exact` it pairs that with 200 (measured:
    // `*/0` against the empty `cldr_language_match`, and against a filter
    // matching nothing), so this case does not reach the throw anyway.
    //
    // The 206 here is deliberately the HARDER version of the input: under
    // `count=planned` an unanalyzed empty table answered `*/1` with 206, and a
    // check keyed on the status alone threw on it. Keeping the guard and
    // testing it at 206 means the function stays correct if a count mode or a
    // PostgREST version reintroduces that pairing.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(postgrestResponse(206, '*/1', []));

    await expect(fetchFromApi('/cldr_language_match?select=id')).resolves.toEqual([]);
  });

  it('accepts a 206 with no Content-Range at all rather than guessing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(postgrestResponse(206, null, [{ id: 'US' }]));

    await expect(fetchFromApi('/territory?select=id')).resolves.toEqual([{ id: 'US' }]);
  });

  it('still throws on a real HTTP error, ahead of the truncation check', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(postgrestResponse(500, null, {}));

    await expect(fetchFromApi('/territory?select=id')).rejects.toThrow(/API request failed: 500/);
  });
});
