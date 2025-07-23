import { ObjectBase, TerritoryCode, TerritoryData } from './DataTypes';
import { LanguageCode } from './LanguageTypes';
import { ObjectType } from './PageParamTypes';

// Unique identifier for the census or other source of population data
export type CensusID = string; // eg. 'ca2021.2', 'us2013.1'
export enum CensusCollectorType {
  Government = 'Government',
  CLDR = 'CLDR',
  Study = 'Study',
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
  modality?: string; // eg. Spoken, Written, Sign
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
  notes?: string; // Any additional notes about the census

  // Source
  citation?: string;
  tableName?: string;
  columnName?: string;
  datePublished?: Date;
  dateAccessed?: Date;
  url?: string;
  collectorName?: string; // Name of the organization or person who collected the data

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
      return 2; // Medium priority
    case CensusCollectorType.CLDR:
      return 3; // Lowest priority
    default:
      return 4; // Unknown or unranked
  }
};
