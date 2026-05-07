/**
 * This file provides types for the data used in the application.
 */

import { ObjectType } from '@features/params/PageParamTypes';

import { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import { LocaleData, StandardLocaleCode } from '@entities/locale/LocaleTypes';
import { OrganizationData } from '@entities/org/OrganizationTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { VariantData } from '@entities/variant/VariantTypes';
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

export type EntityData =
  | CensusData
  | LanguageData
  | LocaleData
  | TerritoryData
  | WritingSystemData
  | VariantData
  | KeyboardData
  | OrganizationData;
export type ObjectData = EntityData; // For now, all objects are entities
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

export type UniversalDeclarationOfHumanRightsData = {
  languageCodePath: string; // e.g. "som/afas1238" for the Af-Marka dialect of Somali
  name: string; // e.g. "Af Marka"
  variant: string; // e.g. "Latn", "Cyrl", or "" for undifferentiated
  documentURL: string; // URL to the UDHR translation document -- maybe just the final path segment, like "af-marka" in "https://www.ohchr.org/en/human-rights/universal-declaration/translations/af-marka"
};
