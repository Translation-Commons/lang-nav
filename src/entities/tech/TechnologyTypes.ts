import type { KeyboardData } from '@entities/keyboard/KeyboardTypes';
import type { LanguageData } from '@entities/language/LanguageTypes';
import type { OrganizationData } from '@entities/org/OrganizationTypes';
import { TerritoryData } from '@entities/territory/TerritoryTypes';
import { EntityBase, EntityType } from '@entities/types/EntityTypes';
import { WritingSystemData } from '@entities/writingsystem/WritingSystemTypes';

export enum TechScope {
  Unknown,
  OperatingSystem = 'OS', // eg. Android, iOS
  Product = 'Product', // eg. Telegram, Facebook
  Application = 'App', // Telegram for iOS, Facebook for Android
  MachineLearningModel = 'ML', // eg. Google Translate
  InputMethod = 'Input', // eg. GBoard
  Database = 'DB', // eg CLDR
}

export type TechSupportData = {
  // imported values
  techShortName: string;
  languageCodePath: string; // e.g. "man/bam" when Google lists grouped or alternate code paths
  name: string;
  territoryCode?: string; // ideally a standardized territory code, e.g., "US", "FR"
  writingSystemCode?: string; // ideally a standardized script code, e.g., "Latn", "Cyrl", "Arab"
  notes?: string;
  // potential room to add "level"

  // References
  tech: TechnologyData;
  lang?: LanguageData;
  territory?: TerritoryData;
  writingSystem?: WritingSystemData;
};

export interface TechnologyData extends EntityBase {
  type: EntityType.Technology;
  ID: string; // A stable ID to use with indexing, eg. "tech.Android" -- should always be prefixed by `tech.` to avoid conflicts
  codeDisplay: string; // The short name eg. "Android" "FB4A"
  nameDisplay: string; // long name eg. "Android" "Facebook for Android"
  scope: TechScope; // The scope of the platform (OS, Product, App, ML, DB)

  population?: number; // The number of users or installations of the tech, if known
  populationSource?: string; // The source of the population data as a URL

  // Codes referencing other entities (imported from the tsv)
  organizationCode: string; // The code of the organization responsible for the platform
  parentTechCode?: string; // The code of the parent platform, if any
  relatedTechCodes?: string[]; // The codes of related platforms, if any

  languageSupportURL?: string;
  languageSupportLastUpdated?: Date;

  // Hydrated references
  organization?: OrganizationData; // fb4a -> Meta
  parentTech?: TechnologyData; // fb4a -> Facebook
  childTechs?: TechnologyData[]; // Facebook -> [fb4a, fbios, ...]
  relatedTechs?: TechnologyData[]; // fb4a -> Android
  keyboards?: KeyboardData[]; // Gboard -> GBoard keyboard entities
  // languages: LanguageData[]; // The languages the technology supports, in the future we will want more fine-grained data
  languageSupport?: TechSupportData[];
}
