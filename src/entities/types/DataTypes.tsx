/**
 * This file provides types for the data used in the application.
 */

import { ObjectType } from '@features/params/PageParamTypes';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LocaleData, StandardLocaleCode } from '@entities/locale/LocaleTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { VariantTagData } from '@entities/varianttag/VariantTagTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

import { CensusData } from '../census/CensusTypes';
import { LanguageData } from '../language/LanguageTypes';

export interface ObjectBase {
  readonly type: ObjectType;
  readonly ID: string; // A stable ID to use with indexing
  codeDisplay: string; // The code for the object -- may change, like if the language schema changes
  nameDisplay: string; // The name for the object -- may change with data from different sources
  nameEndonym?: string;
  names: string[];
}

export type ObjectData =
  | CensusData
  | LanguageData
  | LocaleData
  | TerritoryData
  | WritingSystemData
  | VariantTagData
  | KeyboardData;
export type ObjectDictionary = Record<string, ObjectData>;

export enum WikipediaStatus {
  Active = 'Active',
  Closed = 'Closed',
  Incubator = 'Incubator',
}

export type WikipediaData = {
  titleEnglish: string;
  titleLocal: string;
  status: WikipediaStatus;
  languageName: string;
  scriptCodes: ScriptCode[];
  wikipediaSubdomain: string; // eg. en, fr, simple, zh-classical, map-bms
  localeCode: StandardLocaleCode; // eg. eng, fra, mis, lzh, bany1247
  articles: number;
  activeUsers: number;
  url: string;
};
