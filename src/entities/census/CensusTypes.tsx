import { ObjectType } from '@features/params/PageParamTypes';

import { LanguageCode, LanguageModality } from '../language/LanguageTypes';
import { ObjectBase, TerritoryCode, TerritoryData } from '../types/DataTypes';

// Unique identifier for the census or other source of population data
export type CensusID = string; // eg. 'ca2021.2', 'us2013.1'

// Ranked by priority
export enum CensusCollectorType {
  Government = 'Government',
  Study = 'Study', // Academic study
  NGO = 'NGO', // Non-governmental organization eg. Endangered Languages Project, Joshua Project
  Media = 'Media', // News article, blog, or other media sources
  CLDR = 'CLDR',
}

export interface CensusData extends ObjectBase {
  type: ObjectType.Census;
  ID: CensusID;
  codeDisplay: CensusID;

  // Required metadata
  eligiblePopulation: number; // The total number of qualified individuals
  nameDisplay: string;
  isoRegionCode: TerritoryCode;
  yearCollected: number; // eg. 2021, 2013
  collectorType: CensusCollectorType; // Type of organization (e.g., Government, CLDR)

  // Kind of language data collected
  modality?: LanguageModality; // eg. Spoken, Written, Sign
  proficiency?: string; // eg. Conversant or Learning, Fluent, Non-Fluent
  acquisitionOrder?: string; // eg. Any, L1, L2, L3
  domain?: string; // eg. Any, Home, School, Work, Community, Unspecified

  // Data limitations
  languagesIncluded?: string; // eg. All, Indigenous, Official
  geographicScope?: string; // eg. Whole Country, Mainland, Territories
  age?: string; // eg. 0+, 4+,
  gender?: string; // Any, Male, Female
  nationality?: string; // eg. Citizens, Residents, Visitors
  residentLocation?: string; // eg. de jure (people located by their usual residence), de facto (people located immediately, including visitors)
  sampleRate?: number; // eg. .1, .25, 1 (for 10%, 25%, 100%)
  respondingPopulation?: number; // The number of individuals who gave a response about their language
  responsesPerIndividual?: string; // eg. 1, 1+, 2+
  quantity?: 'count' | 'percent'; // Whether the data is given as a count of people (e.g., 1000) or a percentage of the overall population (e.g., 50%)
  notes?: string; // Any additional notes about the census

  // Source
  url?: string; // Most important to have, so people can find the original data
  datePublished?: Date;
  dateAccessed?: Date;
  collectorName?: string; // Name of the organization or journal presenting the data
  author?: string; // Name of the individual author(s) if applicable
  tableName?: string;
  columnName?: string;
  citation?: string; // The full citation, may be redundant if other fields are filled in

  // Some fields derived as the data is imported
  languageCount: number; // Number of languages in this collection
  languageEstimates: Record<LanguageCode, number>; // Language code to population estimate mapping

  // Connections to other objects loaded after the fact
  territory?: TerritoryData;
}

export const getCensusCollectorTypeRank = (collectorType: CensusCollectorType): number => {
  switch (collectorType) {
    case CensusCollectorType.Government:
      return 1; // Highest priority
    case CensusCollectorType.Study:
      return 2;
    case CensusCollectorType.NGO:
      return 3;
    case CensusCollectorType.Media:
      return 4;
    case CensusCollectorType.CLDR:
      return 5; // Low priority
    default:
      return 6; // Unknown or unranked
  }
};
