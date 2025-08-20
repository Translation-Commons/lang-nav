import { CensusData } from './CensusTypes';
import { LanguageCode, LanguageData } from './LanguageTypes';
import { ObjectType } from './PageParamTypes';

export interface ObjectBase {
  readonly type: ObjectType;
  readonly ID: string;
  codeDisplay: string;
  nameDisplay: string;
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

export type TerritoryCode = ISO3166Code | UNM49Code;
export type ISO3166Code = string; 
export type UNM49Code = string;

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
  nameDisplay: string;
  scope: TerritoryScope;
  population: number;
  containedUNRegionCode: UNM49Code;
  sovereignCode: ISO3166Code;

  literacyPercent?: number;
  gdp?: number;

  parentUNRegion?: TerritoryData;
  containsTerritories: TerritoryData[];
  sovereign?: TerritoryData;
  dependentTerritories: TerritoryData[];
  locales: LocaleData[];
  censuses: CensusData[];
}

export type ScriptCode = string;

export enum WritingSystemScope {
  Group = 'Group',
  IndividualScript = 'Individual script',
  Variation = 'Variation',
  SpecialCode = 'Special Code',
}

export interface WritingSystemData extends ObjectBase {
  type: ObjectType.WritingSystem;

  ID: ScriptCode;
  codeDisplay: ScriptCode;
  scope: WritingSystemScope;

  nameDisplayOriginal: string;
  nameFull: string;
  nameEndonym?: string;
  unicodeVersion: number | null;
  sample: string | null;
  rightToLeft: boolean | null;
  primaryLanguageCode: LanguageCode | null;
  territoryOfOriginCode: TerritoryCode | null;
  parentWritingSystemCode: ScriptCode | null;
  containsWritingSystemsCodes: ScriptCode[];

  populationUpperBound: number;
  nameDisplay: string;
  populationOfDescendents: number;

  primaryLanguage?: LanguageData;
  territoryOfOrigin?: TerritoryData;
  languages: Record<LanguageCode, LanguageData>;
  localesWhereExplicit: LocaleData[];
  parentWritingSystem?: WritingSystemData;
  childWritingSystems: WritingSystemData[];
  containsWritingSystems: WritingSystemData[];
}

export type BCP47LocaleCode = string; 
export enum PopulationSourceCategory {
  Census = '1 Census',
  Study = '2 Study',
  Ethnologue = '3 Ethnologue',
  EDL = '4 EDL',
  OtherCitation = '5 Other',
  GeneralizedData = '6 Generalized Data',
  Fallback = '7 Fallback',
  NoSource = '',
  Aggregated = 'Aggregated',
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

export interface LocaleData extends ObjectBase {
  type: ObjectType.Locale;

  ID: BCP47LocaleCode;
  codeDisplay: BCP47LocaleCode; 
  localeSource: 'regularInput' | 'IANA' | 'census';

  nameDisplay: string;
  nameEndonym?: string;
  languageCode: LanguageCode;
  territoryCode: TerritoryCode;
  explicitScriptCode?: ScriptCode;
  
  variantTagCodes?: VariantIANATag[];

  variantTags?: VariantTagData[];

  populationSource: PopulationSourceCategory;
  populationSpeaking: number;
  officialStatus?: OfficialStatus;

  language?: LanguageData;
  territory?: TerritoryData;
  writingSystem?: WritingSystemData;
  containedLocales?: LocaleData[];
  variantTag?: VariantTagData;

  populationSpeakingPercent?: number;
  literacyPercent?: number;
  populationWriting?: number;
  populationWritingPercent?: number;
  populationCensus?: CensusData;
  censusRecords: LocaleInCensus[]; 
}

export type VariantIANATag = string;
export interface VariantTagData extends ObjectBase {
  type: ObjectType.VariantTag;
  ID: VariantIANATag;
  codeDisplay: VariantIANATag;
  nameDisplay: string;
  description?: string;

  dateAdded?: Date;
  prefixes: string[]; 
  languageCodes: LanguageCode[];
  localeCodes: BCP47LocaleCode[]; 

  languages: LanguageData[];
  locales: LocaleData[];
}
