/**
 * This file provides types for the data used in the application.
 */

import { ObjectType } from '@features/params/PageParamTypes';

import { CensusData } from '../census/CensusTypes';
import { LanguageCode, LanguageData } from '../language/LanguageTypes';

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
  | VariantTagData;
export type ObjectDictionary = Record<string, ObjectData>;

// ISO 3166 territory code OR UN M49 code
export type TerritoryCode = ISO3166Code | UNM49Code;
export type ISO3166Code = string; // ISO 3166-1 alpha-2 code, eg. US, CA, etc.
export type UNM49Code = string; // UN M49 code, eg. 001, 150, 419, etc.

export enum TerritoryScope {
  World = 'World',
  Continent = 'Continent',
  Region = 'Region',
  Subcontinent = 'Sub-continent',
  Country = 'Country',
  Dependency = 'Dependency',
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

export type ScriptCode = string; // ISO 15924 script code, eg. Latn, Cyrl, etc.

export enum WritingSystemScope {
  Group = 'Group',
  IndividualScript = 'Individual script',
  Variation = 'Variation',
  SpecialCode = 'Special Code',
}

export interface WritingSystemData extends ObjectBase {
  type: ObjectType.WritingSystem;

  ID: ScriptCode;
  codeDisplay: ScriptCode; // This should be stable
  scope: WritingSystemScope;

  nameDisplay: string;
  nameDisplayOriginal?: string;
  nameFull?: string;
  nameEndonym?: string;
  names: string[];

  unicodeVersion?: number;
  sample?: string;
  rightToLeft?: boolean;
  primaryLanguageCode?: LanguageCode;
  territoryOfOriginCode?: TerritoryCode;
  parentWritingSystemCode?: ScriptCode;
  containsWritingSystemsCodes?: ScriptCode[];

  // Derived when combining data
  populationUpperBound?: number;
  populationOfDescendants?: number;

  // References to other objects, filled in after loading the TSV
  primaryLanguage?: LanguageData;
  territoryOfOrigin?: TerritoryData;
  languages?: Record<LanguageCode, LanguageData>;
  localesWhereExplicit?: LocaleData[];
  parentWritingSystem?: WritingSystemData;
  childWritingSystems?: WritingSystemData[];
  containsWritingSystems?: WritingSystemData[];
}

// BCP-47 Locale	Locale Display Name	Native Locale Name	Language Code	Territory ISO	Explicit Script	Variant IANA Tag	Pop Source	Best Guess	Official Language
export type BCP47LocaleCode = string; // BCP-47 formatted locale, eg. en_US, fr_CA, etc.

export enum PopulationSourceCategory {
  // From inputted data
  Official = 'Official', // Has a cited source
  UnverifiedOfficial = 'Unverified Official', // Source lost in merge but allegedly official
  Study = 'Study',
  Ethnologue = 'Ethnologue',
  EDL = 'EDL', // Endangered Languages Project
  CLDR = 'CLDR', // Unicode's Common Locale Data Repository
  Other = 'Other',
  NoSource = '',

  // Algorithmically derived
  AggregatedFromTerritories = 'Aggregated from Territories',
  AggregatedFromLanguages = 'Aggregated from Languages',
  Algorithmic = 'Algorithmic', // not further specified
}

export enum OfficialStatus {
  Official = 'official',
  DeFactoOfficial = 'de_facto_official',
  Recognized = 'recognized',
  OfficialRegionally = 'official_regional',
  RecognizedRegionally = 'recognized_regional',
}

export type LocaleInCensus = {
  census: CensusData;
  populationEstimate: number;
  populationPercent: number;
};

export enum LocaleSource {
  StableDatabase = 'StableDatabase', // the standard source, kept in locales.tsv
  IANA = 'IANA', // created when importing IANA variant tags
  Census = 'census', // created when importing census data
  CreateRegionalLocales = 'createRegionalLocales', // created when generating aggregated regional locales
}

export interface LocaleData extends ObjectBase {
  type: ObjectType.Locale;

  ID: BCP47LocaleCode;
  codeDisplay: BCP47LocaleCode; // Changes based on the language schema
  localeSource: LocaleSource;

  nameDisplay: string;
  nameEndonym?: string;
  languageCode: LanguageCode;
  territoryCode?: TerritoryCode;
  scriptCode?: ScriptCode;
  variantTagCodes?: VariantIANATag[];

  populationSource?: PopulationSourceCategory;
  populationSpeaking?: number;
  officialStatus?: OfficialStatus;
  wikipedia?: WikipediaData;

  // References to other objects, filled in after loading the TSV
  language?: LanguageData;
  territory?: TerritoryData;
  writingSystem?: WritingSystemData;
  variantTags?: VariantTagData[];

  // References to other locales
  relatedLocales?: {
    lessSpecific?: LocaleData[]; // Locales that are less specific forms of this locale (eg. zh_Hant_SG -> zh_Hant or zh_SG)
    parentTerritory?: LocaleData; // The locale for the parent territory containing this locale's territory
    parentLanguage?: LocaleData; // The locale for the parent language family containing this locale's language
    moreSpecific?: LocaleData[]; // Locales that are more specific forms of this locale (eg. zh_SG -> zh_Hant_SG, zh_Hans_SG)
    childTerritories?: LocaleData[]; // Locales that represent subdivisions of this locale's territory
    childLanguages?: LocaleData[]; // Locales that represent child/descendant languages of this locale's language
  };

  // Data computed from other references, particularly territories.tsv and censuses
  populationAdjusted?: number; // Speaking population adjusted to latest territory population
  populationOfLocalesWithinThisTerritory?: number;
  populationOfLocalesWithinThisLanguage?: number;
  populationSpeakingPercent?: number;
  literacyPercent?: number;
  populationWriting?: number;
  populationWritingPercent?: number;
  populationCensus?: CensusData; // The census record that provides the population estimate
  censusRecords?: LocaleInCensus[]; // Maps census ID to population estimate
}

export type VariantIANATag = string; // IANA tag, eg. valencia in cat-ES-valencia
export interface VariantTagData extends ObjectBase {
  type: ObjectType.VariantTag;
  ID: VariantIANATag;
  codeDisplay: VariantIANATag;
  nameDisplay: string;
  description?: string;

  dateAdded?: Date;
  prefixes: string[]; // Usually language codes but sometimes composites like zh-Latn or oc-lengadoc
  languageCodes: LanguageCode[]; // zh, oc, etc.
  localeCodes: BCP47LocaleCode[]; // would look like zh-Latn-pinyin or oc-lengadoc-grclass

  // References to other objects
  languages: LanguageData[];
  locales: LocaleData[];
}

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
  localeCode: BCP47LocaleCode; // eg. eng, fra, mis, lzh, bany1247
  articles: number;
  activeUsers: number;
  url: string;
};
