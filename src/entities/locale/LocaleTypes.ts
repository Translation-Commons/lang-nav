import { ObjectType } from '@features/params/PageParamTypes';

import { CensusData } from '@entities/census/CensusTypes';
import { LanguageCode, LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryCode, TerritoryData } from '@entities/territory/TerritoryTypes';
import { ObjectBase, WikipediaData } from '@entities/types/DataTypes';
import { VariantIANATag, VariantTagData } from '@entities/varianttag/VariantTagTypes';
import { ScriptCode, WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

/**
 * Standard locale code for the app following the BCP-47 convention with some departures:
 *   Underscores separate
 *   Languages prefer 3-letter ISO codes, otherwise Glottocodes
 *   Writing systems always use ISO 15924 codes as usual
 *   Territories ISO 3166-1 alpha-2 codes or UN M49 codes
 *   Variant tags are added at the end, separated by underscores, and can be any IANA-registered tag
 *
 * TODO: Make the type stricter than string
 */
export type StandardLocaleCode = string;

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

export enum LocaleSource {
  StableDatabase = 'StableDatabase', // the standard source, kept in locales.tsv
  IANA = 'IANA', // created when importing IANA variant tags
  Census = 'census', // created when importing census data
  CreateRegionalLocales = 'createRegionalLocales', // created when generating aggregated regional locales
  CreateFamilyLocales = 'createFamilyLocales', // created when generating locales for language families
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

  ID: StandardLocaleCode;
  codeDisplay: StandardLocaleCode; // Changes based on the language schema
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
  langFormedHere?: boolean; // Whether the language was formed in this territory, as opposed to being imported through state expansion, migration, etc.
  historicPresence?: boolean; // Whether the language or its antecedents were established in this territory before 1500 CE, as a rough proxy for indigeneity
  wikipedia?: WikipediaData;

  // References to other objects, filled in after loading the TSV
  language?: LanguageData;
  territory?: TerritoryData;
  writingSystem?: WritingSystemData;
  variantTags?: VariantTagData[];

  // References to other locales
  relatedLocales?: {
    moreGeneral?: LocaleData[]; // Locales that are less specific forms of this locale (eg. zh_Hant_SG -> zh_Hant or zh_SG)
    parentTerritory?: LocaleData; // The locale for the parent territory containing this locale's territory
    parentLanguage?: LocaleData; // The locale for the parent language family containing this locale's language
    moreSpecific?: LocaleData[]; // Locales that are more specific forms of this locale (eg. zh_SG -> zh_Hant_SG, zh_Hans_SG)
    childTerritories?: LocaleData[]; // Locales that represent subdivisions of this locale's territory
    childLanguages?: LocaleData[]; // Locales that represent child/descendant languages of this locale's language

    sumOfPopulationFromChildTerritories?: number;
    sumOfPopulationFromChildLanguages?: number;
  };

  // Data computed from other references, particularly territories.tsv and censuses
  populationAdjusted?: number; // Speaking population adjusted to latest territory population
  populationSpeakingPercent?: number;
  literacyPercent?: number;
  populationWriting?: number;
  populationWritingPercent?: number;
  populationCensus?: CensusData; // The census record that provides the population estimate
  censusRecords?: LocaleInCensus[]; // Maps census ID to population estimate
}
