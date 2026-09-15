import { EntityType } from '@features/params/PageParamTypes';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { parseTerritoryScope } from '@strings/TerritoryScopeStrings';

import { isApiEnabled } from '../api/apiConfig';
import { loadTerritoriesFromApi } from '../api/loadTerritoriesFromApi';

import { loadEntitiesFromFile } from './loadEntitiesFromFile';

/**
 * Whether the last `loadTerritories()` call actually got its data from the
 * API, as opposed to `VITE_API_URL` merely being set.
 *
 * `SupplementalData.tsx` reads this to decide whether to skip the four
 * supplemental territory files (GDP/literacy, coordinates, land area, names).
 * It cannot use `isApiEnabled()` for that on its own: with the API on but
 * unreachable, `loadTerritories` now falls back to `territories.tsv`, which
 * does NOT carry those four files' data. Skipping them in that case would
 * leave every territory quietly missing GDP, literacy, coordinates and land
 * area, with no error - worse than today's fallback, which at least shows
 * something. `isApiEnabled() && didTerritoryLoadFromApi()` is what
 * `SupplementalData.tsx` actually needs to ask.
 */
let loadedFromApi = false;

export function didTerritoryLoadFromApi(): boolean {
  return loadedFromApi;
}

export async function loadTerritories(): Promise<Record<string, TerritoryData> | void> {
  // With VITE_API_URL set, one request replaces this file AND the four
  // supplemental territory files, which SupplementalData.tsx then skips - but
  // only when this call actually reached the API; see `didTerritoryLoadFromApi`.
  if (isApiEnabled()) {
    const fromApi = await loadTerritoriesFromApi();
    if (fromApi != null) {
      loadedFromApi = true;
      return fromApi;
    }
    console.warn('Territory API load failed; falling back to TSV files.');
  }
  loadedFromApi = false;
  return await loadEntitiesFromFile<TerritoryData>('data/tc/territories.tsv', parseTerritoryLine);
}

export function parseTerritoryLine(line: string): TerritoryData {
  const parts = line.split('\t');
  const population = parts[3] != '' ? Number.parseInt(parts[3].replace(/,/g, '')) : 0;

  return {
    type: EntityType.Territory,

    ID: parts[0],
    codeDisplay: parts[0],
    nameDisplay: parts[1],
    names: [parts[1]],
    scope: parseTerritoryScope(parts[2])!, // Throw if its not a valid scope, since this is a required field
    pop: {
      overall: population,
      fromUN: population,
    },
    containedUNRegionCode: parts[4] || undefined,
    sovereignCode: parts[5] || undefined,
  };
}
