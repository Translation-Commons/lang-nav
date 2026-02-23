/**
 * Enums and types related to territories, which are the main geographic unit in the app.
 */

import { ObjectType } from '@features/params/PageParamTypes';

import { CensusData } from '@entities/census/CensusTypes';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { ObjectBase } from '@entities/types/DataTypes';

// ISO 3166 territory code OR UN M49 code
export type TerritoryCode = ISO3166Code | UNM49Code;
export type ISO3166Code = string; // ISO 3166-1 alpha-2 code, eg. US, CA, etc.
export type UNM49Code = string; // UN M49 code, eg. 001, 150, 419, etc.

export enum TerritoryScope {
  World = 6, // larger value = broader scope
  Continent = 5,
  Region = 4, // eg, Latin America, Middle East, etc.
  Subcontinent = 3,
  Country = 2,
  Dependency = 1,
  // 0 is intentionally not included to avoid problems using truthy comparisons
}

export const isTerritoryGroup = (scope?: TerritoryScope): boolean => {
  return (
    scope != null &&
    [
      TerritoryScope.World,
      TerritoryScope.Continent,
      TerritoryScope.Region,
      TerritoryScope.Subcontinent,
    ].includes(scope)
  );
};

export interface TerritoryData extends ObjectBase {
  type: ObjectType.Territory;
  ID: TerritoryCode;
  codeDisplay: TerritoryCode;
  codeAlpha3?: string; // ISO 3166-1 alpha-3 code, eg. USA, CAN, etc.
  codeNumeric?: string; // ISO 3166-1 numeric code, eg. 840, 124, etc.

  nameDisplay: string;
  scope: TerritoryScope;
  population: number; // May be reduced when re-computing with dependent territories
  populationFromUN: number; // Imported by the TSV

  // Supplemental data
  nameEndonym?: string;
  nameOtherEndonyms?: string[];
  nameOtherExonyms?: string[];
  containedUNRegionCode?: UNM49Code;
  sovereignCode?: ISO3166Code;
  literacyPercent?: number;
  gdp?: number;
  latitude?: number;
  longitude?: number;
  landArea?: number; // in square kilometers

  // References to other objects, filled in after loading the TSV
  parentUNRegion?: TerritoryData;
  containsTerritories?: TerritoryData[];
  sovereign?: TerritoryData;
  dependentTerritories?: TerritoryData[];
  locales?: LocaleData[];
  censuses?: CensusData[];
}
