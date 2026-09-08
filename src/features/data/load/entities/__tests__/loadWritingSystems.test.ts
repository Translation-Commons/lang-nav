import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getServer } from '@tests/testServer';

import { loadWritingSystems } from '../loadWritingSystems';

/**
 * `loadWritingSystemsFromApi.test.ts` covers the mapping in isolation. This
 * covers the branch in `loadWritingSystems()` itself: does it actually fall
 * back to the TSV file when the API fails, and does it actually use the API
 * response when the API succeeds.
 */

const API_URL = 'http://localhost:3000';

describe('loadWritingSystems', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('falls back to the TSV file when the API is unreachable', async () => {
    vi.stubEnv('VITE_API_URL', API_URL);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const server = await getServer();
    server.use(
      http.get(`${API_URL}/writing_system`, () => HttpResponse.json(null, { status: 503 })),
    );

    const writingSystems = await loadWritingSystems();

    expect(writingSystems).not.toBeUndefined();
    // Latn is in every build of writingSystems.tsv; real TSV data, not a stub.
    expect(writingSystems?.Latn?.nameDisplay).toBeTruthy();
    expect(console.warn).toHaveBeenCalledWith(
      'Writing system API load failed; falling back to TSV files.',
    );
  });

  // setupTests.ts sets onUnhandledRequest: 'error' and no handler is
  // registered for /writing_system here, so this fails loudly - not just by
  // assertion - the moment the loader tries to reach an API it shouldn't know
  // about, which is a stronger proof than spying on fetch would be.
  it('never touches the API when VITE_API_URL is unset', async () => {
    vi.stubEnv('VITE_API_URL', '');
    await getServer();

    const writingSystems = await loadWritingSystems();

    expect(writingSystems?.Latn?.nameDisplay).toBeTruthy();
  });

  // Documents a known, shared gap rather than asserting a fix: `fromApi != null`
  // in loadWritingSystems() treats an empty dictionary as a successful load,
  // same as every other migrated entity's loader. A canary, not a regression
  // test - if this behavior is ever intentionally changed, this test should
  // be updated alongside it, not treated as broken.
  it('treats an empty API response as a successful, if empty, load', async () => {
    vi.stubEnv('VITE_API_URL', API_URL);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const server = await getServer();
    server.use(http.get(`${API_URL}/writing_system`, () => HttpResponse.json([])));

    const writingSystems = await loadWritingSystems();

    expect(writingSystems).toEqual({});
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('uses the API response when the API succeeds', async () => {
    vi.stubEnv('VITE_API_URL', API_URL);
    const server = await getServer();
    server.use(
      http.get(`${API_URL}/writing_system`, () =>
        HttpResponse.json([
          {
            id: 'Zzzz',
            scope: 'Special Code',
            name_full: 'Test writing system',
            unicode_version: null,
            sample: null,
            right_to_left: null,
            primary_language_id: null,
            territory_of_origin_id: null,
            parent_writing_system_id: null,
            entity: { name_display: 'Test writing system', name_endonym: null },
            writing_system_contains: [],
          },
        ]),
      ),
    );

    const writingSystems = await loadWritingSystems();

    expect(Object.keys(writingSystems ?? {})).toEqual(['Zzzz']);
    expect(writingSystems?.Zzzz?.nameDisplay).toBe('Test writing system');
  });
});
