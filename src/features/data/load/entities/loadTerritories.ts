import { ObjectType } from '@features/params/PageParamTypes';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { parseTerritoryScope } from '@strings/TerritoryScopeStrings';

import { isApiEnabled } from '../api/apiConfig';
import { loadTerritoriesFromApi } from '../api/loadTerritoriesFromApi';

import { loadObjectsFromFile } from './loadObjectsFromFile';

export async function loadTerritories(): Promise<Record<string, TerritoryData> | void> {
  // With VITE_API_URL set, one request replaces this file AND the four
  // supplemental territory files, which SupplementalData.tsx then skips.
  if (isApiEnabled()) {
    return await loadTerritoriesFromApi();
  }
  return await loadObjectsFromFile<TerritoryData>('data/tc/territories.tsv', parseTerritoryLine);
}

export function parseTerritoryLine(line: string): TerritoryData {
  const parts = line.split('\t');
  const population = parts[3] != '' ? Number.parseInt(parts[3].replace(/,/g, '')) : 0;

  return {
    type: ObjectType.Territory,

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
