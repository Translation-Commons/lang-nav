import { defineEndpoint } from '@features/data/api/core/defineEndpoint';
import {
  BaseRow,
  EntityRef,
  TablePage,
  toBasePageQuery,
} from '@features/data/api/list/tableContract';
import { useTablePageFromFiles } from '@features/data/api/list/useTablePageFromFiles';
import { useDataContext } from '@features/data/context/useDataContext';
import { PageParams } from '@features/params/PageParamTypes';
import { getLanguageFamiliesRelevantToEntity } from '@features/transforms/filtering/filterByConnections';

import { getWritingSystemsInEntity } from '@entities/lib/getEntityMiscFields';
import {
  getTerritoryBiggestLocale,
  getTerritoryChildren,
  getTerritoryCountries,
} from '@entities/lib/getEntityRelatedTerritories';
import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';

import { sumBy, uniqueBy } from '@shared/lib/setUtils';

/** One row of the Territories table: the contract for GET territories/. */
export type TerritoryRow = BaseRow & {
  scope: TerritoryScope;
  codeAlpha3?: string;
  codeNumeric?: string;
  otherNames: string[];
  population?: number;
  populationWriting?: number;
  literacyPercent?: number;
  censusCount: number;
  /** Undefined when the territory has no locales, which renders as an empty cell. */
  languageNames?: string[];
  biggestLanguage?: EntityRef;
  biggestLanguagePercent?: number;
  languages: EntityRef[];
  languageFamilies: EntityRef[];
  writingSystemNames: string[];
  unRegion?: EntityRef;
  childTerritoryNames: string[];
  countryNames: string[];
  dependenciesPopulation?: number;
  latitude?: number;
  longitude?: number;
  landArea?: number;
};

export type TerritoryList = TablePage<TerritoryRow>;
export type TerritoryListQuery = Record<string, string>;

const ref = (ent: { ID: string; nameDisplay: string }): EntityRef => ({
  id: ent.ID,
  name: ent.nameDisplay,
});

export function toTerritoryRow(t: TerritoryData): TerritoryRow {
  const biggestLocale = getTerritoryBiggestLocale(t);
  return {
    id: t.ID,
    code: t.codeDisplay,
    name: t.nameDisplay,
    endonym: t.nameEndonym,
    scope: t.scope,
    codeAlpha3: t.codeAlpha3 || undefined,
    codeNumeric: t.codeNumeric || t.ID.match(/\d{3}/)?.[0],
    otherNames: [...(t.nameOtherEndonyms ?? []), ...(t.nameOtherExonyms ?? [])].filter(
      (n) => n !== t.nameDisplay && n !== t.nameEndonym,
    ),
    population: t.pop.overall,
    populationWriting: t.pop.writing,
    literacyPercent: t.literacyPercent,
    censusCount: t.censuses?.length ?? 0,
    languageNames: t.locales?.map((l) => l.language?.nameDisplay ?? l.nameDisplay),
    biggestLanguage: biggestLocale && {
      id: biggestLocale.ID,
      name: biggestLocale.language?.nameDisplay ?? biggestLocale.languageCode,
    },
    biggestLanguagePercent: biggestLocale?.pop.speaking.percent,
    languages: uniqueBy(t.locales ?? [], (l) => l.languageCode).flatMap((l) =>
      l.language ? [ref(l.language)] : [],
    ),
    languageFamilies: (getLanguageFamiliesRelevantToEntity(t) ?? [])
      .filter((lf) => lf.parentLanguage == null)
      .map(ref),
    writingSystemNames: (getWritingSystemsInEntity(t) ?? []).map((ws) => ws.nameDisplay),
    unRegion: t.parentUNRegion && ref(t.parentUNRegion),
    childTerritoryNames: getTerritoryChildren(t).map((c) => c.nameDisplay),
    countryNames: getTerritoryCountries(t).map((c) => c.nameDisplay),
    dependenciesPopulation: t.dependentTerritories?.length
      ? sumBy(t.dependentTerritories, (d) => d.pop.overall ?? 0)
      : undefined,
    latitude: t.latitude,
    longitude: t.longitude,
    landArea: t.landArea,
  };
}

/** The page params GET territories/ must honor. */
export function toTerritoryListQuery(params: PageParams): TerritoryListQuery {
  return { ...toBasePageQuery(params), territoryScopes: params.territoryScopes.join(',') };
}

function useTerritoryListFromFiles() {
  return useTablePageFromFiles(useDataContext().territories, toTerritoryRow);
}

export const useTerritoryList = defineEndpoint(
  'territoryList',
  'territories/',
  useTerritoryListFromFiles,
);
