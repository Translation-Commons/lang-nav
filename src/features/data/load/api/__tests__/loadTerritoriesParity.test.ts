import { http, passthrough } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { isTerritoryGroup, TerritoryData } from '@entities/territory/TerritoryTypes';

import { getServer, makeFileAvailable } from '@tests/testServer';

import { loadTerritories } from '../../entities/loadTerritories';
import { loadCountryCoordinates } from '../../supplemental/loadCountryCoordinates';
import { loadLandArea } from '../../supplemental/loadLandArea';
import { loadTerritoryGDPLiteracy } from '../../supplemental/loadTerritoryGDPLiteracy';
import { loadTerritoryNames } from '../../supplemental/loadTerritoryNames';

/**
 * This is the check `loadTerritoriesFromApi.test.ts` explicitly says it cannot
 * do: whether the API path agrees with the TSV path, not just whether the
 * mapping looks right in isolation. See docs/api-data-source.md#verifying-a-change.
 *
 * It needs a real backend, so it is gated on `VITE_API_URL` actually being
 * configured AND reachable:
 * - Unset (the default for anyone who hasn't touched the backend migration):
 *   the whole describe block is skipped, no network attempted.
 * - Set but the server isn't answering (e.g. PostgREST not started locally):
 *   the API load resolves to `undefined`, same as it would for the app, and
 *   the test skips itself rather than failing - a stopped local backend isn't
 *   a broken test.
 * - Set and reachable: this is the real, 289-row comparison, run for real
 *   instead of by hand.
 */

const API_URL = import.meta.env.VITE_API_URL;

/** Rolled up by D3 for the 32 group territories (World, continents, regions,
 *  subcontinents). The API withholds these there so the browser's
 *  `computeContainedTerritoryStats` can fill them via `??=` instead - see the
 *  "GROUPS ARE SERVED RAW" comment in `loadTerritoriesFromApi.ts`. Leaves are
 *  unaffected: their values come from the source files on both paths. */
const LEAF_ONLY_FIELDS = ['literacyPercent', 'gdp', 'landArea', 'latitude', 'longitude'] as const;

/** Everything loadTerritories() plus the four TSV supplements assign, in the
 *  same shape loadTerritoriesFromApi() maps the API response into. */
const ALWAYS_FIELDS = [
  'codeDisplay',
  'codeAlpha3',
  'codeNumeric',
  'nameDisplay',
  'scope',
  'nameEndonym',
  'nameOtherEndonyms',
  'nameOtherExonyms',
  'names',
  'containedUNRegionCode',
  'sovereignCode',
] as const satisfies readonly (keyof TerritoryData)[];

/** Assembles territories exactly as SupplementalData.tsx does when
 *  isApiEnabled() is false: the base TSV parse, then the four supplemental
 *  loaders that fill in what a single API request returns in one shot. */
async function loadFromFiles(): Promise<Record<string, TerritoryData>> {
  const territories = await loadTerritories();
  if (!territories) throw new Error('TSV territory load failed');
  const getTerritory = (id: string) => territories[id];
  await Promise.all([
    loadTerritoryGDPLiteracy(getTerritory),
    loadCountryCoordinates(getTerritory),
    loadLandArea(getTerritory),
    loadTerritoryNames(getTerritory),
  ]);
  return territories;
}

function valuesMatch(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

describe.skipIf(!API_URL)('territory API/TSV parity', () => {
  it('agrees with the TSV path on every field of all 289 territories', async (ctx) => {
    const server = await getServer();
    server.use(
      await makeFileAvailable('data/other_sources/territories_gdp_literacy.tsv'),
      await makeFileAvailable('data/other_sources/country-coord.csv'),
      await makeFileAvailable('data/wiki/country_land_area.tsv'),
      await makeFileAvailable('data/wiki/territory_names.tsv'),
      http.get(`${API_URL}/*`, () => passthrough()),
    );

    vi.stubEnv('VITE_API_URL', API_URL);
    const fromApi = await loadTerritories();
    vi.unstubAllEnvs();

    if (!fromApi) {
      // Configured but not answering right now (e.g. PostgREST not started
      // locally) - not the same thing as the two paths disagreeing.
      ctx.skip();
      return;
    }

    const fromFiles = await loadFromFiles();

    expect(Object.keys(fromApi).sort()).toEqual(Object.keys(fromFiles).sort());

    const mismatches: string[] = [];
    for (const id of Object.keys(fromFiles)) {
      const api = fromApi[id];
      const file = fromFiles[id];
      const isGroup = isTerritoryGroup(file.scope);

      const check = (label: string, apiValue: unknown, fileValue: unknown) => {
        if (!valuesMatch(apiValue, fileValue)) {
          mismatches.push(
            `${id} (${file.nameDisplay}).${label}: api=${JSON.stringify(apiValue)} file=${JSON.stringify(fileValue)}`,
          );
        }
      };

      for (const field of ALWAYS_FIELDS) {
        check(field, api[field], file[field]);
      }
      if (!isGroup) {
        for (const field of LEAF_ONLY_FIELDS) {
          check(field, api[field], file[field]);
        }
      }

      check('pop.overall', api.pop.overall, file.pop.overall);
      check('pop.fromUN', api.pop.fromUN, file.pop.fromUN);
      if (!isGroup) {
        check('pop.speaking', api.pop.speaking, file.pop.speaking);
        check('pop.writing', api.pop.writing, file.pop.writing);
      }
    }
    expect(mismatches).toEqual([]);
  }, 30_000);
});
