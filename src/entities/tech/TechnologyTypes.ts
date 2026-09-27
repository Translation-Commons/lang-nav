import type { OrganizationData } from '@entities/org/OrganizationTypes';
import { EntityBase, EntityType } from '@entities/types/EntityTypes';

export enum TechScope {
  Unknown,
  OperatingSystem = 'OS', // eg. Android, iOS
  Product = 'Product', // eg. Telegram, Facebook
  Application = 'App', // Telegram for iOS, Facebook for Android
  MachineLearningModel = 'ML', // eg. Google Translate
  InputMethod = 'Input', // eg. GBoard
  Database = 'DB', // eg CLDR
}

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

  // Hydrated references
  organization?: OrganizationData; // fb4a -> Meta
  parentTech?: TechnologyData; // fb4a -> Facebook
  childTechs?: TechnologyData[];
  relatedTechs?: TechnologyData[]; // fb4a -> Android
}
