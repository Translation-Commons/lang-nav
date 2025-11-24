import { ObjectType } from '@features/params/PageParamTypes';

import { TerritoryData, TerritoryScope } from '@entities/types/DataTypes';

import { loadObjectsFromFile } from './loadObjectsFromFile';

export async function loadTerritories(): Promise<Record<string, TerritoryData> | void> {
  return await loadObjectsFromFile<TerritoryData>('data/territories.tsv', parseTerritoryLine);
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
    scope: parts[2] as TerritoryScope,
    population, // This may be recomputed later
    populationFromUN: population,
    containedUNRegionCode: parts[4] || undefined,
    sovereignCode: parts[5] || undefined,
  };
}
