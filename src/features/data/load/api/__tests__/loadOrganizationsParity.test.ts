import { http, passthrough } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { OrganizationData } from '@entities/org/OrganizationTypes';

import { getServer, makeFileAvailable } from '@tests/testServer';

import { loadOrganizations } from '../../entities/loadOrganizations';

/**
 * Checks what a unit test can't: whether the API path agrees with the TSV
 * path, not just whether the mapping looks right in isolation.
 *
 * Gated on `VITE_API_URL` actually being configured AND reachable:
 * - Unset: skipped entirely, no network attempted.
 * - Set but not answering: the load resolves to `undefined` and the test
 *   skips itself - a stopped local backend isn't a broken test.
 * - Set and reachable: the real comparison runs, row by row.
 */

const API_URL = import.meta.env.VITE_API_URL;

/** Everything loadOrganizationsFromApi() maps from the API response, in the
 *  same shape the TSV path produces. Unlike territory there are no
 *  derived/rolled-up values to exclude and no group/leaf split. */
const FIELDS = [
  'codeDisplay',
  'nameDisplay',
  'nameEndonym',
  'names',
  'url',
  'collectorType',
  'parentID',
  'hqID',
] as const satisfies readonly (keyof OrganizationData)[];

function valuesMatch(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

describe.skipIf(!API_URL)('organization API/TSV parity', () => {
  it('agrees with the TSV path on every field of all organizations', async (ctx) => {
    const server = await getServer();
    // organizations.tsv isn't in getServer()'s default file list, so it needs
    // registering here for the TSV side of the comparison.
    server.use(
      await makeFileAvailable('data/tc/organizations.tsv'),
      http.get(`${API_URL}/*`, () => passthrough()),
    );

    vi.stubEnv('VITE_API_URL', API_URL);
    const fromApi = await loadOrganizations();

    if (!fromApi) {
      // Configured but not answering right now - not the same thing as the
      // two paths disagreeing.
      vi.unstubAllEnvs();
      ctx.skip();
      return;
    }

    // vi.unstubAllEnvs() reverts to the .env file's own value, which is this
    // same API_URL on any machine that already has it set - so unstubbing
    // alone would silently hit the API again instead of loading from files.
    vi.stubEnv('VITE_API_URL', '');
    const fromFiles = await loadOrganizations();
    vi.unstubAllEnvs();
    if (!fromFiles) throw new Error('TSV organization load failed');

    expect(Object.keys(fromApi).sort()).toEqual(Object.keys(fromFiles).sort());

    const mismatches: string[] = [];
    for (const id of Object.keys(fromFiles)) {
      const api = fromApi[id];
      const file = fromFiles[id];

      for (const field of FIELDS) {
        if (!valuesMatch(api[field], file[field])) {
          mismatches.push(
            `${id} (${file.nameDisplay}).${field}: api=${JSON.stringify(api[field])} file=${JSON.stringify(file[field])}`,
          );
        }
      }
    }
    expect(mismatches).toEqual([]);
  }, 30_000);
});
